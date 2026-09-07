"use client";

import { useState, useTransition } from "react";
import { UserSettingsDto } from "../../../shared/usersettingsdto";
import styles from "./header.module.scss";
import { animalColorMap, animalMap } from "@/constants/maps";
import Image from "next/image";
import { generateSlug } from "random-word-slugs";
import { patchUserSettings } from "@/lib/actions/userSettings";

interface HeaderProps {
  userSettings: UserSettingsDto;
  isLoading: boolean;
}

const Header = ({ userSettings, isLoading }: HeaderProps) => {
  const [localUserName, setLocalUserName] = useState(userSettings.userName);
  const [localAnimal, setLocalAnimal] = useState(animalMap[userSettings.userName.split(" ")[1] as keyof typeof animalMap]);
  const [localAnimalColor, setLocalAnimalColor] = useState(userSettings.userColor);

  const [isSaving, startSavingTransition] = useTransition();

  const newDigs = () => {
    const animalNames = Object.keys(animalMap) as Array<keyof typeof animalMap>;
    const colorValues = Object.values(animalColorMap);

    let animalName = localUserName.split(" ")[1] as keyof typeof animalMap;
    while (animalNames.length > 1 && animalName === (localUserName.split(" ")[1] as keyof typeof animalMap)) {
      const randomIndex = Math.floor(Math.random() * animalNames.length);
      animalName = animalNames[randomIndex];
    }

    let animalColor = localAnimalColor;
    while (colorValues.length > 1 && animalColor === localAnimalColor) {
      const randomIndex = Math.floor(Math.random() * colorValues.length);
      animalColor = colorValues[randomIndex];
    }

    const randomAdjective = generateSlug(1, {
      partsOfSpeech: ["adjective"],
    });

    const newUserName = randomAdjective + " " + animalName;

    const prevUserName = localUserName;
    const prevAnimal = localAnimal;
    const prevAnimalColor = localAnimalColor;

    setLocalUserName(newUserName);
    setLocalAnimal(animalMap[animalName]);
    setLocalAnimalColor(animalColor);

    startSavingTransition(async () => {
      const newUserSettings: UserSettingsDto = { ...userSettings, userName: newUserName, userColor: animalColor };

      const response = await patchUserSettings(newUserSettings);

      if (response.error) {
        console.log(response.error);

        // Rollback
        setLocalUserName(prevUserName);
        setLocalAnimal(prevAnimal);
        setLocalAnimalColor(prevAnimalColor);
      }
    });
  };

  return (
    <div className={styles.header_container}>
      <div className={styles.header_info_container}>
        <div className={styles.icon_container} style={{ "--animal-bg-color": localAnimalColor } as React.CSSProperties}>
          <Image src={localAnimal} alt="Animal" className={styles.icon} />
        </div>
        <div className={styles.text_container}>
          <h1 className={styles.header}>{localUserName}</h1>
          <p className={styles.sub_header}>{userSettings.userEmail}</p>
        </div>
      </div>

      <button type="button" className={styles.btn} onClick={newDigs} disabled={isSaving || isLoading}>
        <span>New Digs</span>
      </button>
    </div>
  );
};

export default Header;
