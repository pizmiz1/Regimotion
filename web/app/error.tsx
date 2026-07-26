"use client";

import Link from "next/link";
import styles from "./error.module.scss";
import { House } from "lucide-react";
import { usePathname } from "next/navigation";

const ErrorPage = () => {
  const path = usePathname();
  const showHomeButton = path !== "/";

  return (
    <div className={styles.container}>
      <p className={styles.header_text}>500</p>
      <p className={`${styles.description_text} ${!showHomeButton && styles.no_btn}`}>Something went wrong on our end.</p>
      {showHomeButton && (
        <Link href="/" className={styles.home_btn}>
          Return Home
          <House size={18} color="white" />
        </Link>
      )}
    </div>
  );
};

export default ErrorPage;
