"use client";

import styles from "./add-exercise.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import Exercise from "./exercise";
import { ExerciseDto, ModuleDto } from "../../../shared/moduledto";
import { JsonDto } from "../../../shared/jsondto";

interface AddExerciseProps {
  adding: boolean;
  setAdding: (state: boolean) => void;
  onAdd?: (newExercise: ExerciseDto) => Promise<JsonDto<ModuleDto>>;
}

const AddExercise = ({ adding, setAdding, onAdd }: AddExerciseProps) => {
  return (
    <div className={styles.container}>
      <AnimatePresence mode="popLayout">
        {adding ? (
          <motion.div key="exercise" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className={styles.divider} />
            <div className={styles.exercise_container}>
              <Exercise addExerciseForm={true} last={true} setAdding={setAdding} onAdd={onAdd} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.add_btn_container}
          >
            <button
              type="button"
              className={styles.add_btn}
              onClick={() => {
                setAdding(true);
              }}
            >
              Add Exercise
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddExercise;
