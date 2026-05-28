import { Request, Response } from "express";
import { UserSettingsDto } from "../../../shared/usersettingsdto.js";
import { JsonDto } from "../../../shared/jsondto.js";
import UserSettings from "../schema/userSettings.js";

export const get = async (req: Request, res: Response<JsonDto<UserSettingsDto>>) => {
  try {
    const email = req.user!.email;

    if (!email) {
      return res.status(400).json({ error: "Invalid user email" });
    }

    const userSettings = await UserSettings.findOne({ userEmail: email });

    if (!userSettings) {
      return res.status(404).json({ error: "User settings not found" });
    }

    const dto = userSettings.toJSON();

    res.status(200).json({ data: dto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const patch = async (req: Request<{}, {}, UserSettingsDto>, res: Response<JsonDto<UserSettingsDto>>) => {
  try {
    const email = req.user!.email;

    if (!email) {
      return res.status(400).json({ error: "Invalid user email" });
    }

    const updated = await UserSettings.findOneAndUpdate({ userEmail: email }, req.body, { new: true });

    if (!updated) {
      res.status(404).json({ error: "Module not found" });
      return;
    }

    const dto = updated.toJSON();

    res.status(201).json({ data: dto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
