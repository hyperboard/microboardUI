import React, {
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { Icon } from "View/Icon";
import { OpacityTransition } from "../Transitions";
import { UiButton } from "../UiButton";
import { UiPanel } from "../UiPanel";
import styles from "./UiModal.module.css";
import { useUiModalContext, type ModalId } from "./UiModalContext";
import clsx from "clsx";
import { useClickOutside } from "lib/useClickOutside";
import { CSSTransition } from "react-transition-group";

type Props = PropsWithChildren<{
	modalId: ModalId;
	closeButton?: (closeModal: MouseEventHandler) => ReactNode;
	onClose?: () => void;
	className?: string;
}>;

export function UiModal({
	modalId,
	children,
	closeButton,
	className,
	onClose,
}: Props) {
	const { closeModal, openedModalId, transitionFrom } = useUiModalContext();
	const isCloseTransition = transitionFrom === modalId;

	const handleClose = () => {
		closeModal();
		onClose?.();
	};

	const ref = useClickOutside(handleClose);

	return (
		<CSSTransition
			in={modalId === openedModalId}
			timeout={isCloseTransition ? 450 : 300}
			classNames={{
				enter: styles.opacityEnter,
				enterActive: styles.opacityEnterActive,
				enterDone: styles.opacityEnterDone,
				exit: styles.opacityExit,
				exitActive: isCloseTransition
					? styles.opacityExitActiveTransition
					: styles.opacityExitActive,
				exitDone: styles.opacityExitDone,
			}}
			unmountOnExit
		>
			<div className={styles.modalWrapper}>
				<UiPanel padding={0} className={clsx(styles.panel, className)}>
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
					<div ref={ref} className={styles.content}>
						{children}
					</div>
				</UiPanel>
			</div>
		</CSSTransition>
	);
}
