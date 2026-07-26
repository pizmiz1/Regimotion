"use client";

import { useEffect, useRef, useState } from "react";
import { ModuleDto } from "../../../shared/moduledto";
import Exercise from "./exercise";
import styles from "./content.module.scss";
import AddExercise from "./add-exercise";
import { usePathname } from "next/navigation";
import { ArrowUpDown, Pencil } from "lucide-react";
import ModuleDetailDialog from "../shared/module-detail-dialog";
import { Reorder } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import successData from "@/public/Success.json";

interface ContentProps {
  module: ModuleDto;
}

const Content = ({ module }: ContentProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [moveFactor, setMoveFactor] = useState(0);
  const [done, setDone] = useState(false);
  const [disableActive, setDisableActive] = useState(false);
  const [adding, setAdding] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localExercises, setLocalExercises] = useState(module.exercises);
  const [showAnimation, setShowAnimation] = useState(false);

  const pathname = usePathname();

  const reorderContainerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const finish = () => {
    // TODO - Functionality
  };

  const restart = () => {
    // TODO - Functionality

    // Testing
    setShowAnimation(true);
  };

  const saveReorder = () => {
    // TODO - Functionality
    setSaving(true);
  };

  useEffect(() => {
    const updateMoveFactor = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // TODO - Media Queries
      if (height < 800) {
        setMoveFactor(13.7);
      } else {
        setMoveFactor(13.605);
      }
    };

    updateMoveFactor();
    window.addEventListener("resize", updateMoveFactor);
    return () => window.removeEventListener("resize", updateMoveFactor);
  }, []);

  useEffect(() => {
    // Handle go back
    setAdding(false);
  }, [pathname]);

  useEffect(() => {
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
        <div className={`${styles.header_btns} ${reordering && styles.hidden}`}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setReordering(true);
            }}
          >
            <span>Reorder</span>
            <ArrowUpDown size={24} color="white" />
          </button>

          <ModuleDetailDialog buttonText="Edit Module" module={module}>
            <Pencil size={24} color="white" />
          </ModuleDetailDialog>
        </div>
      </div>

      <div className={`${styles.action_btn_container} ${adding && styles.hidden}`}>
        {reordering ? (
          <>
            <button
              type="button"
              className={`${styles.btn} ${saving && styles.hidden}`}
              onClick={() => {
                setLocalExercises(module.exercises);
                setReordering(false);
              }}
            >
              Cancel
            </button>
            <button type="button" className={`${styles.btn} ${saving && styles.hidden}`} onClick={saveReorder}>
              Save
            </button>

            <div className={`${styles.spinner} ${saving && styles.shown}`} />
          </>
        ) : (
          <>
            <button type="button" className={styles.btn} onClick={restart} disabled={adding}>
              Restart
            </button>
            <button type="button" className={styles.btn} onClick={finish} disabled={adding}>
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
                    disableActive={(state: boolean) => {
                      setDisableActive(state);
                    }}
                    last={adding ? false : index === module.exercises.length - 1}
                    adding={adding}
                    addExerciseForm={false}
                    reordering={reordering}
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
              "--translate-y": `calc(${activeIndex * moveFactor}rem)`,
            } as React.CSSProperties
          }
          className={`${styles.active_circle} ${(done || reordering) && styles.hidden}`}
          onClick={() => {
            if (activeIndex === module.exercises.length - 1) {
              setDone(true);
            } else {
              setActiveIndex(activeIndex + 1);
            }
          }}
          disabled={done || disableActive || adding}
        />
      </div>

      <div className={reordering ? styles.hidden : undefined}>
        <AddExercise adding={adding} setAdding={setAdding} />
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
