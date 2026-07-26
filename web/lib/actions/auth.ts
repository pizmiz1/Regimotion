"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { validateEmail, validateOtp } from "../validation/validation";
import { JsonDto } from "./../../../shared/jsondto";
import { OtpDto } from "./../../../shared/otpdto";
import { cookieKeys } from "@/constants/cookieKeys";
import { post } from "../helpers/fetch";
import { AccessDto } from "../../../shared/accessdto";
import { redirect } from "next/navigation";

export const generateOtp = async (prevState: JsonDto<boolean>, formData: FormData): Promise<JsonDto<boolean>> => {
  const email = formData.get("email") as string;

  // Validation
  const emailValid = validateEmail(email);
  if (!emailValid) {
    return {
      error: "Invalid Email",
    };
  }

  try {
    const body: OtpDto = {
      email: email,
    };

    const response = await post("/auth/generateOtp", body);

    if (response.error) {
      return {
        data: false,
        error: response.error,
      };
    }

    return {
      data: true,
    };
  } catch (error) {
    console.log(error);
    return {
      data: false,
      error: "Unable to generate otp",
    };
  }
};

export const verifyOtp = async (prevState: JsonDto<undefined>, formData: FormData): Promise<JsonDto<undefined>> => {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  // Validation
  const otpValid = validateOtp(otp);
  if (!otpValid) {
    return {
      error: "Invalid Otp",
    };
  }

  let success = false;

  try {
    const body: OtpDto = {
      email: email,
      otp: otp,
    };
    const response: JsonDto<AccessDto> = await post("/auth/verifyOtp", body);

    if (response.error || !response.data) {
      return {
        error: response.error,
      };
    }

    const accessBody: AccessDto = {
      email: email,
      passkey: response.data.passkey,
    };
    const accessResponse: JsonDto<AccessDto> = await post("/auth/accessToken", accessBody);

    if (accessResponse.error || !accessResponse.data || !accessResponse.data.accessToken) {
      return {
        error: accessResponse.error,
      };
    }

    const emailtoken = jwt.sign({ email: email }, process.env.JWT_SECRET_KEY!, { expiresIn: "180d" });
    const passkeyToken = jwt.sign({ passkey: accessResponse.data.passkey }, process.env.JWT_SECRET_KEY!, { expiresIn: "180d" });

    const cookieStore = await cookies();

    cookieStore.set(cookieKeys.accessToken, accessResponse.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 Day
    });
    cookieStore.set(cookieKeys.email, emailtoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 180, // 180 Days
      path: "/",
    });
    cookieStore.set(cookieKeys.passkey, passkeyToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180, // 180 Days
    });

    success = true;
  } catch (error) {
    console.log(error);
    return {
      error: "Unable to verify otp",
    };
  }

  if (success) {
    redirect("/");
  } else {
    return {
      error: "Server error",
    };
  }
};
