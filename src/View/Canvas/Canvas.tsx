import { Board } from "Board";
import { DrawingContext } from "Board/Items/DrawingContext";
import * as React from "react";
import { App } from "App";
import { WithRouterProps, withRouter } from "lib/withRouter";
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

	update = (): void => {
		this.forceUpdate();
	};

	initCanvasRendering = (): void => {
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
		this.renderToContext = (): void => {
			context.setCamera(board.camera);
			context.clear();
			board.items.render(context);
			board.selection.render(context);
			board.tools.render(context);
		};
		this.renderToContext();
		this.drawingContextSubscription.observer = this.renderToContext;
		this.props.app.subscriptions.add(this.drawingContextSubscription);
		this.props.app.subscriptions.add(this.cursorSubsctiption);
	}

	componentDidUpdate(prevProps: Readonly<Props>): void {
		if (prevProps.router.params?.boardId !== this.props.router.params?.boardId) {
			this.initCanvasRendering();
		}
	}

	componentDidMount(): void {
		const stage = this.stageRef.current;
		const controller = this.props.app.controller;
		if (stage) {
			stage.addEventListener("pointerdown", controller.onPointerDown);
			stage.addEventListener("pointerup", controller.onPointerUp);
			stage.addEventListener("dblclick", controller.onClick);
			stage.addEventListener("pointerleave", controller.onPointerLeave);
			stage.addEventListener("pointerout", controller.onPointerOut);
			stage.addEventListener("pointercancel", controller.onPointerCancel);
		}

		this.initCanvasRendering();
	}

	componentWillUnmount(): void {
		const stage = this.stageRef.current;
		const controller = this.props.app.controller;
		if (stage) {
			stage.removeEventListener("pointerdown", controller.onPointerDown);
			stage.removeEventListener("pointerup", controller.onPointerUp);
			stage.removeEventListener("dblclick", controller.onClick);
			stage.removeEventListener(
				"pointerleave",
				controller.onPointerLeave,
			);
			stage.removeEventListener("pointerout", controller.onPointerOut);
			stage.removeEventListener(
				"pointercancel",
				controller.onPointerCancel,
			);
		}
		this.props.app.subscriptions.remove(this.drawingContextSubscription);
		this.props.app.subscriptions.remove(this.cursorSubsctiption);
	}

	renderToContext = (): void => {};

	drawingContextSubscription = {
		observer: () => {},
		subjects: ["camera", "items", "tools", "selection"],
	};

	cursorSubsctiption = {
		observer: this.updateCursor,
		subjects: ["pointer"],
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
					background: "rgba(200,200,200,0.2)",
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
						background: "rgba(200,200,200,0.2)",
						top: "0px",
						left: "0px",
						display: "block",
						width: `${width}px`,
						height: `${height}px`,
					}}
				/>
			</div>
		);
	}
}

export const Canvas = withRouter(CanvasBase);