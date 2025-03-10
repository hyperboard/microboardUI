import { useForceUpdate } from "shared/lib/useForceUpdate";
import React, { useEffect, useRef } from "react";
import { useAppContext } from "features/AppContext";
import { CanvasNoRouter } from "entities/Canvas";
import { ContextPanel } from "features/ContextPanel";
import { ExportVisible } from "features/ExportPanel/ExportVisible";
import { TextEditors } from "features/TextEditor/TextEditor";
import { ToastProvider } from "features/ToastProvider";
import { ViewModeGuard } from "features/ViewModeGuard";
import { ZoomPanel } from "features/ZoomPanel";
import { LinksProvider } from "../LinksProvider/LinksProvider";
import style from "./AppView.module.css";
import { InactiveBoardHidder } from "./InactiveBoardHidder";
import { QuickAddPanel } from "./QuickAddPanel";
import { LocalFileSaveProgress } from "features/LocalFileSavingProgress";
import { ToolsPanel } from "features/ToolsPanel";
import { ShapesPanelContextProvider } from "features/ShapesPanel";
import { useAIContext } from "entities/AIInput/AIContext";
import { HyperLink } from "features/hyperLink/HyperLink";
import { useHyperLinkContext } from "features/hyperLink/HyperLinkContext";

export function LocalAppView(): JSX.Element {
	const { app, board } = useAppContext();
	const forceUpdate = useForceUpdate();
	const animationId = useRef<number | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const { setQuotedText, tryToSendGenerationRequest } = useAIContext();
	const { setHyperLinkData, hyperLinkData } = useHyperLinkContext();
	let canPasteAgain = true;

	function update(): void {
		if (animationId.current) {
			return; // Function already scheduled to run
		}

		animationId.current = requestAnimationFrame(() => {
			forceUpdate();
			animationId.current = null;
		});
	}

	useEffect(() => {
		const handleCtrlWheel = (ev: WheelEvent): void => {
			if (ev.ctrlKey) {
				ev.preventDefault();
			}
		};

		const handlerOnKeyUp = (event: KeyboardEvent): void => {
			controller.onKeyUp(event);
			canPasteAgain = true;
		};

		const handlerOnPaste = (event: ClipboardEvent): void => {
			if (!canPasteAgain) {
				return;
			}
			controller.onPaste(event);
			canPasteAgain = false;
		};

		app.boardSubject.subscribe(update);
		const container = containerRef.current;
		const controller = app.controller;
		if (container) {
			document.addEventListener("touchmove", preventDefault, {
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
				document.removeEventListener("touchmove", preventDefault);
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
	}, [containerRef.current]);

	return (
		<div className={style.wrapper}>
			<InactiveBoardHidder>
				<div ref={containerRef}>
					<CanvasNoRouter app={app} board={board} />
					<TextEditors
						app={app}
						board={board}
						setQuotedText={setQuotedText}
						setHyperLinkData={setHyperLinkData}
						hyperLinkData={hyperLinkData}
						sendGenerationRequest={tryToSendGenerationRequest}
					/>
				</div>
			</InactiveBoardHidder>
			<ExportVisible>
				<ShapesPanelContextProvider>
					<ToolsPanel />
				</ShapesPanelContextProvider>
			</ExportVisible>
			<InactiveBoardHidder>
				<ZoomPanel />
			</InactiveBoardHidder>
			<HyperLink />
			<ViewModeGuard>
				<LinksProvider />
				<ContextPanel />
				<QuickAddPanel />
			</ViewModeGuard>
			<ToastProvider />
			<LocalFileSaveProgress />
		</div>
	);
}

function preventDefault(event: TouchEvent): void {
	event.preventDefault();
}
