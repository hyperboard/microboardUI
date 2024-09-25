import React from "react";
import { ReactNode } from "react";
import clsx from "clsx";
import styles from "./Modal.module.css";
import { createPortal } from "react-dom";
import { Icon } from "View/Icon";

export enum ModalSize {
	S = "sizeS",
	M = "sizeM",
}

interface ModalProps {
	className?: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	children: ReactNode;
	size?: ModalSize;
	wrClassName?: string;
}

const ModalBase = (props: ModalProps) => {
	const {
		className,
		isOpen,
		setIsOpen,
		children,
		size = ModalSize.S,
		wrClassName,
		...otherProps
	} = props;
	const onCloseModal = (): void => setIsOpen(false);

	return (
		<div
			className={clsx(styles.modal, isOpen && styles.open, className)}
			onClick={onCloseModal}
			{...otherProps}
		>
			<div
				className={clsx(styles.wr, size && styles[size], wrClassName)}
				onClick={e => e.stopPropagation()}
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
