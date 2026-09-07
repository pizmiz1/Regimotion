import Link from "next/link";
import styles from "./not-found.module.scss";
import { House } from "lucide-react";

const NotFound = () => {
  return (
    <div className={styles.container}>
      <p className={styles.header_text}>404</p>
      <p className={styles.description_text}>Oops something went wrong</p>
      <Link href="/" className={styles.home_btn}>
        Return Home
        <House size={20} color="white" />
      </Link>
    </div>
  );
};

export default NotFound;
