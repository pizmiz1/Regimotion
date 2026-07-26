import { ModulesModuleSkeleton } from "@/components/modules/modules-module";
import styles from "./loading.module.scss";

const Loading = () => {
  return (
    <>
      <div className={styles.skeleton_header_container}>
        <h1>Modules</h1>
        <div className={styles.skeleton_add_btn} />
      </div>
      <div className={styles.skeleton_container}>
        <div className={styles.skeleton_card_container}>
          <ModulesModuleSkeleton />
          <ModulesModuleSkeleton />
          <ModulesModuleSkeleton />
          <ModulesModuleSkeleton />
        </div>
      </div>
    </>
  );
};

export default Loading;
