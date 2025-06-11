import { App } from "App";
import { Subscription } from "App/getSubscriptions";
import { DrawingContext, Board } from "microboard-temp";
import React, { useCallback, useEffect, useRef } from "react";

interface Props {
	app: App;
	board: Board;
	children?: React.ReactNode;
}

export const CanvasNoRouter: React.FC<Props> = ({ app, board, children }) => {
	const stageRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const cursorsCanvasRef = useRef<HTMLCanvasElement>(null);

	const updateCursor = useCallback((): void => {
		const stage = stageRef.current;
		if (stage) {
			stage.style.cursor = board.pointer.getCursor();
		}
	}, [board]);

	const renderToContext = useCallback((): void => {
		const canvas = canvasRef.current;
		const cursorsCanvas = cursorsCanvasRef.current;
		if (!canvas || !cursorsCanvas) {
			return;
		}
		const ctx = canvas.getContext("2d");
		const cursorsCtx = cursorsCanvas.getContext("2d");
		if (!ctx || !cursorsCtx) {
			return;
		}
		const context = new DrawingContext(board.camera, ctx, cursorsCtx);

		context.setCamera(board.camera);
		context.clear();
		context.clearCursor();
		board.items.render(context);
		board.selection.render(context);
		board.tools.render(context);
		board.presence.render(context);
	}, [board]);

	const initCanvasRendering = useCallback((): void => {
		renderToContext();
		app.subscriptions.add(drawingContextSubscription);
		app.subscriptions.add(cursorSubscription);
		app.subscriptions.add(resizeSubscription);
	}, [app, renderToContext]);

	useEffect(() => {
		const stage = stageRef.current;
		const controller = app.controller;
		if (stage) {
			const handlePointerDown = (event: PointerEvent): void => {
				controller.onPointerDown(event);
				if (event.target) {
					(event.target as HTMLElement).setPointerCapture(
						event.pointerId,
					);
				}
			};

			const handlePointerUp = (event: PointerEvent): void => {
				controller.onPointerUp(event);
				if (event.target) {
					(event.target as HTMLElement).releasePointerCapture(
						event.pointerId,
					);
				}
			};

			stage.addEventListener("pointerdown", handlePointerDown, {
				capture: true,
			});
			stage.addEventListener("pointerup", handlePointerUp, {
				capture: true,
			});
			stage.addEventListener("pointermove", controller.onPointerMove, {
				capture: true,
			});
			stage.addEventListener("dblclick", controller.onClick);

			initCanvasRendering();

			return () => {
				stage.removeEventListener("pointerdown", handlePointerDown, {
					capture: true,
				});
				stage.removeEventListener("pointerup", handlePointerUp, {
					capture: true,
				});
				stage.removeEventListener("dblclick", controller.onClick);
				stage.removeEventListener(
					"pointermove",
					controller.onPointerMove,
				);
				app.subscriptions.remove(drawingContextSubscription);
				app.subscriptions.remove(cursorSubscription);
				app.subscriptions.remove(resizeSubscription);
			};
		}

		return () => {};
	}, [app, initCanvasRendering]);

	const drawingContextSubscription: Subscription = {
		observer: renderToContext,
		subjects: ["camera", "items", "tools", "selection", "presence"],
	};

	const cursorSubscription: Subscription = {
		observer: updateCursor,
		subjects: ["pointer", "presence"],
	};

	const resizeSubscription: Subscription = {
		observer: renderToContext,
		subjects: ["cameraResize"],
	};

	const { width, height } = board.camera.window;
	return (
		<div
			id="CanvasContainer"
			className="NoContextMenu"
			ref={stageRef}
			style={{
				position: "relative",
				padding: "0px",
				margin: "0px",
				border: "0px",
				background: "rgb(246, 246, 246)",
				cursor: board.pointer.getCursor(),
				top: "0px",
				left: "0px",
				display: "block",
				width: `${width}px`,
				height: `${height}px`,
			}}
		>
			<canvas
				ref={canvasRef}
				width={Math.floor(width * window.devicePixelRatio)}
				height={Math.floor(height * window.devicePixelRatio)}
				className="NoContextMenu"
				style={{
					zIndex: 1,
					pointerEvents: "none",
					padding: "0px",
					margin: "0px",
					border: "0px",
					background: "none",
					top: "0px",
					left: "0px",
					display: "block",
					width: `${width}px`,
					height: `${height}px`,
				}}
			/>

			<canvas
				width={Math.floor(width * window.devicePixelRatio)}
				height={Math.floor(height * window.devicePixelRatio)}
				className="NoContextMenu"
				id="ExportLayer"
				style={{
					zIndex: 1,
					pointerEvents: "none",
					padding: "0px",
					margin: "0px",
					border: "0px",
					background: "transparent",
					top: "0px",
					left: "0px",
					position: "absolute",
					width: `${width}px`,
					height: `${height}px`,
				}}
			/>

			<canvas
				ref={cursorsCanvasRef}
				width={Math.floor(width * window.devicePixelRatio)}
				height={Math.floor(height * window.devicePixelRatio)}
				className="NoContextMenu"
				style={{
					zIndex: 1,
					padding: "0px",
					margin: "0px",
					border: "0px",
					background: "transparent",
					top: "0px",
					left: "0px",
					position: "absolute",
					display: "block",
					width: `${width}px`,
					height: `${height}px`,
					pointerEvents: "none",
				}}
			/>
			<div
				style={{
					position: "relative",
					zIndex: 0,
					width: `${width}px`,
					height: `${height}px`,
				}}
			>
				{children}
			</div>
		</div>
	);
};
