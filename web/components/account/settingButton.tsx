"use client";

import { LucideIcon } from "lucide-react";
import styles from "./settingButton.module.scss";

interface SettingButtonProps {
  header: string;
  Icon: LucideIcon;
  onPress: () => void;
  description?: string;
  disabled?: boolean;
  iconFillColor?: string;
  first?: boolean;
  last?: boolean;
}

const SettingButton = ({ header, Icon, onPress, description, disabled, iconFillColor, first, last }: SettingButtonProps) => {
  const borderRadius = (): string => {
    if (first) {
      return "3.5rem 3.5rem 0 0";
    } else if (last) {
      return "0 0 3.5rem 3.5rem";
    } else {
      return "0";
    }
  };

  return (
    <button
      className={styles.setting_container}
      type="button"
      disabled={disabled}
      style={{ borderRadius: borderRadius() } as React.CSSProperties}
      onClick={onPress}
    >
      <div
        className={styles.icon_container}
        style={
          {
            "--icon-fill-color": iconFillColor,
          } as React.CSSProperties
        }
      >
        <Icon color="white" className={styles.icon} />
      </div>

      <div className={styles.text_container}>
        <p className={styles.header_text}>{header}</p>
        {description !== undefined && <p className={styles.description_text}>{description}</p>}
      </div>
    </button>
  );
};

export default SettingButton;
