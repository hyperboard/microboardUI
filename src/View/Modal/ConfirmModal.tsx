import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalData {
	title: string;
	description: string;
	opened: boolean;
	onConfirm: () => Promise<void>;
}

interface ConfirmModalProps extends ConfirmModalData {
	onClose: () => void;
}

const ConfirmModalView: React.FC<ConfirmModalProps> = ({
	opened,
	title,
	description,
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();

	useEffect(() => {
		const handleEscapeKey = (evt: KeyboardEvent): void => {
			if (evt.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keyup", handleEscapeKey);
		return () => {
			window.removeEventListener("keyup", handleEscapeKey);
		};
	});

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

	if (!opened) {
		return null;
	}

	return (
		<div className={`${styles.modal} ${opened ? styles.open : null}`}>
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

export const ConfirmModalContext = createStrictContext<{
	openModalConfirm: (
		title: string,
		description: string,
		onConfirm: () => Promise<void>,
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
	});

	const openModalConfirm = (
		title: string,
		description: string,
		onConfirm: () => Promise<void>,
	): void => {
		setModalConfirm({ title, description, opened: true, onConfirm });
	};

	const closeModalConfirm = (): void => {
		setModalConfirm(prev => ({ ...prev, opened: false }));
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
			<ConfirmModal
				opened={modalConfirm.opened}
				title={modalConfirm.title}
				description={modalConfirm.description}
				onClose={closeModalConfirm}
				onConfirm={modalConfirm.onConfirm}
			/>
		</ConfirmModalContext.Provider>
	);
};
