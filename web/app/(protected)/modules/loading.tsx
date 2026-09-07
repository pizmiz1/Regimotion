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
