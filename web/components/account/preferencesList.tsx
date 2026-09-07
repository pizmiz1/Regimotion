"use client";

import styles from "./preferencesList.module.scss";
import { useState, useTransition } from "react";
import Setting from "./setting";
import { MousePointerClick, Sun } from "lucide-react";
import { UserSettingsDto } from "../../../shared/usersettingsdto";
import { patchUserSettings } from "@/lib/actions/userSettings";

interface PreferencesListProps {
  userSettings: UserSettingsDto;
  isLoading: boolean;
}

const PreferencesList = ({ userSettings, isLoading }: PreferencesListProps) => {
  const [completeAnimation, setCompleteAnimation] = useState(userSettings.enableCompleteAnimation);
  const [holdComplete, setHoldComplete] = useState(userSettings.enableHoldComplete);

  const [isSaving, startSavingTransition] = useTransition();

  const toggleCompleteAnimation = (newVal: boolean) => {
    const prev = completeAnimation;

    setCompleteAnimation(newVal);

    startSavingTransition(async () => {
      const newUserSettings: UserSettingsDto = { ...userSettings, enableCompleteAnimation: newVal };

      const response = await patchUserSettings(newUserSettings);

      if (response.error) {
        console.log(response.error);

        // Rollback
        setCompleteAnimation(prev);
      }
    });
  };

  const toggleHoldComplete = (newVal: boolean) => {
    const prev = holdComplete;

    setHoldComplete(newVal);

    startSavingTransition(async () => {
      const newUserSettings: UserSettingsDto = { ...userSettings, enableHoldComplete: newVal };

      const response = await patchUserSettings(newUserSettings);

      if (response.error) {
        console.log(response.error);

        // Rollback
        setHoldComplete(prev);
      }
    });
  };

  return (
    <div className={styles.container}>
      <p className={styles.header_text}>Preferences</p>
      <div className={styles.list_container}>
        <Setting
          header="Complete Animation"
          description="Animation when finishing a module"
          Icon={Sun}
          value={completeAnimation}
          setValue={toggleCompleteAnimation}
          disabled={isSaving || isLoading}
        />
        <div className={styles.divider} />
        <Setting
          header="Hold Complete"
          description="Hold down modules to complete"
          Icon={MousePointerClick}
          value={holdComplete}
          setValue={toggleHoldComplete}
          disabled={isSaving || isLoading}
        />
      </div>
    </div>
  );
};

export default PreferencesList;
