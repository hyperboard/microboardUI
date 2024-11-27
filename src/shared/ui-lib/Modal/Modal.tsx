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
	hideModal?: (modalName: ModalName) => void;
	setIsOpen?: (isOpen: boolean) => void;
	modalName?: ModalName;
	children: ReactNode;
	size?: ModalSize;
	wrClassName?: string;
}

export const Modal = (props: ModalProps) => {
	const {
		className,
		isOpen,
		hideModal,
		setIsOpen,
		modalName,
		children,
		size = ModalSize.S,
		wrClassName,
		...otherProps
	} = props;

	const onCloseModal = (): void =>
		modalName && hideModal ? hideModal?.(modalName) : setIsOpen?.(false);

	return isOpen
		? createPortal(
				<div
					className={clsx(
						styles.modal,
						isOpen && styles.open,
						className,
					)}
					onClick={onCloseModal}
					{...otherProps}
				>
					<div
						className={clsx(
							styles.wr,
							size && styles[size],
							wrClassName,
						)}
						onClick={event => event.stopPropagation()}
					>
						<div
							className={styles.modalCross}
							onClick={onCloseModal}
						>
							<Icon
								iconName={"modalCross"}
								width="13"
								height="13"
								className={styles.modalCrossIcon}
							/>
						</div>
						{children}
					</div>
				</div>,
				window.document.body,
			)
		: null;
};
