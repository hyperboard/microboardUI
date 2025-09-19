import React, { useState, useEffect } from "react";
import styles from "./ManageUsersModal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { UiButton } from "shared/ui-lib/UiButton";
import { BoardWithUsers, BoardUser, UserAccessType } from "shared/api/boards";
import { grantAccess } from "shared/api/boards";

export const MANAGE_USERS_MODAL = Symbol("manageUsersModal");

// Расширяем тип пользователя, добавляя редактируемое поле доступа
interface EditableUser extends BoardUser {
  accessType: UserAccessType;
}

interface ManageUsersModalPayload {
  board: BoardWithUsers;
  onSuccess: () => void;
}

// Вспомогательная функция для определения текущего уровня доступа пользователя
const getAccessType = (permissions: UserAccessType[]): UserAccessType => {
  if (permissions.includes(UserAccessType.Edit)) return UserAccessType.Edit;
  if (permissions.includes(UserAccessType.View)) return UserAccessType.View;
  return UserAccessType.NoAccess;
};

export function ManageUsersModal(): React.JSX.Element {
  const { closeModal, data, setModalData } = useUiModalContext();
  const { board, onSuccess } = (data as ManageUsersModalPayload) || {};

  const [editableUsers, setEditableUsers] = useState<EditableUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (board) {
      // При открытии модального окна преобразуем пользователей в редактируемый формат
      setEditableUsers(
        board.users.map((user) => ({
          ...user,
          accessType: getAccessType(user.permissions),
        })),
      );
    }
  }, [board]);

  if (!board) return <></>;

  // Обработчик изменения прав доступа для одного пользователя
  const handleAccessChange = (
    userId: number,
    newAccessType: UserAccessType,
  ) => {
    setEditableUsers((currentUsers) =>
      currentUsers.map((u) =>
        u.id === userId ? { ...u, accessType: newAccessType } : u,
      ),
    );
  };

  // Обработчик сохранения всех изменений
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Формируем payload для API
      const payload = editableUsers.map((u) => ({
        userId: u.id,
        accessType: u.accessType,
        email: u.email || "", // email может быть нужен для идентификации
      }));

      await grantAccess(board.uuid, payload);

      if (onSuccess) {
        onSuccess();
      }
      setModalData(undefined); // Очищаем данные перед закрытием
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Ошибка при сохранении прав. Попробуйте снова.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setModalData(undefined);
    closeModal();
  };

  return (
    <UiModal
      modalId={MANAGE_USERS_MODAL}
      closeOnClickOutside={false}
      renderAsPageOnMobile={true}
    >
      <div className={styles.modalContent}>
        <div className={styles.title}>
          {`Пользователи доски "${board.title}"`}
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.userList}>
          {editableUsers.map((user) => (
            <div key={user.id} className={styles.userRow}>
              <span className={styles.userEmail}>{user.email}</span>
              <select
                className={styles.select}
                value={user.accessType}
                onChange={(e) =>
                  handleAccessChange(user.id, e.target.value as UserAccessType)
                }
              >
                <option value={UserAccessType.Edit}>Редактор</option>
                <option value={UserAccessType.View}>Читатель</option>
                <option value={UserAccessType.NoAccess}>Нет доступа</option>
              </select>
            </div>
          ))}
          {editableUsers.length === 0 && (
            <div className={styles.noUsers}>
              У этой доски нет пользователей с доступом.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <UiButton variant="secondary" onClick={handleClose}>
            Отмена
          </UiButton>
          <UiButton
            variant="primary"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </UiButton>
        </div>
      </div>
    </UiModal>
  );
}
