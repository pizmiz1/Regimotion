"use client";

import styles from "./switch.module.scss";

interface SwitchProps {
  value: boolean;
  setValue: (newValue: boolean) => void;
  disabled?: boolean;
}

const Switch = ({ value, setValue, disabled }: SwitchProps) => {
  const handleToggle = () => {
    if (!disabled) {
      setValue(!value);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={handleToggle}
      className={`
        ${styles.switchContainer}
        ${value ? styles.trackTrue : styles.trackFalse}
      `}
    >
      <span
        className={`
          ${styles.thumb}
          ${value ? styles.thumbTrue : styles.thumbFalse}
        `}
      />
    </button>
  );
};

export default Switch;
