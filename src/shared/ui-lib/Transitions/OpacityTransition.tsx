import React from "react";
import { CSSTransition } from "react-transition-group";
import styles from "./OpacityTransition.module.css";
import type { TransitionProps } from "./types";

export function OpacityTransition({
	inProp,
	children,
	timeout = 300,
	unmountOnExit,
}: TransitionProps) {
	return (
		<CSSTransition
			in={inProp}
			timeout={timeout}
			classNames={{
				enter: styles.opacityEnter,
				enterActive: styles.opacityEnterActive,
				exit: styles.opacityExit,
				exitActive: styles.opacityExitActive,
			}}
			unmountOnExit={unmountOnExit}
		>
			{children}
		</CSSTransition>
	);
}
