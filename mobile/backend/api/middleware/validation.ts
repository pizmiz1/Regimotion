import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { JsonDto } from "../../../shared/jsondto.js";

export const validate = (req: Request, res: Response<JsonDto<any>>, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorObjects = errors.array();

    const errorMessages = errorObjects.map((err) => err.msg) as String[];

    return res.status(400).json({ error: "Invalid Request: " + errorMessages.join(", ") });
  }

  next();
};
