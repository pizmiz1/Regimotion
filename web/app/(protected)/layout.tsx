import Header from "@/components/header/header";
import { ReactNode } from "react";
import styles from "./layout.module.scss";

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default ProtectedLayout;
