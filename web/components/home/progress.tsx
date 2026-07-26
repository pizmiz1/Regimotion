"use client";

import styles from "./progress.module.scss";

interface ProgressProps {
  progress: number;
  color: string;
  style?: React.CSSProperties;
}

const Progress = ({ progress, color, style }: ProgressProps) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const fillStyle = {
    width: `${clampedProgress}%`,
    "--progress-fill-color": color,
  } as React.CSSProperties;

  return (
    <div className={styles.track} style={style}>
      <div className={styles.fill} style={fillStyle} />
    </div>
  );
};

export default Progress;
