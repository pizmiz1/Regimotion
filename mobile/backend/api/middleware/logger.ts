import { NextFunction, Request, Response } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const currentDate = new Date();
  const estString = currentDate.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  });

  console.log("--------------------------------------");
  console.log(estString);
  console.log(req.method + " at route: " + req.url);
  next();
};
