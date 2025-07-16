import {
  createStrictContext,
  useStrictContext,
} from "shared/lib/strictContext";
import React, {
  MouseEventHandler,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import styles from "./ConfirmModal.module.css";
import { UiLoader } from "shared/ui-lib/UiLoader";
import clsx from "clsx";

interface ConfirmModalData {
  title: string | ReactNode;
  description: string | ReactNode;
  opened: boolean;
  onConfirm: () => Promise<void>;
  onCancel?: () => Promise<void>;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  containerClassname?: string;
}

interface ConfirmModalProps extends ConfirmModalData {
  onClose: () => void;
}

const ConfirmModalView: React.FC<ConfirmModalProps> = ({
  title,
  description,
  onClose,
  onConfirm,
  onCancel,
  confirmButtonLabel,
  cancelButtonLabel,
  containerClassname = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const stopPropagation: MouseEventHandler = (ev) => ev.stopPropagation();

  useEffect(() => {
    const handleEscapeKey = async (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        onCancel?.();
        onClose();
      }
    };
    window.addEventListener("keyup", handleEscapeKey);
    return () => {
      window.removeEventListener("keyup", handleEscapeKey);
    };
  });

  const handleConfirm: MouseEventHandler = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onClose();
  };

  const handleClose: MouseEventHandler = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    onCancel?.();
    onClose();
  };

  return (
    <div onClick={stopPropagation} className={clsx(styles.modal, styles.open)}>
      <div className={clsx(styles.wrapper, containerClassname)}>
        {typeof title === "string" ? (
          <div className={styles.title}>{title}</div>
        ) : (
          title
        )}
        {typeof description === "string" ? (
          <div className={styles.description}>{description}</div>
        ) : (
          description
        )}
        <div className={styles.buttons}>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            <span>
              {confirmButtonLabel ?? t("modalConfirm.deleteBoard.delete")}
            </span>
            {isLoading && <UiLoader size={20} strokeWidth={3} rotateTime={1} />}
          </button>
          <button className={styles.cancelButton} onClick={handleClose}>
            {cancelButtonLabel ?? t("modalConfirm.deleteBoard.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal: React.FC<ConfirmModalProps> = (props) => {
  return createPortal(
    <ConfirmModalView {...props} />,
    document.getElementById("modal")!,
  );
};

export const ConfirmModalContext = createStrictContext<{
  openModalConfirm: (
    title: string | ReactNode,
    description: string | ReactNode,
    onConfirm: () => Promise<void>,
    onCancel?: () => Promise<void>,
    confirmButtonLabel?: string,
    cancelButtonLabel?: string,
    containerClassname?: string,
  ) => void;
  closeModalConfirm: () => void;
  confirmModalInfo: ConfirmModalData;
} | null>();

export function useConfirmModalContext() {
  return useStrictContext(ConfirmModalContext);
}

export const ConfirmModalProvider: React.FC = ({ children }) => {
  const [modalConfirm, setModalConfirm] = useState<ConfirmModalData>({
    opened: false,
    title: "",
    description: "",
    onConfirm: () => Promise.reject(),
    onCancel: () => Promise.reject(),
    cancelButtonLabel: "",
    confirmButtonLabel: "",
    containerClassname: "",
  });

  const openModalConfirm = (
    title: string | ReactNode,
    description: string | ReactNode,
    onConfirm: () => Promise<void>,
    onCancel?: () => Promise<void>,
    confirmButtonLabel?: string,
    cancelButtonLabel?: string,
    containerClassname?: string,
  ): void => {
    setModalConfirm({
      title,
      description,
      opened: true,
      onConfirm,
      onCancel,
      confirmButtonLabel,
      cancelButtonLabel,
      containerClassname,
    });
  };

  const closeModalConfirm = (): void => {
    setModalConfirm((prev) => ({ ...prev, opened: false }));
    modalConfirm.onCancel?.();
  };

  return (
    <ConfirmModalContext.Provider
      value={{
        openModalConfirm,
        closeModalConfirm,
        confirmModalInfo: modalConfirm,
      }}
    >
      {children}
      {modalConfirm.opened && (
        <ConfirmModal onClose={closeModalConfirm} {...modalConfirm} />
      )}
    </ConfirmModalContext.Provider>
  );
};
