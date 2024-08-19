import React, { createContext, MouseEventHandler } from "react";
import { createPortal } from "react-dom";
import styles from "./InfoModal.module.css";
import { useStrictContext } from "lib/strictContext";
import { useTranslation } from "react-i18next";

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

export const InfoModalContext = createContext<{
	openModalInfo: (title: string, description: string) => void;
} | null>(null);

export function useModalInfoContext() {
	return useStrictContext(InfoModalContext);
}
