"use client";

import { useEffect, useRef } from "react";
import styles from "./deleteAccountWarning.module.scss";
import { DialogPhase } from "@/constants/types";
import { X } from "lucide-react";

interface DeleteAccountWarning {
  phase: DialogPhase;
  setPhase: (newPhase: DialogPhase) => void;
  isDeleting: boolean;
  onDelete: () => void;
}

const DeleteAccountWarning = ({ phase, setPhase, isDeleting, onDelete }: DeleteAccountWarning) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const requestClose = () => {
    if (phase === "closing" || phase === "closed") {
      return;
    }
    setPhase("closing");
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (phase === "opening" && !dialog.open) {
      dialog.showModal();

      const animationFrame = requestAnimationFrame(() => {
        setPhase("open");
      });

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [phase]);

  const isClosing = phase === "closing";

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        setPhase("closed");
      }}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== "opacity" || !isClosing) {
          return;
        }

        dialogRef.current?.close();
      }}
      data-state={phase}
      className={styles.modalDialog}
    >
      <div className={styles.header_container}>
        <div className={styles.invis} />

        <p className={styles.header_text}>Delete Account</p>

        <div className={styles.close_btn_container}>
          <button onClick={requestClose} type="button" aria-label="Close" className={styles.close_btn} disabled={isDeleting} hidden={true}>
            <X size={30} />
          </button>
        </div>
      </div>

      <p className={styles.description_text}>
        Are you sure you want to delete this account? You will lose all data tied to the account and this action cannot be undone.
      </p>

      <div className={styles.btn_container}>
        <button type="button" onClick={requestClose} className={styles.cancel_btn} disabled={isDeleting}>
          Cancel
        </button>
        <button type="button" onClick={onDelete} className={styles.delete_btn} disabled={isDeleting}>
          {isDeleting ? "Loading..." : "Delete"}
        </button>
      </div>
    </dialog>
  );
};

export default DeleteAccountWarning;
