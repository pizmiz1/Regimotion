import styles from "./loading.module.scss";

const Loading = () => {
  return (
    <>
      <div className={styles.skeleton_header_container}>
        <div className={styles.skeleton_header_left}>
          <div className={styles.skeleton_icon} />
          <div className={styles.skeleton_header_text}>
            <div className={styles.skeleton_header_username} />
            <div className={styles.skeleton_header_email} />
          </div>
        </div>
        <div className={styles.skeleton_header_right} />
      </div>

      <div className={styles.skeleton_content}>
        <div>
          <p className={styles.skeleton_content_list_header}>Preferences</p>
          <div className={styles.skeleton_content_list} />
        </div>
        <div>
          <p className={styles.skeleton_content_list_header}>Account</p>
          <div className={styles.skeleton_content_list} />
        </div>
      </div>
    </>
  );
};

export default Loading;
