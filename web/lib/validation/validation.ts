import { colors } from "@/constants/colors";
import { daysActiveMap, iconList } from "@/constants/maps";

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
  if (name === undefined || name === null || name === "" || name.length > 15) {
    return false;
  }

  return true;
};

/**
 * @returns true for valid module color.
 */
export const validateColor = (color: string): boolean => {
  if (
    color === undefined ||
    color === "" ||
    color === null ||
    (color !== colors.primary && color !== colors.orangeCompliment && color !== colors.blueCompliment)
  ) {
    return false;
  }

  return true;
};

/**
 * @returns true for valid module icon.
 */
export const validateIcon = (icon: string): boolean => {
  if (icon === undefined || icon === "" || icon === null || !iconList.includes(icon)) {
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
