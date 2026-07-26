import styles from "./page.module.scss";
import { Plus } from "lucide-react";
import ModuleDetailDialog from "@/components/shared/module-detail-dialog";
import { ModulesModule } from "@/components/modules/modules-module";
import NothingHere from "@/components/shared/nothing-here";
import { ModuleDto } from "../../../../shared/moduledto";
import { cookies } from "next/headers";
import { cookieKeys } from "@/constants/cookieKeys";
import { dataTags } from "@/constants/dataTags";
import { get } from "@/lib/helpers/fetch";

const getModules = async (): Promise<ModuleDto[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

  const response = await get("/module", accessToken!, dataTags.modules);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

const ModulesPage = async () => {
  const modules = await getModules();

  return (
    <>
      <div className={styles.header_container}>
        <h1>Modules</h1>
        <ModuleDetailDialog buttonText="Add Module">
          <Plus size={24} color="white" />
        </ModuleDetailDialog>
      </div>

      <div className={styles.container}>
        {modules.length > 0 ? (
          <div className={styles.card_container}>
            {modules.map((curr) => {
              return <ModulesModule key={curr.id} module={curr} />;
            })}
          </div>
        ) : (
          <NothingHere />
        )}
      </div>
    </>
  );
};

export default ModulesPage;
