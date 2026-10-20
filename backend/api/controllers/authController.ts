import { Request, Response } from "express";
import { JsonDto } from "../../../shared/jsondto.js";
import nodemailer from "nodemailer";
import { OtpDto } from "../../../shared/otpdto.js";
import { AccessDto } from "../../../shared/accessdto.js";
import User from "../schema/user.js";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import UserOtp from "../schema/userOtp.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mailgun, { Options } from "nodemailer-mailgun-transport";
import Module from "../schema/module.js";
import UserSettings from "../schema/userSettings.js";
import mongoose from "mongoose";
import OldPasskey from "../schema/oldPasskey.js";
import jwksClient from "jwks-rsa";
import { AppleDto } from "../../../shared/appledto.js";

const mailgunAuth: Options = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY!,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const transporter = nodemailer.createTransport(mailgun(mailgunAuth));

const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

const getAppleSigningKey = (header: JwtHeader, callback: SigningKeyCallback) => {
  if (!header || !header.kid) {
    return callback(new Error("Missing key identifier (kid) in token header"));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }

    const signingKey = key?.getPublicKey();
    if (!signingKey) {
      return callback(new Error("Could not retrieve public key from signing key payload"));
    }

    callback(null, signingKey);
  });
};

interface PasskeyReturnType {
  passkey: string;
  hashedPasskey: string;
}

const generateHashedPasskey = (): PasskeyReturnType => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
  let passkey = "";
  const randomBytes = crypto.randomBytes(16);
  for (let i = 0; i < 16; i++) {
    passkey += charset[randomBytes[i] % charset.length];
  }
  const hashedPasskey = crypto.createHash("sha256").update(passkey).digest("hex");

  return { passkey: passkey, hashedPasskey: hashedPasskey };
};

const newUserSignIn = async (email: string, session: mongoose.mongo.ClientSession): Promise<PasskeyReturnType> => {
  const passkeys = generateHashedPasskey();

  const newUser = new User({ email: email, passkey: passkeys.hashedPasskey });

  await session.withTransaction(async () => {
    await newUser.save({ session });

    const existingUserSettings = await UserSettings.findOne({ userEmail: email });
    if (!existingUserSettings) {
      const newUserSettings = new UserSettings({
        userEmail: email,
        userName: "new monkey",
        userColor: "red",
        enableCompleteAnimation: true,
        enableHoldComplete: false,
      });
      await newUserSettings.save({ session });
    }
  });

  return passkeys;
};

export const postAccessToken = async (req: Request<{}, {}, AccessDto>, res: Response<JsonDto<AccessDto>>) => {
  const session = await mongoose.startSession();

  try {
    const email = req.body.email;
    const passkey = req.body.passkey;

    const hashedPasskey = crypto.createHash("sha256").update(passkey).digest("hex");

    const user = await User.findOne({ email: email, passkey: hashedPasskey });

    if (!user) {
      const previousUsed = await OldPasskey.findOne({ passkey: hashedPasskey });

      // CRITICAL - Auth Breach
      if (previousUsed) {
        console.log("!!!!!!! CRITICAL AUTH BREACH - WIPING SESSIONS !!!!!!!");

        const allUsers = await User.find({ email: req.user!.email });

        await session.withTransaction(async () => {
          for (const user of allUsers) {
            const newOldPasskey = new OldPasskey({
              email: user.email,
              passkey: user.passkey,
            });

            await newOldPasskey.save({ session });
            await user.deleteOne({ session });
          }
        });

        return res.status(403).json({ error: "Malicious activity detected" });
      }

      // Must re-login
      return res.status(403).json({ error: "Invalid user" });
    }

    // Success
    const oldPasskey = user.passkey;
    const newOldPasskey = new OldPasskey({
      email: email,
      passkey: oldPasskey,
    });

    const passkeys = generateHashedPasskey();

    user.passkey = passkeys.hashedPasskey;

    const token = jwt.sign(req.body, process.env.JWT_SECRET_KEY!, { expiresIn: process.env.JWT_EXPIRES_IN! as any });

    await session.withTransaction(async () => {
      await newOldPasskey.save({ session });
      await user.save({ session });
    });

    res.status(200).json({ data: { email: email, passkey: passkeys.passkey, accessToken: token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await session.endSession();
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

    const passkeys = await newUserSignIn(req.body.email, session);
    await UserOtp.findByIdAndDelete(userOtp._id, { session });

    const accessDto: AccessDto = { email: req.body.email, passkey: passkeys.passkey };

    res.status(200).json({ data: accessDto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await session.endSession();
  }
};

export const postSignOut = async (req: Request<{}, {}, AccessDto>, res: Response<JsonDto<any>>) => {
  const session = await mongoose.startSession();

  try {
    const hashedPasskey = crypto.createHash("sha256").update(req.body.passkey).digest("hex");

    const user = await User.findOne({ email: req.user!.email, passkey: hashedPasskey });

    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    const newOldPasskey = new OldPasskey({
      email: req.user!.email,
      passkey: hashedPasskey,
    });

    await session.withTransaction(async () => {
      await newOldPasskey.save({ session });
      await user.deleteOne({ session });
    });

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await session.endSession();
  }
};

export const postDeleteAccount = async (req: Request<{}, {}, AccessDto>, res: Response<JsonDto<any>>) => {
  const session = await mongoose.startSession();

  try {
    const hashedPasskey = crypto.createHash("sha256").update(req.body.passkey).digest("hex");

    const user = await User.findOne({ email: req.user!.email, passkey: hashedPasskey });

    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    const allUsers = await User.find({ email: req.user!.email });

    await session.withTransaction(async () => {
      for (const user of allUsers) {
        const newOldPasskey = new OldPasskey({
          email: user.email,
          passkey: user.passkey,
        });

        await newOldPasskey.save({ session });
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

export const postAppleSignIn = async (req: Request<{}, {}, AppleDto>, res: Response<JsonDto<AccessDto>>) => {
  const identityToken = req.body.identityToken;

  if (!identityToken) {
    return res.status(400).json({ error: "Token not provided" });
  }

  const session = await mongoose.startSession();

  jwt.verify(
    identityToken,
    getAppleSigningKey,
    {
      algorithms: ["RS256"],
      issuer: "https://appleid.apple.com",
      audience: process.env.APPLE_BUNDLE_ID,
    },
    async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token signature or expired" });
      }

      if (!decodedToken || typeof decodedToken === "string") {
        return res.status(400).json({ error: "Malformed token payload structure" });
      }

      const email = decodedToken.email;

      if (email.endsWith("privaterelay.appleid.com")) {
        return res.status(200).json({ data: { passkey: "", email: email, privateAppleEmail: true } });
      }

      try {
        const passkeys = await newUserSignIn(email, session);

        const accessDto: AccessDto = { email: email, passkey: passkeys.passkey };

        res.status(200).json({ data: accessDto });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
      } finally {
        await session.endSession();
      }
    },
  );
};
