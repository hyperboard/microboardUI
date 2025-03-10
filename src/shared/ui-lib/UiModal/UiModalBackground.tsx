import React, { useEffect, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { OpacityTransition } from "../Transitions";
import styles from "./UiModal.module.css";
import { useUiModalContext } from "./UiModalContext";

const modalsContainer = document.getElementById("modal")!;

export function UiModalBackground({
	children,
}: PropsWithChildren<{}>): JSX.Element {
	const { openedModalId, closeModal } = useUiModalContext();

	useEffect(() => {
		const controller = new AbortController();
		window.addEventListener(
			"keydown",
			ev => {
				if (ev.key === "Escape" && openedModalId) {
					closeModal();
				}
			},
			{ signal: controller.signal },
		);

		return () => controller.abort();
	});

	return createPortal(
		<OpacityTransition
			timeout={500}
			inProp={Boolean(openedModalId)}
			unmountOnExit
		>
			<div className={styles.blackout}>{children}</div>
		</OpacityTransition>,

		modalsContainer,
	);
}
