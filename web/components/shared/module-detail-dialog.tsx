"use client";

import { ReactNode, useActionState, useEffect, useRef, useState, useTransition } from "react";
import styles from "./module-detail-dialog.module.scss";
import { Trash, X } from "lucide-react";
import { patchModuleForm, postModuleForm, deleteModule } from "@/lib/actions/module";
import { colors } from "@/constants/colors";
import MatIcon from "./mat-icon";
import { daysActiveMap, iconList, moduleColorList } from "@/constants/maps";
import { ModuleDto } from "../../../shared/moduledto";
import { validateColor, validateDaysActive, validateIcon, validateName } from "@/lib/validation/validation";
import { convertDays } from "@/lib/helpers/day-converter";
import { useRouter, useSearchParams } from "next/navigation";
import { DialogPhase } from "@/constants/types";

interface ModuleDetailDialogProps {
  buttonText: string;
  children?: ReactNode;
  module?: ModuleDto;
}

const ModuleDetailDialog = ({ buttonText, children, module }: ModuleDetailDialogProps) => {
  const [phase, setPhase] = useState<DialogPhase>("closed");
  const [name, setName] = useState(module ? module.name : "");
  const [color, setColor] = useState(module ? module.color : "");
  const [icon, setIcon] = useState(module ? module.icon : "");
  const [daysActive, setDaysActive] = useState<string[]>(module ? (convertDays(module.days, false) as string[]) : []);
  const [error, setError] = useState<string | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const lastProcessedStateRef = useRef<typeof state | null>(null);

  const [state, formAction, isLoading] = useActionState(module ? patchModuleForm : postModuleForm, {});
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const prev = searchParams.get("prev");
  const isClosing = phase === "closing";
  const nameValid = validateName(name);
  const colorValid = validateColor(color);
  const iconValid = validateIcon(icon);
  const daysActiveValid = validateDaysActive(daysActive);

  const requestClose = () => {
    if (phase === "closing" || phase === "closed") {
      return;
    }
    setPhase("closing");
  };

  const deleteMod = () => {
    if (!module) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteModule(module.id!);

      if (result.error) {
        setError(result.error);
      } else {
        requestClose();
        if (prev === "home") {
          router.push("/");
        } else {
          router.push("/modules");
        }
      }
    });
  };

  useEffect(() => {
    // Dialog open/close
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

  useEffect(() => {
    // Required for useActionState, can't use derived state
    if (phase === "closed") {
      return;
    }

    if (lastProcessedStateRef.current === state) {
      return;
    }

    lastProcessedStateRef.current = state;

    if (state.error) {
      setError(state.error);
    } else if (state.data) {
      requestClose();
    }
  }, [state, phase]);

  return (
    <>
      <button
        onClick={() => {
          setPhase("opening");
        }}
        className={styles.btn}
      >
        <span>{buttonText}</span>
        {children}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => {
          setPhase("closed");
          setName(module ? module.name : "");
          setColor(module ? module.color : "");
          setIcon(module ? module.icon : "");
          setDaysActive(module ? (convertDays(module.days, false) as string[]) : []);
          setConfirmingDelete(false);
          setError(undefined);
        }}
        onCancel={(event) => {
          event.preventDefault();
          if (isLoading || isDeleting) {
            return;
          }
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
          <div className={styles.delete_container}>
            <button
              onClick={() => {
                setConfirmingDelete(true);
              }}
              type="button"
              aria-label="Delete"
              className={`${styles.header_btn} ${styles.delete_btn} ${module ? "" : styles.hidden} ${confirmingDelete ? styles.slide_out : ""}`}
              disabled={isLoading || !module}
            >
              <Trash size={30} />
            </button>

            <div className={`${styles.delete_confirm_container} ${confirmingDelete && styles.slide_in}`}>
              <span>Delete Module?</span>
              <div className={styles.delete_btn_container}>
                <button
                  type="button"
                  className={styles.no_btn}
                  onClick={() => {
                    setConfirmingDelete(false);
                  }}
                  disabled={isLoading || isDeleting}
                >
                  No
                </button>
                <button type="button" className={styles.yes_btn} onClick={deleteMod} disabled={isLoading || isDeleting}>
                  {isDeleting ? "Deleting..." : "Yes"}
                </button>
              </div>
            </div>
          </div>
          <p className={`${styles.header_text} ${module ? "" : styles.new}`}>{module ? module.name : "New Module"}</p>
          <div className={styles.close_btn_container}>
            <button
              onClick={() => {
                requestClose();
              }}
              type="button"
              aria-label="Close"
              className={`${styles.header_btn} ${styles.close_btn}`}
              disabled={isLoading || isDeleting}
              hidden={true}
            >
              <X size={30} />
            </button>
          </div>
        </div>

        <form className={styles.form} action={formAction} key={`${module?.id ?? "new"}-${phase === "closed"}`}>
          {module && <input type="hidden" name="id" value={module.id} />}

          <div className={`${styles.section_container} ${styles.name_container}`}>
            <div className={styles.name_label_container}>
              <label htmlFor="name" className={styles.section_label}>
                Name
              </label>
              <span>{name.length}/15</span>
            </div>
            <input
              name="name"
              id="name"
              type="text"
              placeholder="Name"
              value={name}
              disabled={isLoading || isDeleting}
              onChange={(e) => {
                if (error) {
                  setError(undefined);
                }
                setName(e.target.value);
              }}
              maxLength={15}
            />
            <div className={`${styles.error_wrapper} ${!nameValid && name !== "" && styles.active}`}>
              <p className={styles.error_text}>Invalid Name</p>
            </div>
          </div>

          <div className={styles.section_container}>
            <span className={styles.section_label}>Color</span>
            <div className={styles.color_picker}>
              {moduleColorList.map((curr) => {
                let colorClassName;
                switch (curr) {
                  case colors.primary: {
                    colorClassName = styles.swatch_primary;
                    break;
                  }
                  case colors.orangeCompliment: {
                    colorClassName = styles.swatch_orange;
                    break;
                  }
                  case colors.blueCompliment: {
                    colorClassName = styles.swatch_blue;
                    break;
                  }
                }

                return (
                  <label className={styles.color_option} key={curr}>
                    <input
                      type="radio"
                      name="color"
                      value={curr}
                      className={styles.color_input}
                      checked={color === curr}
                      onChange={(e) => {
                        if (error) {
                          setError(undefined);
                        }
                        setColor(e.target.value);
                      }}
                      disabled={isLoading || isDeleting}
                    />
                    <span className={`${styles.color_swatch} ${colorClassName} ${color === curr && styles.selected}`}></span>
                  </label>
                );
              })}
            </div>
            <div className={`${styles.error_wrapper} ${!colorValid && color !== "" && styles.active}`}>
              <p className={styles.error_text}>Invalid Color</p>
            </div>
          </div>

          <div className={styles.section_container}>
            <span className={styles.section_label}>Icon</span>

            <div className={styles.icon_container}>
              {iconList.map((key) => {
                const isChecked = icon === key;

                return (
                  <label key={key} className={`${styles.icon_label} ${isChecked && styles.selected}`}>
                    <input
                      type="radio"
                      name="icon"
                      value={key}
                      checked={isChecked}
                      onChange={(e) => {
                        if (error) {
                          setError(undefined);
                        }
                        setIcon(e.target.value);
                      }}
                      className={styles.radio_input}
                      disabled={isLoading || isDeleting}
                    />
                    <MatIcon
                      name={key}
                      sx={{
                        fontSize: "5.2rem",
                        color: "black",
                      }}
                    />
                  </label>
                );
              })}
            </div>
            <div className={`${styles.error_wrapper} ${!iconValid && icon !== "" && styles.active}`}>
              <p className={styles.error_text}>Invalid Icon</p>
            </div>
          </div>

          <div className={styles.section_container}>
            <span className={styles.section_label}>Days Active</span>

            <div className={styles.days_container}>
              {Object.entries(daysActiveMap).map(([key, value]) => {
                const isChecked = daysActive.includes(key);

                return (
                  <label key={key} className={`${styles.icon_label} ${isChecked && styles.selected}`}>
                    <input
                      type="checkbox"
                      name="daysActive"
                      value={key}
                      checked={isChecked}
                      onChange={(e) => {
                        const { value, checked } = e.target;

                        if (checked) {
                          setDaysActive((prev) => [...prev, value]);
                        } else {
                          setDaysActive((prev) => prev.filter((item) => item !== value));
                        }

                        if (error) {
                          setError(undefined);
                        }
                      }}
                      className={styles.radio_input}
                      disabled={isLoading || isDeleting}
                    />
                    {value}
                  </label>
                );
              })}
            </div>
            <div className={`${styles.error_wrapper} ${!daysActiveValid && daysActive.length !== 0 && styles.active}`}>
              <p className={styles.error_text}>Invalid Days</p>
            </div>
          </div>

          <div className={styles.btn_container}>
            <button
              type="button"
              disabled={(name === "" && color === "" && icon === "" && daysActive.length === 0) || isLoading || isDeleting}
              onClick={() => {
                setName("");
                setColor("");
                setIcon("");
                setDaysActive([]);
                setError(undefined);
              }}
              className={styles.reset_btn}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={!nameValid || !colorValid || !iconValid || !daysActiveValid || error !== undefined || isLoading || isDeleting}
              className={styles.submit_btn}
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>
          </div>

          <div className={`${styles.error_wrapper} ${error && styles.active}`}>
            <p className={styles.error_text}>{error}</p>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default ModuleDetailDialog;
