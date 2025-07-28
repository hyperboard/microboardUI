import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ImgAuthClipboardModal.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { useCopyBoardItems } from "../ImportMiroBoards/ImportBoardItem/useCopyBoardItems";
import { useAppContext } from "features/AppContext";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useUiModalContext } from "shared/ui-lib/UiModal";

export const MIRO_IMG_AUTH_CLIPBOARD = Symbol("imgAuthClipboardNotification");

export const ImgAuthClipboardModal = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { closeModal } = useUiModalContext();
  const { app } = useAppContext();

  const onAuthClick = (): void => {
    closeModal();

    // @ts-expect-error import.meta object didn't exists in common-js modules
    const clientId = import.meta.env.MIRO_CLIENT_ID;
    const redirectRoute = "/boards/blank?clipboard=true";
    const redirectUrl = window.location.origin + redirectRoute;

    window.location.href =
      "https://miro.com/oauth/authorize?response_type=code&client_id=" +
      clientId +
      "&redirect_uri=" +
      redirectUrl;
  };

  const onContinueClick = (): void => {
    closeModal();
    useCopyBoardItems(app.getBoard(), app.account.accessToken, undefined, true);
  };

  return (
    <UiModal
      modalId={MIRO_IMG_AUTH_CLIPBOARD}
      wrClassName={styles.modal}
      className={styles.wr}
    >
      <h3 className={styles.title}>{t("miro.imgAuthClipboardModal.title")}</h3>
      <p className={styles.text}>
        {t("miro.imgAuthClipboardModal.description")}
      </p>
      <div className={styles.btnWrapper}>
        <UiButton
          onClick={onAuthClick}
          className={styles.btn}
          variant="primary"
          size="lg"
        >
          {t("miro.imgAuthClipboardModal.authBtn")}
        </UiButton>
        <UiButton
          onClick={onContinueClick}
          className={styles.btnContinue}
          variant="tertiary"
          size="lg"
        >
          {t("miro.imgAuthClipboardModal.continueBtn")}
        </UiButton>
      </div>
    </UiModal>
  );
};
