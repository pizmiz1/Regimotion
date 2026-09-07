"use client";

import { ModuleDto } from "../../../shared/moduledto";
import Progress from "./progress";
import styles from "./home-module.module.scss";
import MatIcon from "../shared/mat-icon";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRef, useTransition } from "react";
import { patchModule } from "@/lib/actions/module";
import { stopHolyLoader } from "holy-loader";
import { UserSettingsDto } from "../../../shared/usersettingsdto";

interface HomeModuleProps {
  module: ModuleDto;
  userSettings: UserSettingsDto;
}

export const HomeModule = ({ module, userSettings }: HomeModuleProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const [isCompleting, startCompleteTransition] = useTransition();

  const completeModule = async () => {
    const updatedExercises = module.exercises.map((curr) => ({ ...curr, completed: true }));
    const updatedModule: ModuleDto = { ...module, exercises: updatedExercises, progress: 100 };

    startCompleteTransition(async () => {
      const response = await patchModule(updatedModule);

      if (response.error) {
        console.log(response.error);
      }
    });
  };

  const startPress = () => {
    isLongPress.current = false;

    if (userSettings.enableHoldComplete && module.exercises.length > 0) {
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;

        if (module.progress !== 100) {
          completeModule();
        }
      }, 600);
    }
  };

  const endPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      stopHolyLoader();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        stopHolyLoader();
      }, 0);
    }
  };

  return (
    <Link
      href={`/moduleDetail/${module.id}?r=${Date.now()}&prev=home`}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onClick={handleClick}
      className={styles.card}
    >
      <div className={styles.header}>
        <MatIcon
          name={module.icon}
          sx={{
            fontSize: "6rem",
            color: "white",
          }}
        />
        {module.progress === 100 ? (
          <div className={styles.complete_chip} style={{ backgroundColor: module.color }}>
            <Check size={20} color="white" className={styles.complete_icon} />
          </div>
        ) : (
          <div className={styles.progress_chip} style={{ borderColor: module.color }}>
            <p>
              {module.exercises.filter((curr) => curr.completed === true).length}/{module.exercises.length}
            </p>
          </div>
        )}
      </div>
      <h1>{module.name}</h1>
      <Progress color={module.color} progress={module.progress} style={{ marginTop: "auto" }} />
    </Link>
  );
};
