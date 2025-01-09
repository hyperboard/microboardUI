import React from "react";
import { CSSTransition } from "react-transition-group";
import styles from "./FadeTransition.module.css";
import type { TransitionProps } from "./types";

export function FadeTransition({
	children,
	timeout = 500,
}: TransitionProps): JSX.Element {
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
