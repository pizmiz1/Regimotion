"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "./back-button.module.scss";
import { useCallback } from "react";

const BackButton = () => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window === "undefined" || !window.history.state || window.history.state.idx <= 0) {
      router.push("/");
    } else {
      router.back();
    }
  }, [router]);

  return (
    <button type="button" onClick={handleBack} className={styles.back_btn}>
      <ArrowLeft size={24} color="white" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
