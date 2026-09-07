"use server";

import { cookies } from "next/headers";
import { JsonDto } from "../../../shared/jsondto";
import { UserSettingsDto } from "../../../shared/usersettingsdto";
import { cookieKeys } from "@/constants/cookieKeys";
import { validateBoolean, validateEmail, validateString } from "../validation/validation";
import { patch } from "../helpers/fetch";
import { updateTag } from "next/cache";
import { dataTags } from "@/constants/dataTags";

const validateUserSettings = (
  userEmail: string,
  userName: string,
  userColor: string,
  enableCompleteAnimation: boolean,
  enableHoldComplete: boolean,
) => {
  const userEmailValid = validateEmail(userEmail);
  if (!userEmailValid) {
    return {
      data: false,
      error: "Invalid User Email",
    };
  }

  const userNameValid = validateString(userName);
  if (!userNameValid) {
    return {
      data: false,
      error: "Invalid User Name",
    };
  }

  const userColorValid = validateString(userColor);
  if (!userColorValid) {
    return {
      data: false,
      error: "Invalid User Color",
    };
  }

  const enableCompleteAnimationValid = validateBoolean(enableCompleteAnimation);
  if (!enableCompleteAnimationValid) {
    return {
      data: false,
      error: "Invalid User Setting",
    };
  }

  const enableHoldCompleteValid = validateBoolean(enableHoldComplete);
  if (!enableHoldCompleteValid) {
    return {
      data: false,
      error: "Invalid User Setting",
    };
  }
};

// Regular Actions
export const patchUserSettings = async (userSettings: UserSettingsDto): Promise<JsonDto<UserSettingsDto>> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

    validateUserSettings(
      userSettings.userEmail,
      userSettings.userName,
      userSettings.userColor,
      userSettings.enableCompleteAnimation,
      userSettings.enableHoldComplete,
    );

    const response: JsonDto<UserSettingsDto> = await patch("/userSettings", userSettings, accessToken!);

    if (response.error) {
      return {
        error: response.error,
      };
    }

    updateTag(dataTags.userSettings);

    return {
      data: response.data,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Unable to patch user settings",
    };
  }
};
