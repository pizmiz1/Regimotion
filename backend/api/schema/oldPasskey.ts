import mongoose from "mongoose";

const oldPasskeySchema = new mongoose.Schema({
  email: { type: String, required: true },
  passkey: { type: String, required: true, unique: true },
});

const OldPasskey = mongoose.model("OldPasskey", oldPasskeySchema);

export default OldPasskey;
