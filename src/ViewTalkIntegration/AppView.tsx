import { App } from "App";
import { withRouter } from "lib/withRouter";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TextEditors } from "View/TextEditor/TextEditor";
import { Canvas } from "./Canvas";
import { ContextPanel } from "./ContextPanel";
import { ExportPanel } from "./ExportPanel";
import { TitlePanel } from "./TitlePanel";
import { ToastProvider } from "./ToastProvider";
import { ToolsPanel } from "./ToolsPanel";
import { ViewModeGuard } from "./ViewModeGuard";
import { ZoomPanel } from "./ZoomPanel";

type Props = { app: App };

export const AppView = ({ app }: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [animationFrameId, setAnimationFrameId] = useState<number | null>(
		null,
	);
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const router = { location, navigate, params };

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
		const handlePaste = (event: ClipboardEvent) => {
			controller.onPaste(event, app);
		};

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
			window.addEventListener("paste", handlePaste);
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
				window.removeEventListener("paste", handlePaste);
				window.removeEventListener("drop", controller.onDrop);
			}
		};
	}, [app, animationFrameId]);

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
				<Canvas app={app} board={board} />
				<TextEditors app={app} board={board} />
				<ViewModeGuard app={app}>
					<ToolsPanel app={app} board={board} />
					<ContextPanel app={app} board={board} />
					<TitlePanel app={app} board={board} />
					<ExportPanel app={app} board={board} />
				</ViewModeGuard>
				<ZoomPanel app={app} board={board} />
				<ToastProvider />
			</div>
		</div>
	);
};

function preventDefault(event: TouchEvent): void {
	event.preventDefault();
}
