import { colors } from "@/constants/colors";
import { daysActiveMap, iconList } from "@/constants/maps";
import { ExerciseDto } from "../../../shared/moduledto";

/**
 * @returns true for valid string.
 */
export const validateString = (str: string): boolean => {
  if (str === undefined || str === null || str === "") {
    return false;
  }

  return true;
};

/**
 * @returns true for valid boolean.
 */
export const validateBoolean = (bool: boolean): boolean => {
  if (bool === undefined || bool === null) {
    return false;
  }

  return true;
};

/**
 * @returns true for valid email.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailEmpty = !email || !email.trim();
  const isEmailInvalidFormat = !isEmailEmpty && !emailRegex.test(email);

  return !isEmailEmpty && !isEmailInvalidFormat;
};

/**
 * @returns true for valid OTP.
 */
export const validateOtp = (otp: string): boolean => {
  const otpRegex = /^\d{6}$/;
  const isOTPEmpty = !otp || !otp.trim();
  const isOTPInvalidFormat = !isOTPEmpty && !otpRegex.test(otp);

  return !isOTPEmpty && !isOTPInvalidFormat;
};

/**
 * @returns true for valid module name.
 */
export const validateName = (name: string): boolean => {
  if (!validateString(name) || name.length > 15) {
    return false;
  }

  return true;
};

/**
 * @returns true for valid module color.
 */
export const validateColor = (color: string): boolean => {
  if (!validateString(color) || (color !== colors.primary && color !== colors.orangeCompliment && color !== colors.blueCompliment)) {
    return false;
  }

  return true;
};

/**
 * @returns true for valid module icon.
 */
export const validateIcon = (icon: string): boolean => {
  if (!validateString(icon) || !iconList.includes(icon)) {
    return false;
  }

  return true;
};

/**
 * @returns true for valid module days active.
 */
export const validateDaysActive = (daysActive: string[]): boolean => {
  if (daysActive === undefined || daysActive === null || daysActive.length === 0 || !daysActive.every((curr) => curr in daysActiveMap)) {
    return false;
  }

  return true;
};

/**
 * @returns true for valid module progress.
 */
export const validateProgress = (progress: number): boolean => {
  if (progress === undefined || progress === null || progress < 0 || progress > 100) {
    return false;
  }

  return true;
};

/**
 * @returns true for valid module exercise.
 */
export const validateExercise = (exercise: ExerciseDto): boolean => {
  if (
    exercise === undefined ||
    exercise === null ||
    exercise.name === undefined ||
    exercise.name === null ||
    exercise.name === "" ||
    exercise.text1 === undefined ||
    exercise.text1 === null ||
    exercise.text1 === ""
  ) {
    return false;
  }

  return true;
};
