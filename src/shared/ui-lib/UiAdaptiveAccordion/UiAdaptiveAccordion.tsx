import clsx from "clsx";
import React, {
	forwardRef,
	useImperativeHandle,
	useState,
	type HTMLProps,
	type ReactNode,
	type Ref,
} from "react";
import styles from "./UiAdaptiveAccordion.module.css";

type OnOpenCb = () => void;

export type AccordionState = {
	isOpen: boolean;
	toggle: () => void;
	open: (onOpen?: OnOpenCb) => void;
	close: () => void;
};
type RenderPropsFunc = (payload: AccordionState) => ReactNode;

type Props = HTMLProps<HTMLDivElement> & {
	initialOpenState?: boolean | (() => boolean);
	renderHeader: RenderPropsFunc;
	renderContent: RenderPropsFunc;
	elemRef?: Ref<HTMLDivElement>;
	className: string;
};

export const UiAdaptiveAccordion = forwardRef<AccordionState, Props>(
	(
		{
			initialOpenState = false,
			renderContent,
			renderHeader,
			elemRef,
			className,
			...props
		},
		ref,
	) => {
		const [isOpen, setIsOpen] = useState(initialOpenState);

		const toggle = (): void => setIsOpen(prev => !prev);
		const close = (): void => setIsOpen(false);
		const open = (onOpen?: OnOpenCb): void => {
			setIsOpen(true);
			setTimeout(() => {
				onOpen?.();
			}, 500);
		};

		useImperativeHandle(ref, () => ({
			close,
			isOpen,
			open,
			toggle,
		}));

		return (
			<div
				className={clsx(styles.accordion, {
					[styles.open]: isOpen,
				})}
				ref={elemRef}
				{...props}
			>
				<header>
					{renderHeader({
						isOpen,
						close,
						open,
						toggle,
					})}
				</header>
				<div className={clsx(styles.content, className)}>
					{isOpen &&
						renderContent({
							isOpen,
							close,
							open,
							toggle,
						})}
				</div>
			</div>
		);
	},
);

UiAdaptiveAccordion.displayName = "UiAdaptiveAccordion";
