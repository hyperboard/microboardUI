import { Board } from "Board";
import { App } from "App";
import { DrawingContext } from "Board/Items/DrawingContext";
import * as React from "react";
import { Layer } from "./Layer";
import { isSafari } from "App/isSafari";
export interface Props {
	app: App;
	board: Board;
}

let touchtime = 0;
const delay = 300;

export class Canvas extends React.Component<Props> {
	canvasContext: DrawingContext | null = null;

	stageRef = React.createRef<HTMLDivElement>();
	options = {
		pointerdown: {},
		pointerup: {},
		click: {},
	};

	timerTopLayer: NodeJS.Timer | undefined = undefined;
	timerBottomLayer: NodeJS.Timer | undefined = undefined;

	setDrawingContext = (canvasContext: DrawingContext): void => {
		this.canvasContext = canvasContext;
	};

	onPointerDown = (event: PointerEvent): boolean => {
		const board = this.props.board;
		const { tools, camera, selection } = board;
		const transformerTool = selection.tool;
		camera.saveDownEvent(event);
		if (camera.isTwoPointers()) {
			return false;
		}
		camera.pointTo(event.pageX, event.pageY);
		const isSelect = tools.getSelect() !== undefined;
		if (isSelect) {
			switch (event.button) {
				case 0:
					return (
						transformerTool.leftButtonDown() ||
						tools.leftButtonDown()
					);
				case 1:
					return (
						transformerTool.middleButtonDown() ||
						tools.middleButtonDown()
					);
				case 2:
					return (
						transformerTool.rightButtonDown() ||
						tools.rightButtonDown()
					);
				default:
					return (
						transformerTool.leftButtonDown() ||
						tools.leftButtonDown()
					);
			}
		} else {
			switch (event.button) {
				case 0:
					return tools.leftButtonDown();
				case 1:
					return tools.middleButtonDown();
				case 2:
					return tools.rightButtonDown();
				default:
					return tools.leftButtonDown();
			}
		}
	};

	onPointerUp = (event: PointerEvent): boolean => {
		const board = this.props.board;
		const { tools, selection, camera } = board;
		camera.removeDownEvent(event);
		if (isSafari()) {
			if (touchtime === 0) {
				touchtime = new Date().getTime();
			} else {
				if (new Date().getTime() - touchtime < delay) {
					this.triggerDoubleClick(event);
					touchtime = 0;
				} else {
					touchtime = new Date().getTime();
				}
			}
		}
		const transformerTool = selection.tool;
		const isSelect = tools.getSelect() !== undefined;
		if (isSelect) {
			switch (event.button) {
				case 0:
					return (
						transformerTool.leftButtonUp() || tools.leftButtonUp()
					);
				case 1:
					return (
						transformerTool.middleButtonUp() ||
						tools.middleButtonUp()
					);
				case 2:
					return (
						transformerTool.rightButtonUp() || tools.rightButtonUp()
					);
				default:
					return (
						transformerTool.leftButtonUp() || tools.leftButtonUp()
					);
			}
		} else {
			switch (event.button) {
				case 0:
					return tools.leftButtonUp();
				case 1:
					return tools.middleButtonUp();
				case 2:
					return tools.rightButtonUp();
				default:
					return tools.leftButtonUp();
			}
		}
	};
	onPointerLeave = (event: PointerEvent): void => {
		const board = this.props.board;
		const { camera } = board;
		camera.removeDownEvent(event);
	};

	onPointerCancel = (event: PointerEvent): void => {
		const board = this.props.board;
		const { camera } = board;
		camera.removeDownEvent(event);
	};

	onPointerOut = (event: PointerEvent): void => {
		const board = this.props.board;
		const { camera } = board;
		camera.removeDownEvent(event);
	};

	triggerDoubleClick = (event: PointerEvent | MouseEvent): boolean => {
		const { tools, selection } = this.props.board;
		const transformerTool = selection.tool;
		switch (event.button) {
			case 0:
				return (
					transformerTool.leftButtonDouble() ||
					tools.leftButtonDouble()
				);
			case 1:
				return (
					transformerTool.middleButtonDouble() ||
					tools.middleButtonDouble()
				);
			case 2:
				return (
					transformerTool.rightButtonDouble() ||
					tools.rightButtonDouble()
				);
			default:
				return false;
		}
	};

	onClick = (event: MouseEvent): boolean => {
		if (event.detail === 2) {
			this.triggerDoubleClick(event);
		}
		return false;
	};

	onChangeCursor = (): void => {
		const stage = this.stageRef.current;
		if (stage) {
			stage.style.cursor = this.props.board.pointer.getCursor();
		}
	};

