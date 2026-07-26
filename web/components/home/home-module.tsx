import { ModuleDto } from "../../../shared/moduledto";
import Progress from "./progress";
import styles from "./home-module.module.scss";
import MatIcon from "../shared/mat-icon";
import { Check } from "lucide-react";
import Link from "next/link";

interface HomeModuleProps {
  module: ModuleDto;
}

export const HomeModuleSkeleton = () => {
  return <div className={styles.card_skeleton}></div>;
};

export const HomeModule = ({ module }: HomeModuleProps) => {
  return (
    <Link href={`/moduleDetail/${module.id}`} className={styles.card} prefetch={false}>
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
