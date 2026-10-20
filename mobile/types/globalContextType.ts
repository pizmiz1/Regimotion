import { ModuleDto } from "../../shared/moduledto";
import { UserSettingsDto } from "../../shared/usersettingsdto";

export interface GlobalContextType {
  appLoading: boolean;
  accessToken: string;
  modules: ModuleDto[];
  userSettings: UserSettingsDto;
  updateAppLoading: (newAppLoading: boolean) => void;
  updateAccessToken: (newAccessToken: string) => void;
  updateModules: (newModules: ModuleDto[]) => void;
  patchModule: (updatedModule: ModuleDto) => Promise<boolean>;
  updateUserSettings: (newUserSettings: UserSettingsDto) => void;
  patchUserSettings: (updatedUserSettings: UserSettingsDto) => Promise<boolean>;
}
