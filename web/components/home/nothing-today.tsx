import { MoonStar } from "lucide-react";
import styles from "./nothing-today.module.scss";

const NothingToday = () => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <div className={styles.ambientGlow} aria-hidden="true" />
        <MoonStar className={styles.icon} size={180} strokeWidth={1.25} />
      </div>

      <h2 className={styles.title}>Nothing Here</h2>
      <p className={styles.description}>It looks like you have no modules for today!</p>
    </div>
  );
};

export default NothingToday;
