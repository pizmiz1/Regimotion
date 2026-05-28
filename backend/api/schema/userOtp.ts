import mongoose from "mongoose";

interface OtpDtoBackend {
  email: string;
  otp: string;
  createdAt: Date;
}

const userOtpSchema = new mongoose.Schema<OtpDtoBackend>({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true, length: 6 },
  createdAt: { type: Date, default: Date.now, required: true },
});

userOtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const UserOtp = mongoose.model("UserOtp", userOtpSchema);

export default UserOtp;
