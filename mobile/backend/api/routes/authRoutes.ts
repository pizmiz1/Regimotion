import express, { Request, Response } from "express";
import { postAccessToken, postDeleteAccount, postGenerateOtp, postSignOut, postVerifyOTP } from "../controllers/authController.js";
import { body, ValidationChain } from "express-validator";
import { validate } from "../middleware/validation.js";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { JsonDto } from "../../../shared/jsondto.js";
import { authenticate } from "../middleware/authentication.js";

// Request Limits
const authLimiter = rateLimit({
  windowMs: (process.env.RL_MINS! as unknown as number) * 60 * 1000, // 10 minutes
  limit: process.env.RL_REQS! as unknown as number,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request): string => {
    const clientIp = req.headers["true-client-ip"];
    if (clientIp) return Array.isArray(clientIp) ? clientIp[0] : clientIp;

    return ipKeyGenerator(req.ip!);
  },

  handler: (req: Request, res: Response<JsonDto<any>>) => {
    res.status(429).json({
      error: "Too many auth requests, please wait " + process.env.RL_MINS! + " mins",
    });
  },
});

// Validators
const accessTokenValidators: ValidationChain[] = [
  body("email").normalizeEmail().isEmail().withMessage("Must be a valid email address"),
  body("passkey")
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error("Passkey cannot contain any whitespace");
      }
      return true;
    })
    .notEmpty()
    .withMessage("Passkey cannot be empty or just whitespace")
    .isLength({ min: 16, max: 16 })
    .withMessage("Passkey must be exactly 16 characters long"),
];

const generateOtpValidators: ValidationChain[] = [body("email").normalizeEmail().isEmail().withMessage("Must be a valid email address")];

const verifyOtpValidators: ValidationChain[] = [
  body("email").normalizeEmail().isEmail().withMessage("Must be a valid email address"),
  body("otp").isNumeric().withMessage("OTP must be a number").isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits"),
];

// Routes
const authRoutes = express.Router();
const baseUrl = "/auth";

authRoutes.route(baseUrl + "/accessToken").post(authLimiter, accessTokenValidators, validate, postAccessToken);
authRoutes.route(baseUrl + "/generateOtp").post(authLimiter, generateOtpValidators, validate, postGenerateOtp);
authRoutes.route(baseUrl + "/verifyOtp").post(authLimiter, verifyOtpValidators, validate, postVerifyOTP);
authRoutes.route(baseUrl + "/signOut").post(authenticate, authLimiter, accessTokenValidators, validate, postSignOut);
authRoutes.route(baseUrl + "/deleteAccount").post(authenticate, authLimiter, accessTokenValidators, validate, postDeleteAccount);

export default authRoutes;
