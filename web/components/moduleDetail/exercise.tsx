"use client";

import { Check, Circle, Grip, List, Pencil, Trash, X } from "lucide-react";
import { ExerciseDto } from "../../../shared/moduledto";
import styles from "./exercise.module.scss";
import { useEffect, useRef, useState } from "react";

interface ExerciseProps {
  exercise?: ExerciseDto;
  completed?: boolean;
  disableActive?: (state: boolean) => void;
  last?: boolean;
  adding?: boolean;
  addExerciseForm: boolean;
  setAdding?: (state: boolean) => void;
  reordering?: boolean;
}

const Exercise = ({ exercise, completed, disableActive, last, adding, addExerciseForm, setAdding, reordering }: ExerciseProps) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(exercise ? exercise.name : "");
  const [text1, setText1] = useState(exercise ? exercise.text1 : "");
  const [text2, setText2] = useState(exercise ? exercise.text2 : "");

  const nameRef = useRef<HTMLInputElement>(null);

  const addExercise = () => {
    // TODO - Functionality - tie form to server action useActionState
    setEditing(false);
    setSaving(true);
  };

  const saveExercise = () => {
    // TODO - Functionality - tie form to server action useActionState
    setEditing(false);
    setSaving(true);
  };

  const deleteExercise = () => {
    // TODO - Functionality
    setSaving(true);
    disableActive!(true);
  };

  useEffect(() => {
    if (editing || addExerciseForm) {
      nameRef.current?.focus();
    }
  }, [editing, adding]);

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
        {editing || saving || addExerciseForm ? (
          <input
            ref={nameRef}
            name="name"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.exercise_name_input}
            placeholder="Name..."
            disabled={saving}
          />
        ) : (
          <p className={styles.exercise_name}>{exercise ? exercise.name : ""}</p>
        )}
        <div className={styles.exercise_detail_container}>
          <label htmlFor="text1" className={styles.exercise_hidden_label}>
            Text1
          </label>
          {editing || saving || addExerciseForm ? (
            <input
              name="text1"
              id="text1"
              type="text"
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className={styles.exercise_detail_input}
              placeholder="Text 1..."
              disabled={saving}
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
              {editing || saving || addExerciseForm ? (
                <input
                  name="text2"
                  id="text2"
                  type="text"
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                  className={styles.exercise_detail_input}
                  placeholder="Text 2..."
                  disabled={saving}
                />
              ) : (
                <p className={styles.exercise_detail}>{exercise ? exercise.text2 : ""}</p>
              )}
            </>
          )}
        </div>
      </form>

      <div className={styles.exercise_actions_container}>
        <div className={`${styles.btn_container} ${(saving || editing || adding || addExerciseForm || reordering) && styles.slide_out}`}>
          <button
            type="button"
            className={styles.primary_btn}
            tabIndex={-1}
            onClick={() => {
              setEditing(true);
              disableActive!(true);
            }}
          >
            <Pencil size={35} />
          </button>
          <button type="button" className={styles.delete_btn} tabIndex={-1} onClick={deleteExercise}>
            <Trash size={35} />
          </button>
        </div>

        <div className={`${styles.save_container_regular} ${editing && styles.slide_in}`}>
          <button type="submit" form="exerciseForm" className={styles.primary_btn} tabIndex={-1} onClick={saveExercise} disabled={name === ""}>
            <Check size={45} />
          </button>
        </div>

        <div className={`${styles.save_container_adding} ${addExerciseForm && !saving && styles.slide_in}`}>
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
          <button type="submit" form="exerciseForm" className={styles.primary_btn} tabIndex={-1} onClick={addExercise}>
            <Check size={45} />
          </button>
        </div>

        <div className={`${styles.spinner} ${saving && styles.slide_in}`} />
      </div>
    </div>
  );
};

export default Exercise;
