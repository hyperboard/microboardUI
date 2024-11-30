import React, { useState, type HTMLProps, type ReactNode } from "react";
import styles from "./UiAdaptiveAccordion.module.css";
import clsx from "clsx";

type RenderPropsFunc = (payload: {
	isOpen: boolean;
	toggle: () => void;
	open: () => void;
	close: () => void;
}) => ReactNode;

type Props = HTMLProps<HTMLDivElement> & {
	initialOpenState?: boolean;
	renderHeader: RenderPropsFunc;
	renderContent: RenderPropsFunc;
};

export function UiAdaptiveAccordion({
	initialOpenState = false,
	renderContent,
	renderHeader,
	...props
}: Props) {
	const [isOpen, setIsOpen] = useState(initialOpenState);

	const toggle = () => setIsOpen(prev => !prev);
	const close = () => setIsOpen(false);
	const open = () => setIsOpen(true);
	return (
		<div
			className={clsx(styles.accordion, {
				[styles.open]: isOpen,
			})}
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
			<div className={styles.content}>
				{renderContent({
					isOpen,
					close,
					open,
					toggle,
				})}
			</div>
		</div>
	);
}
