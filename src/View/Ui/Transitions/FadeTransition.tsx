import React from "react";
import { CSSTransition } from "react-transition-group";
import styles from "./FadeTransition.module.css";
import type { TransitionProps } from "./types";

export function FadeTransition({
	children,
	inProp,
	timeout = 500,
	unmountOnExit,
}: TransitionProps) {
	return (
		<CSSTransition
			// in={inProp}
			timeout={timeout}
			classNames={{
				enter: styles.fadeEnter,
				enterActive: styles.fadeEnterActive,
				exit: styles.fadeExit,
				exitActive: styles.fadeExitActive,
			}}
			// unmountOnExit={unmountOnExit}
		>
			{children}
		</CSSTransition>
	);
}
