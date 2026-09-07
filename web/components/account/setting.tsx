"use client";

import { LucideIcon } from "lucide-react";
import styles from "./setting.module.scss";
import Switch from "./switch";

interface SettingProps {
  header: string;
  Icon: LucideIcon;
  value: boolean;
  setValue: (newValue: boolean) => void;
  description?: string;
  disabled?: boolean;
  iconFillColor?: string;
}

const Setting = ({ header, description, Icon, iconFillColor, value, disabled, setValue }: SettingProps) => {
  return (
    <div className={styles.setting_container}>
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

      <div className={styles.switch_container}>
        {value !== undefined && setValue !== undefined && <Switch value={value} setValue={setValue} disabled={disabled} />}
      </div>
    </div>
  );
};

export default Setting;
