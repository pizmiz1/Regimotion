"use server";

import { JsonDto } from "../../../shared/jsondto";
import { DaysDto, ExerciseDto, ModuleDto } from "../../../shared/moduledto";
import { deleteFetch, get, patch, post } from "../helpers/fetch";
import { updateTag } from "next/cache";
import { dataTags } from "@/constants/dataTags";
import { cookies } from "next/headers";
import { cookieKeys } from "@/constants/cookieKeys";
import { validateColor, validateExercise, validateIcon, validateName, validateProgress } from "../validation/validation";
import { convertDays } from "../helpers/day-converter";

const validateModule = (name: string, color: string, icon: string, progress: number, exercises: ExerciseDto[]) => {
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

  const progressValid = validateProgress(progress);
  if (!progressValid) {
    return {
      data: false,
      error: "Invalid Progress",
    };
  }

  for (const exercise of exercises) {
    const exercisesValid = validateExercise(exercise);
    if (!exercisesValid) {
      return {
        data: false,
        error: "Invalid Exercises",
      };
    }
  }
};

// Form Actions
export const postModuleForm = async (prevState: JsonDto<boolean>, formData: FormData): Promise<JsonDto<boolean>> => {
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;
  const daysActive = formData.getAll("daysActive") as string[];

  const exercises: ExerciseDto[] = [];
  const progress = 0;

  validateModule(name, color, icon, progress, exercises);

  try {
    const daysDto = convertDays(daysActive, true) as DaysDto;

    const body: ModuleDto = {
      name: name,
      icon: icon,
      color: color,
      days: daysDto,
      progress: progress,
      exercises: exercises,
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

export const patchModuleForm = async (prevState: JsonDto<boolean>, formData: FormData): Promise<JsonDto<boolean>> => {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;
  const daysActive = formData.getAll("daysActive") as string[];

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

    const daysDto = convertDays(daysActive, true) as DaysDto | boolean;

    if (typeof daysDto === "boolean") {
      return {
        data: false,
        error: "Invalid Days",
      };
    }

    validateModule(name, color, icon, existing.progress, existing.exercises);

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
      error: "Unable to patch module",
    };
  }
};

// Regular Actions
export const patchModule = async (module: ModuleDto): Promise<JsonDto<ModuleDto>> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

    validateModule(module.name, module.color, module.icon, module.progress, module.exercises);

    const response: JsonDto<ModuleDto> = await patch("/module", module, accessToken!);

    if (response.error) {
      return {
        error: response.error,
      };
    }

    updateTag(dataTags.modules);

    return {
      data: response.data,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Unable to patch module",
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
