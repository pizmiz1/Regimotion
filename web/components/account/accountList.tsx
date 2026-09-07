"use client";

import styles from "./accountList.module.scss";
import { LogOut, Trash } from "lucide-react";
import { colors } from "@/constants/colors";
import SettingButton from "./settingButton";
import DeleteAccountWarning from "./deleteAccountWarning";
import { DialogPhase } from "@/constants/types";
import { signOut } from "@/lib/actions/auth";

interface AccountListProps {
  phase: DialogPhase;
  setPhase: (newPhase: DialogPhase) => void;
  isLoading: boolean;
  onSignOut: () => void;
  onDelete: () => void;
}

const AccountList = ({ phase, setPhase, isLoading, onSignOut, onDelete }: AccountListProps) => {
  return (
    <div className={styles.container}>
      <DeleteAccountWarning phase={phase} setPhase={setPhase} isDeleting={isLoading} onDelete={onDelete} />

      <p className={styles.header_text}>Account</p>
      <div className={styles.list_container}>
        <SettingButton header="Sign Out" Icon={LogOut} iconFillColor={colors.primary} onPress={onSignOut} first={true} disabled={isLoading} />
        <div className={styles.divider} />
        <SettingButton
          header="Delete Account"
          Icon={Trash}
          iconFillColor="orangered"
          onPress={() => {
            setPhase("opening");
          }}
          last={true}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default AccountList;
