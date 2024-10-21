import React from "react";
import { ReactNode } from "react";
import clsx from "clsx";
import styles from "./Modal.module.css";
import { createPortal } from "react-dom";
import { Icon } from "View/Icon";
import { ModalName } from "View/Modal/ModalProvider";

export enum ModalSize {
	S = "sizeS",
	M = "sizeM",
}

interface ModalProps {
	className?: string;
	isOpen: boolean;
	hideModal: (modalName: ModalName) => void;
	modalName: ModalName;
	children: ReactNode;
	size?: ModalSize;
}

const ModalBase = (props: ModalProps) => {
	const {
		className,
		isOpen,
		hideModal,
		modalName,
		children,
		size = ModalSize.S,
		...otherProps
	} = props;

	const onCloseModal = () => hideModal(modalName);

	return (
		<div
			className={clsx(styles.modal, isOpen && styles.open, className)}
			onClick={onCloseModal}
			{...otherProps}
		>
			<div
				className={clsx(styles.wr, size && styles[size])}
				onClick={event => event.stopPropagation()}
			>
				<div className={styles.modalCross} onClick={onCloseModal}>
					<Icon
						iconName={"modalCross"}
						width="13"
						height="13"
						className={styles.modalCrossIcon}
					/>
				</div>
				{children}
			</div>
		</div>
	);
};

export const Modal = (props: any) => {
	return createPortal(<ModalBase {...props} />, window.document.body);
};
