import { HomeModuleSkeleton } from "@/components/home/home-module";
import styles from "./loading.module.scss";

const Loading = () => {
  return (
    <>
      <div className={styles.skeleton_header} />
      <div className={styles.skeleton_date} />
      <div className={styles.skeleton_container}>
        <div className={styles.skeleton_card_container}>
          <HomeModuleSkeleton />
          <HomeModuleSkeleton />
          <HomeModuleSkeleton />
          <HomeModuleSkeleton />
        </div>
      </div>
    </>
  );
};

export default Loading;
