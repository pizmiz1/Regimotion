import { Request, Response } from "express";
import { JsonDto } from "../../../shared/jsondto.js";
import nodemailer from "nodemailer";
import { OtpDto } from "../../../shared/otpdto.js";
import { AccessDto } from "../../../shared/accessdto.js";
import User from "../schema/user.js";
import jwt from "jsonwebtoken";
import UserOtp from "../schema/userOtp.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mailgun, { Options } from "nodemailer-mailgun-transport";
import Module from "../schema/module.js";
import UserSettings from "../schema/userSettings.js";
import mongoose from "mongoose";

const mailgunAuth: Options = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY!,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const transporter = nodemailer.createTransport(mailgun(mailgunAuth));

export const postAccessToken = async (req: Request<{}, {}, AccessDto>, res: Response<JsonDto<string>>) => {
  try {
    const users = await User.find({ email: req.body.email });

    if (users.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    let match = false;

    for (const user of users) {
      match = await bcrypt.compare(req.body.passkey, user.passkey);
      if (match) {
        break;
      }
    }

    if (!match) {
      return res.status(403).json({ error: "Invalid passkey" });
    }

    const token = jwt.sign(req.body, process.env.JWT_SECRET_KEY!, { expiresIn: process.env.JWT_EXPIRES_IN! as any });

    res.status(200).json({ data: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const postGenerateOtp = async (req: Request<{}, {}, OtpDto>, res: Response<JsonDto<{}>>) => {
  const session = await mongoose.startSession();

  try {
    const existing = await UserOtp.findOne({ email: req.body.email });

    let otpCode;
    if (req.body.email === "test@test.com") {
      otpCode = process.env.TEST_ACC_PW!;
    } else {
      otpCode = crypto.randomInt(100000, 1000000);
    }

    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otpCode.toString(), saltRounds);

    const userOtp = new UserOtp({ email: req.body.email, otp: hashedOtp });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: req.body.email,
      subject: "Regimotion OTP Code!",
      html: `
              <div style="max-width: 600px; margin: 20px auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; text-align: center;"> 
                <h2 style="margin-top: 0; color: #333;">Verification Code</h2>
                
                <!-- Code shown first -->
                <div style="font-size: 36px; font-weight: bold; color: #234452; padding: 20px; letter-spacing: 8px; background-color: #ffffff; border: 2px dashed #cbd5e0; border-radius: 8px; display: inline-block; margin: 10px auto 25px auto;"> 
                  ${otpCode} 
                </div>

                <!-- Supporting text follows -->
                <div style="text-align: left; color: #555; line-height: 1.6;">
                  <p><strong>Hello,</strong></p> 
                  <p>Please use the One-Time Password (OTP) above to complete your verification. For your security, this code is valid for <strong>5 minutes</strong> only.</p> 
                  <p style="font-size: 13px; color: #888; margin-top: 20px;">If you did not request this code, please ignore this email.</p> 
                </div>
              </div>
            `,
    };

    await transporter.sendMail(mailOptions);

    await session.withTransaction(async () => {
      if (existing) {
        await UserOtp.findByIdAndDelete(existing._id, { session });
      }
      await userOtp.save({ session });
    });

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await session.endSession();
  }
};

export const postVerifyOTP = async (req: Request<{}, {}, OtpDto>, res: Response<JsonDto<AccessDto>>) => {
  const session = await mongoose.startSession();

  try {
    if (!req.body.otp) {
      return res.status(400).json({ error: "Otp not provided" });
    }

    const userOtp = await UserOtp.findOne({ email: req.body.email });

    if (!userOtp) {
      return res.status(404).json({ error: "Otp not found" });
    }

    const isMatch = await bcrypt.compare(req.body.otp, userOtp.otp);

    if (!isMatch) {
      return res.status(403).json({ error: "Invalid otp" });
    }

    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let passkey = "";

    const randomBytes = crypto.randomBytes(16);

    for (let i = 0; i < 16; i++) {
      passkey += charset[randomBytes[i] % charset.length];
    }

    const saltRounds = 10;
    const hasedPasskey = await bcrypt.hash(passkey, saltRounds);

    const newUser = new User({ email: req.body.email, passkey: hasedPasskey });

    await session.withTransaction(async () => {
      await UserOtp.findByIdAndDelete(userOtp._id, { session });
      await newUser.save({ session });

      const existingUserSettings = await UserSettings.findOne({ userEmail: req.body.email });
      if (!existingUserSettings) {
        const newUserSettings = new UserSettings({
          userEmail: req.body.email,
          userName: "new monkey",
          userColor: "red",
          enableCompleteAnimation: true,
          enableHoldComplete: false,
        });
        await newUserSettings.save({ session });
      }
    });

    const accessDto: AccessDto = { email: req.body.email, passkey: passkey };

    res.status(200).json({ data: accessDto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await session.endSession();
  }
};

export const postSignOut = async (req: Request<{}, {}, AccessDto>, res: Response<JsonDto<any>>) => {
  try {
    const users = await User.find({ email: req.user!.email });

    if (users.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    let matchedUser;

    for (const user of users) {
      const match = await bcrypt.compare(req.body.passkey, user.passkey);
      if (match) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(403).json({ error: "Invalid passkey" });
    }

    await matchedUser.deleteOne();

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const postDeleteAccount = async (req: Request<{}, {}, AccessDto>, res: Response<JsonDto<any>>) => {
  const session = await mongoose.startSession();

  try {
    const users = await User.find({ email: req.user!.email });

    if (users.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    let validUser;

    for (const user of users) {
      const match = await bcrypt.compare(req.body.passkey, user.passkey);
      if (match) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      return res.status(403).json({ error: "Invalid passkey" });
    }

    await session.withTransaction(async () => {
      for (const user of users) {
        await user.deleteOne({ session });
      }
      await Module.deleteMany({ userEmail: req.user!.email }, { session });
      await UserSettings.deleteOne({ userEmail: req.user!.email }, { session });
    });

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await session.endSession();
  }
};
