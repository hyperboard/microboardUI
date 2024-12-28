import { useEffect, useRef, useState } from "react";
import { useForceUpdate } from "../../lib/useForceUpdate";
import { App } from "App";

export function useAppControls(
	app: App,
	containerRef: React.RefObject<HTMLElement>,
): void {
	const forceUpdate = useForceUpdate();
	const animationId = useRef<number | null>(null);
	const [canPasteAgain, setCanPasteAgain] = useState(true);

	const update = (): void => {
		if (animationId.current) {
			return; // Function already scheduled to run
		}

		animationId.current = requestAnimationFrame(() => {
			forceUpdate();
			animationId.current = null;
		});
	};

	useEffect(() => {
		const handleCtrlWheel = (ev: WheelEvent): void => {
			if (ev.ctrlKey) {
				ev.preventDefault();
			}
		};

		const handlerOnKeyUp = (event: KeyboardEvent): void => {
			app.controller.onKeyUp(event);
			setCanPasteAgain(true);
		};

		const handlerOnPaste = (event: ClipboardEvent): void => {
			if (!canPasteAgain) {
				return;
			}
			app.controller.onPaste(event);
			setCanPasteAgain(false);
		};

		app.boardSubject.subscribe(update);
		const container = containerRef.current;
		const controller = app.controller;
		if (container) {
			document.addEventListener("touchmove", controller.preventDefault, {
				passive: false,
			});
			container.addEventListener("wheel", controller.onWheel, {
				capture: true,
				passive: false,
			});
			document.addEventListener("wheel", handleCtrlWheel, {
				passive: false,
			});
			window.addEventListener("resize", controller.onResize);
			container.addEventListener(
				"contextmenu",
				controller.onContextMenu,
				{
					capture: false,
					passive: false,
				},
			);
			container.addEventListener(
				"pointermove",
				controller.onPointerMove,
				{
					capture: true,
				},
			);
			window.addEventListener("keydown", controller.onKeyDown);
			window.addEventListener("keyup", handlerOnKeyUp);
			window.addEventListener("copy", controller.onCopy);
			window.addEventListener("paste", handlerOnPaste);
			window.addEventListener("drop", controller.onDrop);
			window.addEventListener("dragover", event =>
				event.preventDefault(),
			);
		}

		return () => {
			app.boardSubject.unsubscribe(update);

			if (container) {
				document.removeEventListener(
					"touchmove",
					controller.preventDefault,
				);
				container.removeEventListener("wheel", controller.onWheel);
				document.removeEventListener("wheel", handleCtrlWheel);
				window.removeEventListener("resize", controller.onResize);
				container.removeEventListener(
					"contextmenu",
					controller.onContextMenu,
				);
				container.removeEventListener(
					"pointermove",
					controller.onPointerMove,
				);
				window.removeEventListener("keydown", controller.onKeyDown);
				window.removeEventListener("keyup", handlerOnKeyUp);
				window.removeEventListener("copy", controller.onCopy);
				window.removeEventListener("paste", handlerOnPaste);
				window.removeEventListener("drop", controller.onDrop);
			}
		};
	}, [app, containerRef, canPasteAgain]);
}
