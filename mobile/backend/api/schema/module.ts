import mongoose from "mongoose";
import { DaysDto, ExerciseDto, ModuleDto } from "../../../shared/moduledto.js";

interface ModuleDtoBackend extends ModuleDto {
  userEmail: string;
}

const daysSchema = new mongoose.Schema<DaysDto>(
  {
    mon: { type: Boolean, required: true },
    tues: { type: Boolean, required: true },
    wed: { type: Boolean, required: true },
    thur: { type: Boolean, required: true },
    fri: { type: Boolean, required: true },
    sat: { type: Boolean, required: true },
    sun: { type: Boolean, required: true },
  },
  { _id: false },
);

const exerciseSchema = new mongoose.Schema<ExerciseDto>(
  {
    name: { type: String, required: true },
    completed: { type: Boolean, required: true },
    text1: { type: String, required: true },
    text2: { type: String },
    altActive: { type: Boolean },
    altName: { type: String },
    altText1: { type: String },
    altText2: { type: String },
  },
  {
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const moduleSchema = new mongoose.Schema<ModuleDtoBackend>(
  {
    userEmail: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    progress: { type: Number, required: true },
    days: { type: daysSchema, required: true },
    exercises: { type: [exerciseSchema], required: true },
  },
  {
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;
