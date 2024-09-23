import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { MouseEventHandler, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import styles from "./InfoModal.module.css";

interface InfoModalProps {
	isOpen: boolean;
	title: string;
	description: string;
	onClose: () => void;
}

const InfoModalView: React.FC<InfoModalProps> = ({
	isOpen,
	title,
	description,
	onClose,
}) => {
	const { t } = useTranslation();

	if (!isOpen) {
		return null;
	}

	const handleClose: MouseEventHandler = event => {
		event.stopPropagation();
		event.preventDefault();
		onClose();
	};

	return (
		<div className={`${styles.modal} ${isOpen ? styles.open : null}`}>
			<div className={styles.wrapper}>
				<div className={styles.title}>{title}</div>
				<div className={styles.description}>{description}</div>
				<button className={styles.modalButton} onClick={handleClose}>
					{t("ok")}
				</button>
			</div>
		</div>
	);
};

export const InfoModal: React.FC<InfoModalProps> = props => {
	return createPortal(
		<InfoModalView {...props} />,
		document.getElementById("root")!,
	);
};

export const InfoModalContext = createStrictContext<{
	openModalInfo: (title: string, description: string) => void;
	closeModalInfo: () => void;
} | null>();

export function useModalInfoContext() {
	return useStrictContext(InfoModalContext);
}

export const InfoModalProvider: React.FC = ({ children }) => {
	const [modalInfo, setModalInfo] = useState<{
		title: string;
		description: string;
		opened: boolean;
	}>({ opened: false, title: "", description: "" });

	const openModalInfo = (title: string, description: string): void => {
		setModalInfo({ title, description, opened: true });
	};

	const closeModalInfo = (): void => {
		setModalInfo({ opened: false, title: "", description: "" });
	};

	return (
		<InfoModalContext.Provider value={{ openModalInfo, closeModalInfo }}>
			{children}
			<InfoModal
				isOpen={modalInfo.opened}
				title={modalInfo.title}
				description={modalInfo.description}
				onClose={closeModalInfo}
			/>
		</InfoModalContext.Provider>
	);
};
