import React, { createContext, MouseEventHandler, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmModal.module.css";
import { useStrictContext } from "lib/strictContext";
import { useTranslation } from "react-i18next";

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	description: string;
	onClose: () => void;
	onConfirm: () => Promise<void>;
}

const ConfirmModalView: React.FC<ConfirmModalProps> = ({
	isOpen,
	title,
	description,
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();

	if (!isOpen) {
		return null;
	}

	const handleConfirm: MouseEventHandler = (ev): void => {
		ev.preventDefault();
		ev.stopPropagation();
		onConfirm();
		onClose();
	};

	const handleClose: MouseEventHandler = (ev): void => {
		ev.preventDefault();
		ev.stopPropagation();
		onClose();
	};

	return (
		<div className={`${styles.modal} ${isOpen ? styles.open : null}`}>
			<div className={styles.wrapper}>
				<div className={styles.title}>{title}</div>
				<div className={styles.description}>{description}</div>
				<div className={styles.buttons}>
					<button
						className={styles.confirmButton}
						onClick={handleConfirm}
					>
						{t("modalConfirm.deleteBoard.delete")}
					</button>
					<button
						className={styles.cancelButton}
						onClick={handleClose}
					>
						{t("modalConfirm.deleteBoard.cancel")}
					</button>
				</div>
			</div>
		</div>
	);
};

export const ConfirmModal: React.FC<ConfirmModalProps> = props => {
	return createPortal(
		<ConfirmModalView {...props} />,
		document.getElementById("root")!,
	);
};

export const ConfirmModalContext = createContext<{
	openModalConfirm: (
		title: string,
		description: string,
		onConfirm: () => Promise<void>,
	) => void;
} | null>(null);

export function useConfirmModalContext() {
	return useStrictContext(ConfirmModalContext);
}
