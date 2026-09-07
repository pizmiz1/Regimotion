"use client";

import { useActionState, useRef, useState } from "react";
import styles from "./otpForm.module.scss";
import { verifyOtpForm } from "@/lib/actions/auth";
import { validateOtp } from "@/lib/validation/validation";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";

interface OtpFormProps {
  email: string;
  back: () => void;
}

const OtpForm = ({ email, back }: OtpFormProps) => {
  const [otp, setOtp] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isLoading] = useActionState(verifyOtpForm, {});

  const otpValid = validateOtp(otp);

  const handleComplete = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} className={styles.form} action={formAction}>
      <input type="hidden" name="email" value={email} />

      <OTPInput
        autoFocus={true}
        maxLength={6}
        name="otp"
        value={otp}
        onChange={setOtp}
        onComplete={handleComplete}
        disabled={isLoading}
        pattern={REGEXP_ONLY_DIGITS}
        containerClassName={styles.otpGroup}
        render={({ slots }) => (
          <>
            {slots.map((slot, index) => (
              <div
                key={index}
                data-active={slot.isActive ? "true" : undefined}
                data-disabled={isLoading ? "true" : undefined}
                className={styles.otpSlot}
              >
                {slot.char ?? slot.placeholderChar}
              </div>
            ))}
          </>
        )}
      />

      <a href="#" onClick={back} className={isLoading ? styles.disabledLink : undefined}>
        Enter Email
      </a>

      <button type="submit" disabled={!otpValid || isLoading}>
        {isLoading ? "Verifying..." : "Submit"}
      </button>

      {state.error && <p>{state.error}</p>}
    </form>
  );
};

export default OtpForm;
