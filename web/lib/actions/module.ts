"use server";

import { JsonDto } from "../../../shared/jsondto";
import { DaysDto, ModuleDto } from "../../../shared/moduledto";
import { deleteFetch, get, patch, post } from "../helpers/fetch";
import { updateTag } from "next/cache";
import { dataTags } from "@/constants/dataTags";
import { cookies } from "next/headers";
import { cookieKeys } from "@/constants/cookieKeys";
import { validateColor, validateDaysActive, validateIcon, validateName } from "../validation/validation";
import { convertDays } from "../helpers/day-converter";

const validateModule = (name: string, color: string, icon: string, daysActive: string[]) => {
  const nameValid = validateName(name);
  if (!nameValid) {
    return {
      data: false,
      error: "Invalid Name",
    };
  }

  const colorValid = validateColor(color);
  if (!colorValid) {
    return {
      data: false,
      error: "Invalid Color",
    };
  }

  const iconValid = validateIcon(icon);
  if (!iconValid) {
    return {
      data: false,
      error: "Invalid Icon",
    };
  }

  const daysActiveValid = validateDaysActive(daysActive);
  if (!daysActiveValid) {
    return {
      data: false,
      error: "Invalid Days",
    };
  }
};

export const postModule = async (prevState: JsonDto<boolean>, formData: FormData): Promise<JsonDto<boolean>> => {
  // Testing
  return {
    data: false,
    error: "Test",
  };

  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;
  const daysActive = formData.getAll("daysActive") as string[];

  validateModule(name, color, icon, daysActive);

  try {
    const daysDto = convertDays(daysActive, true) as DaysDto;

    const body: ModuleDto = {
      name: name,
      icon: icon,
      color: color,
      days: daysDto,
      progress: 0,
      exercises: [],
    };

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

    const response = await post("/module", body, accessToken);

    if (response.error) {
      return {
        data: false,
        error: response.error,
      };
    }

    updateTag(dataTags.modules);

    return {
      data: true,
    };
  } catch (error) {
    console.log(error);
    return {
      data: false,
      error: "Unable to add module",
    };
  }
};

export const patchModule = async (prevState: JsonDto<boolean>, formData: FormData): Promise<JsonDto<boolean>> => {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;
  const daysActive = formData.getAll("daysActive") as string[];

  validateModule(name, color, icon, daysActive);

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

    const allModules: JsonDto<ModuleDto[]> = await get("/module", accessToken!, dataTags.modules);
    if (allModules.error || !allModules.data) {
      return {
        data: false,
        error: allModules.error,
      };
    }
    const existing = allModules.data.find((curr) => curr.id === id);
    if (!existing) {
      return {
        data: false,
        error: "Could not find module",
      };
    }

    const daysDto = convertDays(daysActive, true) as DaysDto;

    const body: ModuleDto = {
      id: id,
      name: name,
      icon: icon,
      color: color,
      days: daysDto,
      progress: existing.progress,
      exercises: existing.exercises,
    };

    const response = await patch("/module", body, accessToken!);

    if (response.error) {
      return {
        data: false,
        error: response.error,
      };
    }

    updateTag(dataTags.modules);

    return {
      data: true,
    };
  } catch (error) {
    console.log(error);
    return {
      data: false,
      error: "Unable to update module",
    };
  }
};

export const deleteModule = async (id: string): Promise<JsonDto<boolean>> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

    const response: JsonDto<boolean> = await deleteFetch("/module", accessToken!, id);

    if (response.error) {
      return {
        data: false,
        error: response.error,
      };
    }

    updateTag(dataTags.modules);

    return {
      data: true,
    };
  } catch (error) {
    console.log(error);
    return {
      data: false,
      error: "Unable to delete module",
    };
  }
};
