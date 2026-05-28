import mongoose from "mongoose";
import { UserDto } from "../../../shared/userdto.js";

interface UserDtoBackend extends UserDto {
  passkey: string;
}

const userSchema = new mongoose.Schema<UserDtoBackend>({
  email: { type: String, required: true },
  passkey: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

export default User;
