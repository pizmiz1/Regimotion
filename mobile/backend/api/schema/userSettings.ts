import mongoose from "mongoose";
import { UserSettingsDto } from "../../../shared/usersettingsdto.js";

const userSettingsSchema = new mongoose.Schema<UserSettingsDto>(
  {
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    userColor: { type: String, required: true },
    enableCompleteAnimation: { type: Boolean, required: true, default: true },
    enableHoldComplete: { type: Boolean, required: true, default: false },
  },
  {
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

export default UserSettings;
