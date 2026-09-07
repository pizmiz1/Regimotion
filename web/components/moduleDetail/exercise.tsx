"use client";

import { Check, Grip, Pencil, Trash, X } from "lucide-react";
import { ExerciseDto, ModuleDto } from "../../../shared/moduledto";
import styles from "./exercise.module.scss";
import { useEffect, useState, useTransition } from "react";
import { JsonDto } from "../../../shared/jsondto";

interface ExerciseProps {
  addExerciseForm: boolean;
  exercise?: ExerciseDto;
  completed?: boolean;
  setEditingExercise?: (state: boolean) => void;
  last?: boolean;
  adding?: boolean;
  setAdding?: (state: boolean) => void;
  reordering?: boolean;
  onUpdate?: (updatedExercise: ExerciseDto) => Promise<JsonDto<ModuleDto>>;
  onDelete?: (exerciseId: string) => Promise<JsonDto<ModuleDto>>;
  onAdd?: (newExercise: ExerciseDto) => Promise<JsonDto<ModuleDto>>;
}

const Exercise = ({
  addExerciseForm,
  exercise,
  completed,
  setEditingExercise,
  last,
  adding,
  setAdding,
  reordering,
  onUpdate,
  onDelete,
  onAdd,
}: ExerciseProps) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState<string | undefined>("");

  const [isUpdating, startUpdatingTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();
  const [isAdding, startAddingTransition] = useTransition();

  const add = () => {
    if (!onAdd) {
      return;
    }

    const newExercise: ExerciseDto = {
      name: name,
      text1: text1,
      text2: text2,
      completed: false,
    };

    startAddingTransition(async () => {
      const response = await onAdd(newExercise);

      if (response.error) {
        console.log(response.error);
      }
    });
  };

  const edit = () => {
    if (!exercise || !setEditingExercise) {
      return;
    }

    setName(exercise.name);
    setText1(exercise.text1);
    setText2(exercise.text2);
    setEditing(true);
    setEditingExercise(true);
  };

  const update = () => {
    if (!exercise || !setEditingExercise || !onUpdate) {
      return;
    }

    const updatedExercise: ExerciseDto = {
      ...exercise,
      name: name,
      text1: text1,
      text2: text2,
    };

    startUpdatingTransition(async () => {
      const response = await onUpdate(updatedExercise);

      if (response.error) {
        console.log(response.error);
      } else {
        setEditing(false);
        setEditingExercise(false);
      }
    });
  };

  const deleteExercise = () => {
    if (!exercise || !exercise.id || !setEditingExercise || !onDelete) {
      return;
    }

    setEditingExercise(true);

    startDeletingTransition(async () => {
      const response = await onDelete(exercise.id!);

      if (response.error) {
        console.log(response.error);
      }

      setEditingExercise(false);
    });
  };

  return (
    <div className={`${styles.container} ${adding && !addExerciseForm && styles.adding} ${reordering && styles.reordering}`}>
      {reordering ? (
        <div className={styles.reorder_icon_container}>
          <Grip size={35} color="white" />
        </div>
      ) : (
        <div className={`${styles.line} ${last && styles.last} ${completed && styles.completed}`}>
          <div className={`${styles.completed_circle} ${last && styles.circle_last} ${completed && styles.circle_active}`} />
          {addExerciseForm && <div className={styles.add_circle} />}
        </div>
      )}

      <form id="exerciseForm" className={`${styles.exercise_container} ${completed && styles.completed}`}>
        <label htmlFor="name" className={styles.exercise_hidden_label}>
          Name
        </label>
        {editing || addExerciseForm ? (
          <input
            autoFocus={true}
            name="name"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.exercise_name_input}
            placeholder="Name..."
            disabled={isUpdating}
          />
        ) : (
          <p className={styles.exercise_name}>{exercise ? exercise.name : ""}</p>
        )}
        <div className={styles.exercise_detail_container}>
          <label htmlFor="text1" className={styles.exercise_hidden_label}>
            Text1
          </label>
          {editing || addExerciseForm ? (
            <input
              name="text1"
              id="text1"
              type="text"
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className={styles.exercise_detail_input}
              placeholder="Text 1..."
              disabled={isUpdating}
            />
          ) : (
            <p className={styles.exercise_detail}>{exercise ? exercise.text1 : ""}</p>
          )}
          {(addExerciseForm || exercise?.text2 || editing) && (
            <>
              <div className={styles.exercise_detail_divider} />
              <label htmlFor="text2" className={styles.exercise_hidden_label}>
                Text2
              </label>
              {editing || addExerciseForm ? (
                <input
                  name="text2"
                  id="text2"
                  type="text"
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                  className={styles.exercise_detail_input}
                  placeholder="Text 2..."
                  disabled={isUpdating}
                />
              ) : (
                <p className={styles.exercise_detail}>{exercise ? exercise.text2 : ""}</p>
              )}
            </>
          )}
        </div>
      </form>

      <div className={styles.exercise_actions_container}>
        <div
          className={`${styles.btn_container} ${(isUpdating || isDeleting || editing || adding || addExerciseForm || reordering) && styles.slide_out}`}
        >
          <button type="button" className={styles.primary_btn} tabIndex={-1} onClick={edit}>
            <Pencil size={35} />
          </button>
          <button type="button" className={styles.delete_btn} tabIndex={-1} onClick={deleteExercise}>
            <Trash size={35} />
          </button>
        </div>

        <div className={`${styles.save_container_regular} ${editing && !isUpdating && styles.slide_in}`}>
          <button
            type="button"
            form="exerciseForm"
            className={styles.primary_btn}
            tabIndex={-1}
            onClick={update}
            disabled={name === "" || text1 === ""}
          >
            <Check size={45} />
          </button>
        </div>

        <div className={`${styles.save_container_adding} ${addExerciseForm && !isAdding && styles.slide_in}`}>
          <button
            type="button"
            form="exerciseForm"
            className={styles.secondary_btn}
            tabIndex={-1}
            onClick={() => {
              setAdding!(false);
            }}
          >
            <X size={35} />
          </button>
          <button type="button" form="exerciseForm" className={styles.primary_btn} tabIndex={-1} onClick={add} disabled={name === "" || text1 === ""}>
            <Check size={45} />
          </button>
        </div>

        <div className={`${styles.spinner} ${(isUpdating || isAdding || isDeleting) && styles.slide_in}`} />
      </div>
    </div>
  );
};

export default Exercise;
