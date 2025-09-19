import React, { useState, useEffect } from "react";
import styles from "./ManageAccessModal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { UiButton } from "shared/ui-lib/UiButton";
import {
  BoardWithUsers,
  DirectAccessType,
  ManageAccessPayload,
  UserAccessType,
} from "shared/api/boards";
import { manageAccess } from "shared/api/boards";

export const MANAGE_ACCESS_MODAL = Symbol("manageAccessModal");

interface ManageAccessModalPayload {
  board: BoardWithUsers;
  onSuccess: () => void;
}

export function ManageAccessModal(): React.JSX.Element {
  const { closeModal, data, setModalData } = useUiModalContext();
  const { board, onSuccess } = (data as ManageAccessModalPayload) || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPublic, setIsPublic] = useState(board?.isPublic || false);
  const [directAccessType, setDirectAccessType] = useState<DirectAccessType>(
    DirectAccessType.VIEW,
  );
  console.log(board, data);

  useEffect(() => {
    if (board) {
      setIsPublic(board.isPublic);
      setDirectAccessType(DirectAccessType.VIEW);
    }
    console.log(board);
  }, [board]);

  if (!board) return <></>;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersPayload = board.users.map((user) => ({
        userId: user.id,
        email: user.email,
        accessType: user.permissions.includes(UserAccessType.Edit)
          ? UserAccessType.Edit
          : UserAccessType.View,
      }));

      const payload: ManageAccessPayload = {
        isPublic: isPublic,
        directAccessType: directAccessType,
        users: usersPayload,
      };

      await manageAccess(board.uuid, payload);

      if (onSuccess) {
        onSuccess();
      }
      setModalData(undefined);
      closeModal();
    } catch (err) {
      console.error("Failed to manage access:", err);
      setError("Не удалось обновить статус. Пожалуйста, попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const showAccessTypeSelector = !board.isPublic && isPublic;
  const showPrivacyWarning = board.isPublic && !isPublic;

  return (
    <UiModal
      modalId={MANAGE_ACCESS_MODAL}
      closeOnClickOutside={false}
      renderAsPageOnMobile={true}
    >
      <div className={styles.modalContent}>
        <div className={styles.title}>
          {`Управление доступом: "${board.title}"`}
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.form}>
          <div className={styles.formRow}>
            <label className={styles.label}>Статус доски</label>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.switchLabel}>
              {isPublic ? "Публичная" : "Приватная"}
            </span>
          </div>

          {showAccessTypeSelector && (
            <div className={styles.formRow}>
              <label htmlFor="accessType" className={styles.label}>
                Уровень доступа для всех
                <span className={styles.tooltip}>
                  ?
                  <span className={styles.tooltipText}>
                    Какой доступ получат все пользователи, у которых нет явных
                    разрешений?
                  </span>
                </span>
              </label>
              <select
                id="accessType"
                className={styles.select}
                value={directAccessType}
                onChange={(e) =>
                  setDirectAccessType(e.target.value as DirectAccessType)
                }
              >
                <option value={DirectAccessType.VIEW}>Только просмотр</option>
                <option value={DirectAccessType.EDIT}>
                  Просмотр и редактирование
                </option>
              </select>
            </div>
          )}

          {showPrivacyWarning && (
            <div className={styles.infoAlert}>
              Пользователи с прямым доступом сохранят свои права после того, как
              доска станет приватной.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <UiButton
            variant="secondary"
            onClick={() => {
              setModalData(undefined);
              closeModal();
            }}
          >
            Отмена
          </UiButton>
          <UiButton variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </UiButton>
        </div>
      </div>
    </UiModal>
  );
}
