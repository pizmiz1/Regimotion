"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ExerciseDto, ModuleDto } from "../../../shared/moduledto";
import Exercise from "./exercise";
import styles from "./content.module.scss";
import AddExercise from "./add-exercise";
import { ArrowUpDown, Pencil } from "lucide-react";
import ModuleDetailDialog from "../shared/module-detail-dialog";
import { Reorder } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import successData from "@/public/Success.json";
import { patchModule } from "@/lib/actions/module";
import { dayMap } from "@/constants/maps";
import { UserSettingsDto } from "../../../shared/usersettingsdto";

interface ContentProps {
  module: ModuleDto;
  userSettings: UserSettingsDto;
}

const Content = ({ module, userSettings }: ContentProps) => {
  const [activeIndex, setActiveIndex] = useState(
    module.exercises.findIndex((item) => !item.completed) === -1 ? 0 : module.exercises.findIndex((item) => !item.completed),
  );
  const [editingExercise, setEditingExercise] = useState(false);
  const [adding, setAdding] = useState(false);
  const [reordering, setReordering] = useState(false);
  // Needs to be in state for Framer Reorder
  const [localExercises, setLocalExercises] = useState(module.exercises);
  const [showAnimation, setShowAnimation] = useState(false);

  const reorderContainerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const [isCompleting, startCompleteTransition] = useTransition();
  const [isReorderSaving, startReorderSaveTransition] = useTransition();

  const now = new Date();
  const todayKey = dayMap[now.getDay()];
  const moduleActive = module.days[todayKey];
  const done = localExercises.findIndex((item) => !item.completed) === -1;

  const finish = () => {
    const prevActiveIndex = activeIndex;
    const prevExercises = localExercises;

    const updatedExercises = module.exercises.map((curr) => ({ ...curr, completed: true }));
    const updatedModule: ModuleDto = { ...module, exercises: updatedExercises, progress: 100 };

    setLocalExercises(updatedExercises);
    setTimeout(() => {
      setActiveIndex(0);
    }, 200);

    if (userSettings.enableCompleteAnimation) {
      setShowAnimation(true);
    }

    startCompleteTransition(async () => {
      const response = await patchModule(updatedModule);

      if (response.error) {
        console.log(response.error);

        // Rollback
        setActiveIndex(prevActiveIndex);
        setLocalExercises(prevExercises);
      }
    });
  };

  const completePress = () => {
    const prevActiveIndex = activeIndex;
    const prevExercises = localExercises;

    const updatedExercises = module.exercises.map((exercise, index) => (index === activeIndex ? { ...exercise, completed: true } : exercise));
    const updatedModule = {
      ...module,
      progress: module.progress + 100 / localExercises.length,
      exercises: updatedExercises,
    };

    setActiveIndex(activeIndex + 1);
    setLocalExercises(updatedExercises);

    startCompleteTransition(async () => {
      const response = await patchModule(updatedModule);

      if (response.error) {
        console.log(response.error);

        // Rollback
        setActiveIndex(prevActiveIndex);
        setLocalExercises(prevExercises);
      }
    });
  };

  const restart = () => {
    const prevActiveIndex = activeIndex;
    const prevExercises = localExercises;

    const updatedExercises = module.exercises.map((curr) => ({ ...curr, completed: false }));
    const updatedModule = { ...module, exercises: updatedExercises, progress: 0 };

    if (!done) {
      setActiveIndex(0);
    }
    setLocalExercises(updatedExercises);

    startCompleteTransition(async () => {
      const response = await patchModule(updatedModule);

      if (response.error) {
        console.log(response.error);

        // Rollback
        if (!done) {
          setActiveIndex(prevActiveIndex);
        }
        setLocalExercises(prevExercises);
      }
    });
  };

  const saveReorder = () => {
    startReorderSaveTransition(async () => {
      let updatedExercises = localExercises;

      if (!done) {
        updatedExercises = localExercises.map((item, index) => (activeIndex > index ? { ...item, completed: true } : { ...item, completed: false }));
      }

      const updatedModule: ModuleDto = { ...module, exercises: updatedExercises };
      const response = await patchModule(updatedModule);

      if (response.error) {
        console.log(response.error);
      } else {
        setLocalExercises(response.data?.exercises!);
        setReordering(false);
      }
    });
  };

  const updateExercise = async (updatedExercise: ExerciseDto) => {
    const updatedModule = {
      ...module,
      exercises: localExercises.map((curr) => (curr.id === updatedExercise.id ? { ...updatedExercise } : { ...curr })),
    };
    const response = await patchModule(updatedModule);

    if (response.error) {
      console.log(response.error);
    } else {
      setLocalExercises(response.data?.exercises!);
    }

    return response;
  };

  const deleteExercise = async (exerciseId: string) => {
    const deleteExerciseIndex = localExercises.findIndex((curr) => curr.id === exerciseId);
    const updatedExercises = localExercises.filter((curr) => curr.id !== exerciseId);
    const completedCnt = updatedExercises.filter((curr) => curr.completed).length;
    const moduleProgress = (completedCnt / updatedExercises.length) * 100;
    const updatedModule = { ...module, exercises: updatedExercises, progress: moduleProgress };
    const response = await patchModule(updatedModule);

    if (response.error) {
      console.log(response.error);
    } else {
      setLocalExercises(response.data?.exercises!);
      if (activeIndex > deleteExerciseIndex) {
        setActiveIndex(activeIndex - 1);
      }
    }

    return response;
  };

  const addExercise = async (newExercise: ExerciseDto) => {
    const updatedExercises = [...localExercises, newExercise];
    const completedCnt = updatedExercises.filter((curr) => curr.completed).length;
    const moduleProgress = (completedCnt / updatedExercises.length) * 100;
    const updatedModule = { ...module, exercises: updatedExercises, progress: moduleProgress };
    const response = await patchModule(updatedModule);

    if (response.error) {
      console.log(response.error);
    } else {
      // Needed for the id on the new exercise - may not be able to use optimistic UI
      setLocalExercises(response.data?.exercises!);
      setAdding(false);
    }

    return response;
  };

  useEffect(() => {
    // Handle complete animation
    if (showAnimation) {
      document.body.style.overflow = "hidden";
      lottieRef.current?.setSpeed(1.5);
      lottieRef.current?.goToAndPlay(0);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAnimation]);

  return (
    <>
      <div className={styles.header_container}>
        <h1>{module.name}</h1>
        <div className={`${styles.header_btns} ${(adding || reordering || editingExercise) && styles.hidden}`}>
          <button
            type="button"
            className={`${styles.btn} ${localExercises.length < 2 && styles.hidden}`}
            onClick={() => {
              setReordering(true);
            }}
            disabled={localExercises.length < 2}
          >
            <span>Reorder</span>
            <ArrowUpDown className={styles.icon} color="white" />
          </button>

          <ModuleDetailDialog buttonText="Edit Module" module={module}>
            <Pencil className={styles.icon} color="white" />
          </ModuleDetailDialog>
        </div>
      </div>

      <div className={`${styles.action_btn_container} ${(adding || editingExercise) && styles.hidden}`}>
        {reordering ? (
          <>
            <button
              type="button"
              className={`${styles.btn} ${isReorderSaving && styles.hidden}`}
              onClick={() => {
                setLocalExercises(module.exercises);
                setReordering(false);
              }}
            >
              Cancel
            </button>
            <button type="button" className={`${styles.btn} ${isReorderSaving && styles.hidden}`} onClick={saveReorder}>
              Save
            </button>

            <div className={`${styles.spinner} ${isReorderSaving && styles.shown}`} />
          </>
        ) : (
          <>
            <button
              type="button"
              className={`${styles.btn} ${(localExercises.every((curr) => !curr.completed) || !moduleActive || localExercises.length === 0) && styles.hidden}`}
              onClick={restart}
              disabled={adding || localExercises.every((curr) => !curr.completed) || !moduleActive || localExercises.length === 0 || isCompleting}
            >
              Restart
            </button>
            <button
              type="button"
              className={`${styles.btn} ${(localExercises.every((curr) => curr.completed) || !moduleActive || localExercises.length === 0) && styles.hidden}`}
              onClick={finish}
              disabled={adding || localExercises.every((curr) => curr.completed) || !moduleActive || localExercises.length === 0 || isCompleting}
            >
              Finish
            </button>
          </>
        )}
      </div>

      <div className={styles.main_divider} />

      <div className={styles.list_container}>
        <div ref={reorderContainerRef} className={styles.list_group_container}>
          <Reorder.Group axis="y" values={localExercises} onReorder={setLocalExercises} className={styles.list_group}>
            {localExercises.map((curr, index) => {
              return (
                <Reorder.Item
                  key={curr.id}
                  value={curr}
                  drag={reordering ? "y" : false}
                  className={reordering ? styles.list_item : undefined}
                  dragElastic={0.1}
                  dragConstraints={reorderContainerRef}
                >
                  <Exercise
                    key={curr.id}
                    exercise={curr}
                    completed={activeIndex > index || done}
                    setEditingExercise={(state: boolean) => {
                      setEditingExercise(state);
                    }}
                    last={adding ? false : index === localExercises.length - 1}
                    adding={adding}
                    addExerciseForm={false}
                    reordering={reordering}
                    onUpdate={updateExercise}
                    onDelete={deleteExercise}
                  />
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>

        <button
          type="button"
          style={
            {
              "--translate-y": `calc(${activeIndex} * var(--move-factor))`,
            } as React.CSSProperties
          }
          className={`${styles.active_circle} ${(done || reordering || localExercises.length === 0 || !moduleActive) && styles.hidden}`}
          onClick={() => {
            if (activeIndex === localExercises.length - 1) {
              finish();
            } else {
              completePress();
            }
          }}
          disabled={done || editingExercise || adding || localExercises.length === 0 || isCompleting || !moduleActive}
        />
      </div>

      <div className={`${styles.add_btn} ${(reordering || editingExercise) && styles.hidden}`}>
        <AddExercise
          adding={adding}
          setAdding={(adding) => {
            if (done) {
              if (adding) {
                setActiveIndex(localExercises.length);
              } else {
                setActiveIndex(0);
              }
            }
            setAdding(adding);
          }}
          onAdd={addExercise}
        />
      </div>

      <div className={`${styles.lottie_overlay} ${showAnimation ? "" : styles.hidden}`}>
        <div className={styles.lottie_container}>
          <Lottie
            lottieRef={lottieRef}
            animationData={successData}
            loop={false}
            autoplay={true}
            onComplete={() => {
              setShowAnimation(false);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Content;
