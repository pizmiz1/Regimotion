import { NextFunction, Request, Response } from "express";
import { JsonDto } from "../../../shared/jsondto.js";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/express.js";

export const authenticate = (req: Request, res: Response<JsonDto<any>>, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization token is required." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authorization token is required." });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, decodedPayload) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    req.user = decodedPayload as JwtPayload;
    next();
  });
};
