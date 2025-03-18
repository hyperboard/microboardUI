import React, {
	useLayoutEffect,
	type HTMLProps,
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
	useRef,
	useCallback,
} from "react";
import { Icon, Logo } from "shared/ui-lib/Icon";
import { UiButton } from "../UiButton";
import { UiPanel } from "../UiPanel";
import styles from "./UiModal.module.css";
import { useUiModalContext, type ModalId } from "./UiModalContext";
import clsx from "clsx";
import { useClickOutside } from "shared/lib/useClickOutside";

type Props = PropsWithChildren<
	HTMLProps<HTMLDivElement> & {
		modalId: ModalId;
		closeButton?: (closeModal: MouseEventHandler) => ReactNode;
		onClose?: () => void;
		className?: string;
		closeByBgClick?: boolean;
		renderAsPageOnMobile?: boolean;
		wrClassName?: string;
		disableClose?: boolean;
		[key: string]: unknown;
	}
>;

export function UiModal({
	modalId,
	children,
	closeButton,
	className,
	onClose,
	closeByBgClick = true,
	renderAsPageOnMobile = true,
	wrClassName,
	disableClose = false,
	...otherProps
}: Props): JSX.Element | null {
	const {
		closeModal,
		openedModalId,
		addRenderAsPage,
		removeRenderAsPage,
		isRenderedAsPage,
	} = useUiModalContext();

	const panelRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const handleClose = useCallback((): void => {
		closeModal();
		onClose?.();
	}, [closeModal, onClose]);

	const handleOutsideClose = useCallback((): void => {
		if (closeByBgClick) {
			handleClose();
		}
	}, [closeByBgClick, handleClose]);

	const clickOutsideRef = useClickOutside(handleOutsideClose);

	useLayoutEffect(() => {
		if (renderAsPageOnMobile) {
			addRenderAsPage(modalId);
		}

		return () => removeRenderAsPage(modalId);
	}, [addRenderAsPage, modalId, removeRenderAsPage, renderAsPageOnMobile]);

	useLayoutEffect(() => {
		const panelElement = panelRef.current;
		const contentElement = contentRef.current;

		if (panelElement && contentElement && isRenderedAsPage(modalId)) {
			panelElement.style.overflowY = "auto";
			(panelElement.style as any)["-webkit-overflow-scrolling"] = "touch";
		}

		return () => {
			if (panelElement && contentElement) {
				panelElement.style.overflowY = "";
				(panelElement.style as any)["-webkit-overflow-scrolling"] = "";
			}
		};
	}, [openedModalId, modalId, isRenderedAsPage]);

	if (modalId !== openedModalId) {
		return null;
	}

	const renderAsPage = isRenderedAsPage(modalId);

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
		<div
			className={clsx(
				styles.modalWrapper,
				wrClassName,
				renderAsPage && styles.page,
			)}
			{...otherProps}
		>
			<UiPanel
				ref={panelRef}
				className={clsx(
					styles.panel,
					className,
					renderAsPage && styles.page,
				)}
			>
				{!disableClose && (
					<div
						className={clsx(
							styles.closeBtnWrapper,
							renderAsPage && styles.page,
						)}
					>
						{closeButton ? (
							closeButton(handleClose)
						) : (
							<UiButton
								variant="secondary"
								className={clsx(
									styles.closeBtn,
									renderAsPage && styles.page,
								)}
								onClick={handleClose}
							>
								<Icon width={28} height={28} iconName="Close" />
							</UiButton>
						)}
					</div>
				)}
				<header
					className={clsx(styles.header, renderAsPage && styles.page)}
				>
					<Logo />
					<span>Microboard</span>
				</header>
				<div
					ref={clickOutsideRef}
					className={clsx(
						styles.content,
						renderAsPage && styles.page,
					)}
				>
					{children}
				</div>
			</UiPanel>
		</div>
		// </CSSTransition>
	);
}
