import { createContext, useContext } from "react";
import { ReactNode, useState } from "react";
import { ModuleDto } from "../../shared/moduledto";
import { JsonDto } from "../../shared/jsondto";
import { patch } from "../helpers/fetch";
import { errorAlert } from "../helpers/alert";
import { UserSettingsDto } from "../../shared/usersettingsdto";

interface GlobalContextType {
  appLoading: boolean;
  accessToken: string;
  modules: ModuleDto[];
  userSettings: UserSettingsDto;
  updateAppLoading: (newAppLoading: boolean) => void;
  updateAccessToken: (newAccessToken: string) => void;
  updateModules: (newModules: ModuleDto[] | ((prev: ModuleDto[]) => ModuleDto[])) => void;
  patchModule: (updatedModule: ModuleDto) => Promise<boolean>;
  updateUserSettings: (newUserSettings: UserSettingsDto) => void;
  patchUserSettings: (updatedUserSettings: UserSettingsDto) => Promise<boolean>;
}

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [appLoading, setAppLoading] = useState(true);
  const [accessToken, setAccessToken] = useState("");
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettingsDto>({
    userEmail: "",
    userName: "",
    userColor: "",
    enableCompleteAnimation: true,
    enableHoldComplete: false,
  });

  const updateAppLoading = (newAppLoading: boolean) => {
    setAppLoading(newAppLoading);
  };

  const updateAccessToken = (newAccesstoken: string) => {
    setAccessToken(newAccesstoken);
  };

  const updateModules = (newModules: ModuleDto[] | ((prev: ModuleDto[]) => ModuleDto[])) => {
    if (typeof newModules === "function") {
      setModules((prev) => newModules(prev));
    } else {
      setModules(newModules);
    }
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

    const responseData = response.data;

    if (responseData === undefined) {
      errorAlert("Bad Response");
      return false;
    }

    setModules((prev) => prev.map((curr) => (curr.id === updatedModule.id ? responseData : curr)));

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
    appLoading,
    accessToken,
    modules,
    userSettings,
    updateAppLoading,
    updateAccessToken,
    updateModules,
    patchModule,
    updateUserSettings,
    patchUserSettings,
  };

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
