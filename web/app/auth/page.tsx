"use client";

import styles from "./page.module.scss";
import Image from "next/image";
import { useState } from "react";
import OtpForm from "@/components/auth/otpForm";
import EmailForm from "@/components/auth/emailForm";

const AuthPage = () => {
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState<string | undefined>(undefined);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.graphic_area}>
          <div className={styles.fingerprint_bg}>
            <div className={styles.fingerprint_icon}>
              <Image src="/logo-clear.svg" alt="Regimotion Logo" width={70} height={70} priority className={styles.logo_icon} />
            </div>
          </div>
        </div>

        <div className={styles.header}>
          {verifying ? <h2>Verify Email</h2> : <h2>Welcome!</h2>}
          {verifying ? <p>Enter OTP</p> : <p>Goodbye disorganization</p>}
        </div>

        {verifying && email ? (
          <OtpForm
            email={email}
            back={() => {
              setVerifying(false);
            }}
          />
        ) : (
          <EmailForm
            success={(email: string) => {
              setEmail(email);
              setVerifying(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
