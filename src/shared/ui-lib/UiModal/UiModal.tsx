import clsx from "clsx";
import React, {
	useCallback,
	useLayoutEffect,
	useRef,
	type HTMLProps,
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { useClickOutside } from "shared/lib/useClickOutside";
import { Icon, Logo } from "shared/ui-lib/Icon";
import { UiButton } from "../UiButton";
import { UiPanel } from "../UiPanel";
import styles from "./UiModal.module.css";
import { useUiModalContext, type ModalId } from "./UiModalContext";

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
		closeOnClickOutside?: boolean;
		clickOutsideRefs?: React.RefObject<HTMLElement>[];
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
	closeOnClickOutside = true,
	clickOutsideRefs,
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

	const clickOutsideRef = useClickOutside(
		handleOutsideClose,
		clickOutsideRefs,
	);

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
			panelElement.style.touchAction = "pan-y";
		}

		return () => {
			if (panelElement && contentElement) {
				panelElement.style.overflowY = "";
				(panelElement.style as any)["-webkit-overflow-scrolling"] = "";
				panelElement.style.touchAction = "";
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
					ref={closeOnClickOutside ? clickOutsideRef : undefined}
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
