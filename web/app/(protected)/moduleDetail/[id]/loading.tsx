import styles from "./loading.module.scss";

const Loading = () => {
  return (
    <>
      <div className={styles.skeleton_back_btn} />
      <div className={styles.skeleton_header}>
        <div className={styles.skeleton_header_text} />
        <div className={styles.skeleton_header_btn_container}>
          <div className={styles.skeleton_header_btn_1} />
          <div className={styles.skeleton_header_btn_2} />
        </div>
      </div>
    </>
  );
};

export default Loading;
