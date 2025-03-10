import React, {
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { Icon, Logo } from "shared/ui-lib/Icon";
import { UiButton } from "../UiButton";
import { UiPanel } from "../UiPanel";
import styles from "./UiModal.module.css";
import { useUiModalContext, type ModalId } from "./UiModalContext";
import clsx from "clsx";
import { useClickOutside } from "shared/lib/useClickOutside";

type Props = PropsWithChildren<{
	modalId: ModalId;
	closeButton?: (closeModal: MouseEventHandler) => ReactNode;
	onClose?: () => void;
	className?: string;
	closeByBgClick?: boolean;
	wrClassName?: string;
	[key: string]: unknown;
}>;

export function UiModal({
	modalId,
	children,
	closeButton,
	className,
	onClose,
	closeByBgClick = true,
	wrClassName,
	...otherProps
}: Props): JSX.Element | null {
	const { closeModal, openedModalId } = useUiModalContext();

	const handleClose = (): void => {
		closeModal();
		onClose?.();
	};

	const handleOutsideClose = (): void => {
		if (closeByBgClick) {
			handleClose();
		}
	};

	const ref = useClickOutside(handleOutsideClose);

	if (modalId !== openedModalId) {
		return null;
	}

	return (
		// <CSSTransition
		// 	in={modalId === openedModalId}
		// 	timeout={isCloseTransition ? 450 : 300}
		// 	classNames={{
		// 		enter: styles.opacityEnter,
		// 		enterActive: styles.opacityEnterActive,
		// 		enterDone: styles.opacityEnterDone,
		// 		exit: styles.opacityExit,
		// 		exitActive: isCloseTransition
		// 			? styles.opacityExitActiveTransition
		// 			: styles.opacityExitActive,
		// 		exitDone: styles.opacityExitDone,
		// 	}}
		// 	unmountOnExit
		// >
		<div className={clsx(styles.modalWrapper, wrClassName)} {...otherProps}>
			<UiPanel className={clsx(styles.panel, className)}>
				<div className={styles.closeBtnWrapper}>
					{closeButton ? (
						closeButton(handleClose)
					) : (
						<UiButton
							variant="secondary"
							className={styles.closeBtn}
							onClick={handleClose}
						>
							<Icon width={28} height={28} iconName="Close" />
						</UiButton>
					)}
				</div>
				<header className={styles.header}>
					<Logo />
					<span>Microboard</span>
				</header>
				<div ref={ref} className={styles.content}>
					{children}
				</div>
			</UiPanel>
		</div>
		// </CSSTransition>
	);
}
