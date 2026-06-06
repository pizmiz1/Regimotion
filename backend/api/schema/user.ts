import mongoose from "mongoose";
import { UserDto } from "../../../shared/userdto.js";

interface UserDtoBackend extends UserDto {
  passkey: string;
}

const userSchema = new mongoose.Schema<UserDtoBackend>(
  {
    email: { type: String, required: true },
    passkey: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 15552000 }); // 180 Days if not updated

const User = mongoose.model("User", userSchema);

export default User;
