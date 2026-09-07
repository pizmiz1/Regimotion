import styles from "./loading.module.scss";

const Loading = () => {
  return (
    <>
      <div className={styles.skeleton_header} />
      <div className={styles.skeleton_date} />
      <div className={styles.skeleton_container}>
        <div className={styles.skeleton_card_container}>
          <div className={styles.skeleton_card} />
          <div className={styles.skeleton_card} />
          <div className={styles.skeleton_card} />
          <div className={styles.skeleton_card} />
        </div>
      </div>
    </>
  );
};

export default Loading;
