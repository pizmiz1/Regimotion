import { ReactNode, useState } from "react";
import { GlobalContext } from "./globalContext";
import { GlobalContextType } from "../types/globalContextType";
import { ModuleDto } from "../../shared/moduledto";
import { JsonDto } from "../../shared/jsondto";
import { patch } from "../helpers/fetch";
import { errorAlert } from "../helpers/alert";

interface GlobalProviderProps {
  children: ReactNode;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [accessToken, setAccessToken] = useState("");
  const [modules, setModules] = useState<ModuleDto[]>([]);

  const updateAccessToken = (newAccesstoken: string) => {
    setAccessToken(newAccesstoken);
  };

  const updateModules = (newModules: ModuleDto[]) => {
    setModules(newModules);
  };

  const patchModule = async (updatedModule: ModuleDto) => {
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

  const contextValue: GlobalContextType = {
    accessToken,
    modules,
    updateAccessToken,
    updateModules,
    patchModule,
  };

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};

export default GlobalProvider;
