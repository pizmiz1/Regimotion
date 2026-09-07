import styles from "./page.module.scss";
import { Plus } from "lucide-react";
import ModuleDetailDialog from "@/components/shared/module-detail-dialog";
import { ModulesModule } from "@/components/modules/modules-module";
import NothingHere from "@/components/shared/nothing-here";
import { getModules } from "@/lib/helpers/common-fetch";

const ModulesPage = async () => {
  const modules = await getModules();

  return (
    <>
      <div className={styles.header_container}>
        <h1>Modules</h1>
        <ModuleDetailDialog buttonText="Add Module">
          <Plus color="white" className={styles.icon} />
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
