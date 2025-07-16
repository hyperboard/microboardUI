import { useBoardsList } from "App/useBoardsList";
import { useContextMenuContext } from "features/ContextMenu";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import styles from "./ShareSnapshotModal.module.css";
import SnapshotNameInput from "./SnapshotNameInput";

export const SHARE_SNAPSHOT_MODAL_ID = Symbol("shareSnapshotModal");

export function ShareSnapshotModal() {
  const { boardId } = useContextMenuContext();
  const boardsList = useBoardsList();
  const { t } = useTranslation();

  const boardInfo = boardsList.getBoardInfo(boardId);

  return (
    <>
      <UiModal
        className={styles.modalContainer}
        modalId={SHARE_SNAPSHOT_MODAL_ID}
      >
        <div className={styles.wrapper}>
          <h1 className={styles.heading}>
            {t("export.HTMLSnapshot.HTMLSnapshotLink")}{" "}
            {boardInfo?.title ? `- ${boardInfo?.title}` : ""}
          </h1>
          <div className={styles.settings}>
            <div className={styles.description}>
              You can edit the link by adding the board name.
            </div>
            <SnapshotNameInput />
            {/* <SnapshotNameInput buttonDisabled={disabled} /> */}
          </div>
        </div>
        {/* {isSubmitting && <div className={styles.loader} />} */}
      </UiModal>
    </>
  );
}
