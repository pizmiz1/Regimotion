import { cookies } from "next/headers";
import { ModuleDto } from "../../../shared/moduledto";
import { cookieKeys } from "@/constants/cookieKeys";
import { dataTags } from "@/constants/dataTags";
import { get } from "./fetch";
import { UserSettingsDto } from "../../../shared/usersettingsdto";

export const getModules = async (): Promise<ModuleDto[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

  const response = await get("/module", accessToken!, dataTags.modules);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const getUserSettings = async (): Promise<UserSettingsDto> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

  const response = await get("/userSettings", accessToken!, dataTags.userSettings);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};
