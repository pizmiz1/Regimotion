import { DaysDto } from "../../../shared/moduledto";
import { daysActiveMap } from "@/constants/maps";

type DayKey = keyof typeof daysActiveMap;
type DaysActive = string[];

export const convertDays = (value: DaysDto | DaysActive, toDto: boolean): DaysDto | string[] | boolean => {
  const dayKeys = Object.keys(daysActiveMap) as DayKey[];

  if (toDto) {
    const daysDto: DaysDto = {
      mon: false,
      tues: false,
      wed: false,
      thur: false,
      fri: false,
      sat: false,
      sun: false,
    };

    (value as DaysActive).forEach((day) => {
      if (day in daysActiveMap) {
        daysDto[day as DayKey] = true;
      } else {
        return false;
      }
    });

    return daysDto;
  }

  return dayKeys.filter((day) => (value as DaysDto)[day]);
};
