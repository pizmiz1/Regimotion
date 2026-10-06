import { ModuleDto } from "../../shared/moduledto";
import { UserSettingsDto } from "../../shared/usersettingsdto";

export interface GlobalContextType {
  accessToken: string;
  modules: ModuleDto[];
  userSettings: UserSettingsDto;
  updateAccessToken: (newAccessToken: string) => void;
  updateModules: (newModules: ModuleDto[]) => void;
  patchModule: (updatedModule: ModuleDto) => Promise<boolean>;
  updateUserSettings: (newUserSettings: UserSettingsDto) => void;
  patchUserSettings: (updatedUserSettings: UserSettingsDto) => Promise<boolean>;
}
