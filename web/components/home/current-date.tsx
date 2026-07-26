"use client";

import { useEffect, useState } from "react";
import styles from "./current-date.module.scss";

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CurrentDate = () => {
  const [mounted, setMounted] = useState(false);
  const [dateInfo, setDateInfo] = useState({ name: "", text: "" });

  useEffect(() => {
    const now = new Date();
    setDateInfo({
      name: weekdayNames[now.getDay()],
      text: now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    });
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <div className={styles.skeleton_header} />
        <div className={styles.skeleton_date} />
      </>
    );
  }

  return (
    <>
      <h1 className={styles.header}>{dateInfo.name}</h1>
      <p className={styles.date}>{dateInfo.text}</p>
    </>
  );
};

export default CurrentDate;
