"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import styles from "./emailForm.module.scss";
import { generateOtpForm } from "@/lib/actions/auth";
import { validateEmail } from "@/lib/validation/validation";

interface EmailFormProps {
  success: (email: string) => void;
}

const EmailForm = ({ success }: EmailFormProps) => {
  const [email, setEmail] = useState("");

  const [state, formAction, isLoading] = useActionState(generateOtpForm, {});

  useEffect(() => {
    // Required for useActionState, can't use derived state
    if (state.data) {
      success(email);
    }
  }, [state.data]);

  const emailValid = validateEmail(email);

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.email_container}>
        <input
          autoFocus={true}
          name="email"
          type="text"
          placeholder="E-mail"
          value={email}
          disabled={isLoading}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        {!emailValid && state.error && <p>{"Please enter a valid email address."}</p>}
      </div>

      <button type="submit" disabled={!emailValid || isLoading}>
        {isLoading ? "Loading..." : "Submit"}
      </button>

      {state.error && <p>{state.error}</p>}
    </form>
  );
};

export default EmailForm;
