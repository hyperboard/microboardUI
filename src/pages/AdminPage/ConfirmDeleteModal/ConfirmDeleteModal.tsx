import React, { useState } from "react";
import styles from "./ConfirmDeleteModal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { UiButton } from "shared/ui-lib/UiButton";
import { BoardWithUsers, deleteBoard } from "shared/api/boards";

export const CONFIRM_DELETE_MODAL = Symbol("confirmDeleteModal");

interface ConfirmDeleteModalPayload {
  board: BoardWithUsers;
  onSuccess: () => void;
}

// // Простой SVG-значок для предупреждения
// const WarningIcon = () => (
//   <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
//   </svg>
// );

export function ConfirmDeleteModal(): React.JSX.Element {
  const { closeModal, data, setModalData } = useUiModalContext();
  const { board, onSuccess } = (data as ConfirmDeleteModalPayload) || {};

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!board) return <></>;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteBoard(board.uuid);

      if (onSuccess) {
        onSuccess();
      }
      setModalData(undefined);
      closeModal();
    } catch (err) {
      console.error("Ошибка при удалении доски:", err);
      setError("Не удалось удалить доску. Пожалуйста, попробуйте снова.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setModalData(undefined);
    closeModal();
  };

  return (
    <UiModal
      modalId={CONFIRM_DELETE_MODAL}
      closeOnClickOutside={false}
      renderAsPageOnMobile={true}
    >
      <div className={styles.modalContent}>
        <div className={styles.title}>Удаление доски</div>
        <p className={styles.description}>
          Вы уверены, что хотите удалить доску <br />
          <strong>"{board.title}"</strong>?
          <br />
          <br />
          Это действие необратимо.
        </p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.footer}>
          <UiButton
            variant="secondary"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Отмена
          </UiButton>
          <UiButton
            variant="primary"
            className={styles.dangerButton}
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Удаление..." : "Да, удалить"}
          </UiButton>
        </div>
      </div>
    </UiModal>
  );
}
