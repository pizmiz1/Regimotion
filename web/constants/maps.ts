import { ModuleDto } from "../../shared/moduledto";
import { colors } from "./colors";

export const iconList = [
  "fitness-center",
  "directions-bike",
  "directions-run",
  "sports-soccer",
  "sports-basketball",
  "sports-volleyball",
  "sports-hockey",
  "water",
  "eco",
  "landscape",
  "pets",
  "personal-injury",
  "sentiment-very-satisfied",
  "local-hospital",
  "medical-services",
  "health-and-safety",
  "accessibility",
  "stream",
  "star",
  "cloud",
  "camera",
  "360",
  "all-inclusive",
  "api",
];

export const moduleColorList = [colors.primary, colors.orangeCompliment, colors.blueCompliment];

export const daysActiveMap = { mon: "M", tues: "T", wed: "W", thur: "T", fri: "F", sat: "S", sun: "S" };

export const dayMap: Record<number, keyof ModuleDto["days"]> = {
  0: "sun",
  1: "mon",
  2: "tues",
  3: "wed",
  4: "thur",
  5: "fri",
  6: "sat",
};

export const animalMap = {
  alligator: require("./../public/avatars/alligator.png"),
  crow: require("./../public/avatars/crow.png"),
  dolphin: require("./../public/avatars/dolphin.png"),
  elephant: require("./../public/avatars/elephant.png"),
  giraffe: require("./../public/avatars/giraffe.png"),
  ibex: require("./../public/avatars/ibex.png"),
  monkey: require("./../public/avatars/monkey.png"),
  turtle: require("./../public/avatars/turtle.png"),
};

export const animalColorMap = {
  purple: "orange",
  teal: "teal",
  red: "red",
};
