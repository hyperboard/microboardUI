import React from "react";
import { ReactNode } from "react";
import clsx from "clsx";
import styles from "./Modal.module.css";
import { createPortal } from "react-dom";
import { Icon } from "View/Icon";

interface ModalProps {
	className?: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	children: ReactNode;
}

const ModalBase: React.FC<ModalProps> = ({
	className,
	isOpen,
	setIsOpen,
	children,
}: ModalProps) => {
	const onCloseModal = (): void => setIsOpen(false);

	return (
		<div
			className={clsx(styles.modal, isOpen && styles.open, className)}
			onClick={onCloseModal}
		>
			<div className={styles.wr} onClick={e => e.stopPropagation()}>
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
	return createPortal(<ModalBase {...props} />, window.root);
};
