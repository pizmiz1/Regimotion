"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "./back-button.module.scss";

interface BackButtonProps {
  prev: string;
}

const BackButton = ({ prev }: BackButtonProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (prev === "modules") {
      router.push("/modules");
    } else {
      router.push("/");
    }
  };

  return (
    <button type="button" onClick={handleBack} className={styles.back_btn}>
      <ArrowLeft className={styles.icon} color="white" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
