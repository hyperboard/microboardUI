import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./AuthClipboardModal.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";

export const AUTH_CLIPBOARD_MODAL = Symbol("authClipboardMiro");

export const AuthClipboardModal = (): JSX.Element => {
  const { t } = useTranslation();

  const onClick = (): void => {
    window.location.href = "/auth/sign-in";
  };

  return (
    <UiModal
      modalId={AUTH_CLIPBOARD_MODAL}
      wrClassName={styles.modal}
      className={styles.wr}
    >
      <h3 className={styles.title}>{t("miro.authClipboardModal.title")}</h3>
      <p className={styles.text}>{t("miro.authClipboardModal.description")}</p>
      <UiButton
        onClick={onClick}
        className={styles.btn}
        variant="primary"
        size="lg"
      >
        {t("miro.authClipboardModal.authBtn")}
      </UiButton>
    </UiModal>
  );
};
