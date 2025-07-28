import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ImportMiroStartModal.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useUiModalContext } from "shared/ui-lib/UiModal";

export const IMPORT_MIRO_START_MODAL = Symbol("startImportMiro");

export const ImportMiroStartModal = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { closeModal } = useUiModalContext();

  const onClick = (): void => {
    window.location.href = "https://miro.com/app/dashboard/";
  };

  return (
    <UiModal
      modalId={IMPORT_MIRO_START_MODAL}
      className={styles.wr}
      wrClassName={styles.modal}
    >
      <h3 className={styles.title}>{t("miro.importMiro")}</h3>
      <p className={styles.text}>{t("miro.startModal.text")}</p>
      <div className={styles.btnsWr}>
        <UiButton
          variant="tertiary"
          onClick={closeModal}
          className={styles.cancelBtn}
          size="lg"
        >
          {t("miro.startModal.cancel")}
        </UiButton>
        <UiButton
          id={"miro"}
          variant="primary"
          onClick={onClick}
          className={styles.goToMiroBtn}
          size="lg"
        >
          {t("miro.startModal.goToMiroBtn")}
        </UiButton>
      </div>
    </UiModal>
  );
};
