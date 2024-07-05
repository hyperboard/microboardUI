import { ReactNode } from "react";
import styles from "../ImportMiroBoards.module.css";
import React from "react";
import { createPortal } from "react-dom";

interface IImportMiroModalViewProps {
	isOpen: boolean | null;
	setIsOpen: (isOpen: boolean) => void;
	children: ReactNode;
}

// TODO refactor with design layout
export function ImportMiroModalView({
	isOpen,
	setIsOpen,
	children,
}: IImportMiroModalViewProps): React.ReactElement {
	const onCloseModal = (): void => setIsOpen(false);

	return (
		<div
			className={`${styles.modal} ${isOpen ? styles.open : null}`}
			onClick={onCloseModal}
		>
			<div className={styles.wr} onClick={e => e.stopPropagation()}>
				{children}
			</div>
		</div>
	);
}

export const ImportMiroModal = (props: any) => {
	return createPortal(<ImportMiroModalView {...props} />, window.root);
};
