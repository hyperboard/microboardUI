import { App } from "App";
import { Board } from "Board";
import { DrawingContext } from "Board/Items/DrawingContext";
import { WithRouterProps, withRouter } from "lib/withRouter";
import * as React from "react";
export interface Props extends WithRouterProps {
	app: App;
	board: Board;
}

export class CanvasBase extends React.Component<Props> {
	stageRef = React.createRef<HTMLDivElement>();
	canvasRef = React.createRef<HTMLCanvasElement>();
	options = {
		pointerdown: {},
		pointerup: {},
		click: {},
	};

	updateCursor = (): void => {
		const stage = this.stageRef.current;
		if (stage) {
			stage.style.cursor = this.props.board.pointer.getCursor();
		}
	};

	renderToContext = (): void => {
		const canvas = this.canvasRef.current;
		if (!canvas) {
			return;
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}
		const context = new DrawingContext(this.props.board.camera, ctx);
		const { board } = this.props;

		context.setCamera(board.camera);
		context.clear();
		board.items.render(context);
		board.selection.render(context);
		board.tools.render(context);
	};

	initCanvasRendering = (): void => {
		this.renderToContext();
		this.props.app.subscriptions.add(this.drawingContextSubscription);
		this.props.app.subscriptions.add(this.cursorSubscription);
		this.props.app.subscriptions.add(this.resizeSubscription);
	};

	componentDidUpdate(prevProps: Readonly<Props>): void {
		if (
			// @ts-expect-error boardId didn't exist in params record
			prevProps.router.params?.boardId !==
			// @ts-expect-error boardId didn't exist in params record
			this.props.router.params?.boardId
		) {
			this.initCanvasRendering();
		}
	}

	componentDidMount(): void {
		const stage = this.stageRef.current;
		const controller = this.props.app.controller;
		if (stage) {
			stage.addEventListener(
				"pointerdown",
				event => {
					controller.onPointerDown(event);
					if (event.target) {
						(event.target as HTMLElement).setPointerCapture(
							event.pointerId,
						);
					}
				},
				{ capture: true },
			);

			stage.addEventListener(
				"pointerup",
				event => {
					controller.onPointerUp(event);
					if (event.target) {
						(event.target as HTMLElement).releasePointerCapture(
							event.pointerId,
						);
					}
				},
				{ capture: true },
			);

			stage.addEventListener("pointermove", controller.onPointerMove, {
				capture: true,
			});
			stage.addEventListener("dblclick", controller.onClick);
		}

		this.initCanvasRendering();
	}

	componentWillUnmount(): void {
		const stage = this.stageRef.current;
		const controller = this.props.app.controller;
		if (stage) {
			stage.removeEventListener("pointerdown", controller.onPointerDown, {
				capture: true,
			});
			stage.removeEventListener("pointerup", controller.onPointerUp, {
				capture: true,
			});
			stage.removeEventListener("dblclick", controller.onClick);
		}
		this.props.app.subscriptions.remove(this.drawingContextSubscription);
		this.props.app.subscriptions.remove(this.cursorSubscription);
		this.props.app.subscriptions.remove(this.resizeSubscription);
	}

	drawingContextSubscription = {
		observer: () => {
			this.renderToContext();
		},
		subjects: ["camera", "items", "tools", "selection"],
	};

	cursorSubscription = {
		observer: this.updateCursor,
		subjects: ["pointer"],
	};

	resizeSubscription = {
		observer: () => {
			this.forceUpdate();
		},
		subjects: ["cameraResize"],
	};

	render(): React.ReactElement {
		const board = this.props.board;
		const { width, height } = board.camera.window;
		return (
			<div
				id="CanvasContainer"
				className="NoContextMenu"
				ref={this.stageRef}
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
					ref={this.canvasRef}
					width={Math.floor(width * window.devicePixelRatio)}
					height={Math.floor(height * window.devicePixelRatio)}
					className="NoContextMenu"
					style={{
						padding: "0px",
						margin: "0px",
						border: "0px",
						background: "rgb(246, 246, 246)",
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
			</div>
		);
	}
}

export const Canvas = withRouter(CanvasBase);
