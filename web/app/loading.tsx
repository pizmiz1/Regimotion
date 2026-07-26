"use client";

import { useState } from "react";
import styles from "./loading.module.scss";

const Loading = () => {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className={styles.container}>
      {!videoError ? (
        <video autoPlay muted loop playsInline controls={false} preload="auto" width={183} height={183} onError={() => setVideoError(true)}>
          <source src="/loading.webm" type="video/webm" />
        </video>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
};

export default Loading;