	onPointerMove = (event: PointerEvent): boolean => {
		const board = this.props.board;
		if (!board) {
			return false;
		}
		const { camera, tools } = board;
		camera.updateDownEvent(event);

		if (camera.isTwoPointers()) {
			const pinchCenter = camera.getPinchCenter();
			const scale = camera.getPinchScale();
			const delta = camera.getPanDelta();
			camera.translateBy(delta.x, delta.y);
			camera.zoomRelativeToPointBy(scale, pinchCenter.x, pinchCenter.y);
			camera.updatePositions();
			camera.updateDistance();
			tools.leftButtonUp();
			return false;
			/*
			if (camera.isPinch()) {
				const pinchCenter = camera.getPinchCenter();
				const scale = camera.getPinchScale();
				camera.updateDistance();
				camera.zoomRelativeToPointBy(
					scale,
					pinchCenter.x,
					pinchCenter.y,
				);
				tools.leftButtonUp();
				return false;
			} else {
				const delta = camera.getPanDelta();
				camera.updatePositions();
				camera.translateBy(delta.x, delta.y);
				tools.leftButtonUp();
				return false;
			}
			*/
		}
	};

	animationFrameId: number | null = null;

	update = (): void => {
		if (this.animationFrameId) {
			return; // Function already scheduled to run
		}

		this.animationFrameId = requestAnimationFrame(() => {
			this.forceUpdate();
			this.animationFrameId = null;
		});
	};

	subscription = {
		observer: this.update,
		subjects: ["camera", "pointer"],
	};

	componentDidMount(): void {
		const stage = this.stageRef.current;
		if (stage) {
			stage.addEventListener("pointerdown", this.onPointerDown);
			stage.addEventListener("pointerup", this.onPointerUp);
			stage.addEventListener("dblclick", this.onClick);
			stage.addEventListener("pointerleave", this.onPointerLeave);
			stage.addEventListener("pointerout", this.onPointerOut);
			stage.addEventListener("pointercancel", this.onPointerCancel);
			stage.addEventListener("pointermove", this.onPointerMove);
		}
		this.props.app.subscribe(this.subscription);
		if (this.canvasContext !== null) {
			this.props.board.setDrawingContext(this.canvasContext);
		}
	}

	componentWillUnmount(): void {
		const stage = this.stageRef.current;
		if (stage) {
			stage.removeEventListener("pointerdown", this.onPointerDown);
			stage.removeEventListener("pointerup", this.onPointerUp);
			stage.removeEventListener("dblclick", this.onClick);
			stage.removeEventListener("pointerleave", this.onPointerLeave);
			stage.removeEventListener("pointerout", this.onPointerOut);
			stage.removeEventListener("pointercancel", this.onPointerCancel);
			stage.removeEventListener("pointermove", this.onPointerMove);
		}
		this.props.app.unsubscribe(this.subscription);
	}

	renderTopLayer = (context: DrawingContext): void => {
		const { board } = this.props;
		context.setCamera(board.camera);
		context.clear();
		board.selection.render(context);
		board.tools.render(context);
	};

	topLayerSubscription = {
		observer: () => {},
		subjects: ["tools", "selection", "camera", "items"],
	};

	subscribeTopLayer = (observer: () => void): void => {
		this.topLayerSubscription.observer = observer;
		this.props.app.subscribe(this.topLayerSubscription);
	};

	unsubscribeTopLayer = (observer: () => void): void => {
		this.props.app.unsubscribe(this.topLayerSubscription);
	};

	renderBottomLayer = (context: DrawingContext): void => {
		const { board } = this.props;
		context.setCamera(board.camera);
		context.clear();
		board.items.render(context);
	};

	bottomLayerSubscription = {
		observer: () => {},
		subjects: ["camera", "items"],
	};

	subscribeBottomLayer = (observer: () => void): void => {
		this.bottomLayerSubscription.observer = observer;
		this.props.app.subscribe(this.bottomLayerSubscription);
	};

	unsubscribeBottomLayer = (observer: () => void): void => {
		this.props.app.unsubscribe(this.bottomLayerSubscription);
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
					cursor: board.pointer.getCursor(),
					position: "relative",
					width: width,
					height: height,
				}}
			>
				<Layer
					setDrawingContext={this.setDrawingContext}
					render={this.renderBottomLayer}
					subscribe={this.subscribeBottomLayer}
					unsubscribe={this.unsubscribeBottomLayer}
					board={board}
					width={width}
					height={height}
				/>
				<Layer
					setDrawingContext={this.setDrawingContext}
					render={this.renderTopLayer}
					subscribe={this.subscribeTopLayer}
					unsubscribe={this.unsubscribeTopLayer}
					board={board}
					width={width}
					height={height}
				/>
			</div>
		);
	}
}
