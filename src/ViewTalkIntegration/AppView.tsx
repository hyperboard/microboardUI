import { App } from "App";
import { withRouter } from "lib/withRouter";
import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "View/Canvas";
import { ContextMenu, ContextMenuState } from "View/ContextMenu";
import { ContextPanel } from "View/ContextPanel";
import { ExportPanel } from "View/ExportPanel";
import { SidePanel } from "View/SidePanel";
import { SidePanelState } from "View/SidePanel/SidePanelState";
import { TextEditors } from "View/TextEditor/TextEditor";
import { TitlePanel } from "View/TitlePanel";
import { ToolsPanel } from "View/ToolsPanel";
import { UserPanel } from "View/UserPanel/UserPanel";
import { ZoomPanel } from "View/ZoomPanel";

const AppViewBase = ({ app, router }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [animationFrameId, setAnimationFrameId] = useState<number | null>(
		null,
	);
	const sidePanelState = useRef(new SidePanelState()).current;
	const contextMenuState = useRef(new ContextMenuState()).current;

	const update = () => {
		if (animationFrameId) {
			return; // Function already scheduled to run
		}

		const id = requestAnimationFrame(() => {
			setAnimationFrameId(null);
		});
		setAnimationFrameId(id);
	};

	useEffect(() => {
		const subscription = app.boardSubject.subscribe(update);
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
			window.addEventListener("keyup", controller.onKeyUp);
			window.addEventListener("copy", controller.onCopy);
			window.addEventListener("paste", controller.onPaste);
			window.addEventListener("drop", controller.onDrop);
			window.addEventListener("dragover", event => {
				event.preventDefault();
			});
			const board = app.getBoard();
			if (board) {
				board.camera.onWindowResize();
			}
		}

		return () => {
			if (subscription) {
				subscription.unsubscribe();
			}
			if (container) {
				document.removeEventListener("touchmove", preventDefault);
				container.removeEventListener("wheel", controller.onWheel);
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
				window.removeEventListener("keyup", controller.onKeyUp);
				window.removeEventListener("copy", controller.onCopy);
				window.removeEventListener("paste", controller.onPaste);
				window.removeEventListener("drop", controller.onDrop);
			}
		};
	}, [app, animationFrameId]);

	const urlString = new URL(window.location.href).pathname;
	const boardId = router?.params?.boardId || urlString.split("/").pop();

	useEffect(() => {
		if (boardId) {
			app.openBoard(boardId);
		}
	}, [boardId, app]);

	const board = app.getBoard();
	if (!board) {
		return <div></div>;
	}

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				backgroundColor: "rgba(200,200,200,0.2)",
				overflow: "hidden",
			}}
		>
			<div ref={containerRef}>
				<Canvas
					app={app}
					board={board}
					contextMenuState={contextMenuState}
				/>
				<TextEditors app={app} board={board} />
				<ToolsPanel
					app={app}
					board={board}
					sidePanelState={sidePanelState}
				/>
				<ZoomPanel app={app} board={board} />
				<ContextPanel app={app} board={board} />
				<TitlePanel
					app={app}
					board={board}
					sidePanelState={sidePanelState}
				/>
				<UserPanel />
				<ExportPanel app={app} board={board} />
			</div>
			<SidePanel
				app={app}
				sidePanelState={sidePanelState}
				contextMenuState={contextMenuState}
			/>
			<ContextMenu app={app} contextMenuState={contextMenuState} />
		</div>
	);
};

export const AppView = withRouter(AppViewBase);

function preventDefault(event: TouchEvent): void {
	event.preventDefault();
}
