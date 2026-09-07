"use client";

import { useState, useTransition } from "react";
import { UserSettingsDto } from "../../../shared/usersettingsdto";
import AccountList from "./accountList";
import styles from "./content.module.scss";
import Header from "./header";
import PreferencesList from "./preferencesList";
import { DialogPhase } from "@/constants/types";
import { deleteAccount, signOut } from "@/lib/actions/auth";

interface ContentProps {
  userSettings: UserSettingsDto;
}

const Content = ({ userSettings }: ContentProps) => {
  const [isLoading, startTransition] = useTransition();

  const [phase, setPhase] = useState<DialogPhase>("closed");

  const signOutPress = () => {
    startTransition(async () => {
      const response = await signOut();

      if (response.error) {
        console.log(response.error);
      } else {
        window.location.href = "/auth";
      }
    });
  };

  const deleteAccountPress = () => {
    startTransition(async () => {
      const response = await deleteAccount();

      if (response.error) {
        console.log(response.error);
      } else {
        setPhase("closing");
        window.location.href = "/auth";
      }
    });
  };

  return (
    <>
      <Header userSettings={userSettings} isLoading={isLoading} />

      <div className={styles.container}>
        <PreferencesList userSettings={userSettings} isLoading={isLoading} />
        <AccountList phase={phase} setPhase={setPhase} isLoading={isLoading} onSignOut={signOutPress} onDelete={deleteAccountPress} />
      </div>
    </>
  );
};

export default Content;
