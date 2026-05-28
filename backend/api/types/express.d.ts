import { Request } from "express";
import { UserDto } from "../../../shared/models/userdto.ts";

interface JwtPayload {
  email: string;
  iat: number;
  exp: number;
}

declare module "express" {
  export interface Request {
    user?: JwtPayload;
  }
}
