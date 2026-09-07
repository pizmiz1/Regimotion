import { DaysDto, ModuleDto } from "../../../shared/moduledto";
import styles from "./modules-module.module.scss";
import MatIcon from "../shared/mat-icon";
import Link from "next/link";

interface ModulesModuleProps {
  module: ModuleDto;
}

const dayMap: { key: keyof DaysDto; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tues", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thur", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export const ModulesModule = ({ module }: ModulesModuleProps) => {
  let hoverColor = "rgba(22, 23, 34, 0.9)";

  switch (module.color) {
    case "#6855d5": {
      hoverColor = "#7d6ce0";
      break;
    }
    case "#4169e1": {
      hoverColor = "#5c7feb";
      break;
    }
    case "#D56855": {
      hoverColor = "#dd7e6d";
      break;
    }
  }

  const getActiveDaysString = (days: DaysDto): string => {
    const activeLabels = dayMap.filter(({ key }) => days[key] === true).map(({ label }) => label);

    let retVal = activeLabels.join(", ");

    if (retVal === "Mon, Tue, Wed, Thu, Fri, Sat, Sun") {
      retVal = "Everyday";
    } else if (retVal === "Mon, Tue, Wed, Thu, Fri") {
      retVal = "Weekdays";
    } else if (retVal === "Sat, Sun") {
      retVal = "Weekends";
    }

    return retVal;
  };

  return (
    <Link
      href={`/moduleDetail/${module.id}?r=${Date.now()}&prev=modules`}
      className={styles.card}
      style={
        {
          "--module-color": module.color,
          "--module-hover-color": hoverColor,
        } as React.CSSProperties
      }
    >
      <MatIcon
        name={module.icon}
        sx={{
          fontSize: "6rem",
          color: "white",
        }}
      />
      <h1>{module.name}</h1>
      <p>{getActiveDaysString(module.days)}</p>
    </Link>
  );
};
