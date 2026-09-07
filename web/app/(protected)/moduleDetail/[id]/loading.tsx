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

      <div className={styles.skeleton_action_btn_container}>
        <div className={styles.skeleton_action_btn} />
        <div className={styles.skeleton_action_btn} />
      </div>

      <div className={styles.skeleton_main_divider} />

      <div className={styles.skeleton_exercises}>
        <div className={styles.skeleton_exercise_container}>
          <div className={styles.skeleton_exercise_text} />
          <div className={styles.skeleton_exercise_btns} />
        </div>
        <div className={styles.skeleton_exercise_container}>
          <div className={styles.skeleton_exercise_text} />
          <div className={styles.skeleton_exercise_btns} />
        </div>
        <div className={styles.skeleton_exercise_container}>
          <div className={styles.skeleton_exercise_text} />
          <div className={styles.skeleton_exercise_btns} />
        </div>
        <div className={styles.skeleton_exercise_container}>
          <div className={styles.skeleton_exercise_text} />
          <div className={styles.skeleton_exercise_btns} />
        </div>
        <div className={styles.skeleton_exercise_container}>
          <div className={styles.skeleton_exercise_text} />
          <div className={styles.skeleton_exercise_btns} />
        </div>
        <div className={styles.skeleton_exercise_container}>
          <div className={styles.skeleton_exercise_text} />
          <div className={styles.skeleton_exercise_btns} />
        </div>
      </div>

      <div className={styles.skeleton_add_exercise} />
    </>
  );
};

export default Loading;
