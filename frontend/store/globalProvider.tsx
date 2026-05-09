import { ReactNode, useState } from "react";
import { GlobalContext } from "./globalContext";
import { GlobalContextType } from "../types/globalContextType";
import { ModuleDto } from "../../shared/moduledto";
import { JsonDto } from "../../shared/jsondto";
import { patch } from "../helpers/fetch";
import { errorAlert } from "../helpers/alert";
import { UserSettingsDto } from "../../shared/usersettingsdto";

interface GlobalProviderProps {
  children: ReactNode;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [accessToken, setAccessToken] = useState("");
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettingsDto>({
    userEmail: "",
    userName: "",
    userColor: "",
    enableCompleteAnimation: true,
    enableHoldComplete: false,
  });

  const updateAccessToken = (newAccesstoken: string) => {
    setAccessToken(newAccesstoken);
  };

  const updateModules = (newModules: ModuleDto[]) => {
    setModules(newModules);
  };

  const updateUserSettings = (newUserSettings: UserSettingsDto) => {
    setUserSettings(newUserSettings);
  };

  const patchModule = async (updatedModule: ModuleDto): Promise<boolean> => {
    const response: JsonDto<ModuleDto> = await patch("/module", updatedModule, { accessToken: accessToken, updateAccessToken: updateAccessToken });
    if (response.error) {
      errorAlert(response.error);
      return false;
    }

    const newModules = [...modules];
    const index = newModules.findIndex((curr) => curr.id === updatedModule.id);
    if (index !== -1) {
      newModules[index] = response.data!;
      setModules(newModules);
    }

    return true;
  };

  const patchUserSettings = async (updatedUserSettings: UserSettingsDto): Promise<boolean> => {
    const response: JsonDto<UserSettingsDto> = await patch("/userSettings", updatedUserSettings, {
      accessToken: accessToken,
      updateAccessToken: updateAccessToken,
    });
    if (response.error) {
      errorAlert(response.error);
      return false;
    }

    setUserSettings({ ...updatedUserSettings });

    return true;
  };

  const contextValue: GlobalContextType = {
    accessToken,
    modules,
    userSettings,
    updateAccessToken,
    updateModules,
    patchModule,
    updateUserSettings,
    patchUserSettings,
  };

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};

export default GlobalProvider;
