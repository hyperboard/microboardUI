import React, { useEffect, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { OpacityTransition } from "../Transitions";
import styles from "./UiModal.module.css";
import { useUiModalContext } from "./UiModalContext";
import clsx from "clsx";
import { LOADING_NOTIFICATION } from "features/ImportMiro/ImportMiroBoards/Notifications/LoadingNotification";
import { SUCCESS_NOTIFICATION } from "features/ImportMiro/ImportMiroBoards/Notifications/SuccessNotification";
import { ERROR_NOTIFICATION } from "features/ImportMiro/ImportMiroBoards/Notifications/ErrorNotification";
import { WARN_CLIPBOARD_NOTIFICATION } from "features/ImportMiro/ImportMiroBoards/Notifications/WarnClipboardNotification";
import { WARN_NOTIFICATION } from "features/ImportMiro/ImportMiroBoards/Notifications/WarnNotification";

const modalsContainer = document.getElementById("modal")!;

export function UiModalBackground({
  children,
}: PropsWithChildren<{}>): React.JSX.Element {
  const { openedModalId, closeModal, isRenderedAsPage } = useUiModalContext();

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "keydown",
      (ev) => {
        if (ev.key === "Escape" && openedModalId) {
          closeModal();
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  });

  const isBlackout =
    openedModalId !== LOADING_NOTIFICATION &&
    openedModalId !== SUCCESS_NOTIFICATION &&
    openedModalId !== ERROR_NOTIFICATION &&
    openedModalId !== WARN_CLIPBOARD_NOTIFICATION &&
    openedModalId !== WARN_NOTIFICATION;

  const renderAsPage = isRenderedAsPage(openedModalId);

  return createPortal(
    <OpacityTransition
      timeout={500}
      inProp={Boolean(openedModalId)}
      unmountOnExit
    >
      <div
        className={clsx({
          [styles.blackout]: isBlackout,
          [styles.page]: renderAsPage,
        })}
      >
        {children}
      </div>
    </OpacityTransition>,

    modalsContainer,
  );
}
