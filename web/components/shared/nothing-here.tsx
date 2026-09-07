import styles from "./nothing-here.module.scss";
import { Plus } from "lucide-react";
import ModuleDetailDialog from "./module-detail-dialog";

const NothingHere = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card_container}>
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
        <div className={styles.card} />
      </div>

      <div className={styles.overlayContent}>
        <div className={styles.dashedCard}>
          <span className={styles.questionMark}>?</span>
          <div className={styles.plusBadge}>+</div>
        </div>

        <h2 className={styles.title}>Nothing Here Yet</h2>
        <p className={styles.description}>
          It looks like you haven't created any modules yet.
          <br />
          Get started by adding your modules here!
        </p>

        <ModuleDetailDialog buttonText="Add Module">
          <Plus size={20} color="white" />
        </ModuleDetailDialog>
      </div>
    </div>
  );
};

export default NothingHere;
