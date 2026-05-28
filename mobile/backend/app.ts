import "dotenv/config";
import express, { Response } from "express";
import { requestLogger } from "./api/middleware/logger.js";
import mongoose from "mongoose";
import authRoutes from "./api/routes/authRoutes.js";
import cors from "cors";
import moduleRoutes from "./api/routes/moduleRoutes.js";
import { JsonDto } from "../shared/jsondto.js";
import { resetExercisesCron } from "./api/cron/resetExercises.js";
import userSettingsRoutes from "./api/routes/userSettingsRoutes.js";

console.log("Starting Server");

// Env Vars
const port = process.env.PORT || 3000;
const mongo_cs = process.env.MONGO_CS;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/", authRoutes);
app.use("/", moduleRoutes);
app.use("/", userSettingsRoutes);
app.get("/", (req, res: Response<JsonDto<string>>) => {
  res.status(200).json({ data: "Regimotion server is healthy." });
});

// Run
const run = async () => {
  try {
    console.log("Connecting to DB...");

    await mongoose.connect(mongo_cs!);

    console.log("Success!");

    // Cron
    resetExercisesCron();

    app.listen(port, () => {
      console.log("Listening on " + port + "...");
    });
  } catch (err) {
    console.log("Failed to start server :(");
  }
};

run();
