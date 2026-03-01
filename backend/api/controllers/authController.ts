import { Request, Response } from "express";
import { JsonDto } from "../../../shared/jsondto.js";
import nodemailer from "nodemailer";
import { UserDto } from "../../../shared/userdto.js";
import { OtpDto } from "../../../shared/otpdto.js";
import { AccessDto } from "../../../shared/accessdto.js";
import User from "../schema/user.js";
import jwt from "jsonwebtoken";
import UserOtp from "../schema/userOtp.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mailgun, { Options } from "nodemailer-mailgun-transport";

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

export const postGenerateOtp = async (req: Request<{}, {}, UserDto>, res: Response<JsonDto<{}>>) => {
  try {
    const existing = await UserOtp.findOne({ email: req.body.email });

    if (existing) {
      await UserOtp.findByIdAndDelete(existing._id);
    }

    let otpCode;
    if (req.body.email === "test@test.com") {
      otpCode = process.env.TEST_ACC_PW!;
    } else {
      otpCode = crypto.randomInt(100000, 1000000);
    }

    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otpCode.toString(), saltRounds);

    const userOtp = new UserOtp({ email: req.body.email, otp: hashedOtp });

    await userOtp.save();

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: req.body.email,
      subject: "Regimotion OTP Code!",
      html: `
              <div style="max-width: 600px; margin: 20px auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                <h2>Email Verification</h2>
                <p>Hello,</p>
                <p>Use the following One-Time Password (OTP) to complete your verification process. For your security, this code is valid for 5 minutes only.</p>
                <span style="font-size: 32px; font-weight: bold; color: #234452; text-align: center; padding: 15px 0; letter-spacing: 5px; background-color: #ffffff; border: 1px solid #eee; border-radius: 4px; display: block; width: fit-content; margin: 15px auto;">
                  ${otpCode} 
                </span>
                <p>If you did not request sthis code, please ignore this email.</p>
              </div>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const postVerifyOTP = async (req: Request<{}, {}, OtpDto>, res: Response<JsonDto<AccessDto>>) => {
  try {
    const userOtp = await UserOtp.findOne({ email: req.body.email });

    if (!userOtp) {
      return res.status(404).json({ error: "Otp not found" });
    }

    const isMatch = await bcrypt.compare(req.body.otp, userOtp.otp);

    if (!isMatch) {
      return res.status(403).json({ error: "Invalid otp" });
    }

    await UserOtp.findByIdAndDelete(userOtp._id);

    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let passkey = "";

    const randomBytes = crypto.randomBytes(16);

    for (let i = 0; i < 16; i++) {
      passkey += charset[randomBytes[i] % charset.length];
    }

    const saltRounds = 10;
    const hasedPasskey = await bcrypt.hash(passkey, saltRounds);

    const newUser = new User({ email: req.body.email, passkey: hasedPasskey });

    await newUser.save();

    const accessDto: AccessDto = { email: req.body.email, passkey: passkey };

    res.status(200).json({ data: accessDto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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
