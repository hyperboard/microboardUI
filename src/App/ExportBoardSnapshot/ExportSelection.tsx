import { PureComponent, ReactElement, createRef } from "react";
import { Matrix, Mbr } from "Board/Items";
import { Board } from "Board";
import React from "react";
import { DrawingContext } from "Board/Items/DrawingContext";
import { BACKDROP_COLOR, DEFAULT_SELECTION_SIZE } from "./const";
import { applyStyle } from "lib/applyStyle";
import { Camera } from "Board/Camera";

interface Props {
	board: Board;
	setSelection: (rect: Mbr) => void;
}

interface State {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	isDragging: boolean;
}

export class ExportSelection extends PureComponent<Props, State> {
	containerRef = createRef<HTMLDivElement>();

	constructor(props: Props) {
		super(props);

		const middleX = window.innerWidth / 2;
		const middleY = window.innerHeight / 2;

		this.state = {
			startX: middleX - DEFAULT_SELECTION_SIZE.width / 2,
			startY: middleY - DEFAULT_SELECTION_SIZE.height / 2,
			endX: middleX + DEFAULT_SELECTION_SIZE.width / 2,
			endY: middleY + DEFAULT_SELECTION_SIZE.height / 2,
			isDragging: false,
		};
	}

	componentDidMount(): void {
		const container = this.containerRef.current;

		if (container) {
			window.addEventListener("pointerdown", this.startSelection);
			window.addEventListener("pointerup", this.endSelection);
			window.addEventListener("pointermove", this.updateSelection);
		}
	}

	componentWillUnmount(): void {
		const { board } = this.props;
		const drawingContext = board.getDrawingContext();
		const container = this.containerRef.current;

		if (drawingContext) {
			this.restoreBoard(drawingContext);
		}

		if (container) {
			window.removeEventListener("pointerdown", this.startSelection);
			window.removeEventListener("pointerup", this.endSelection);
			window.removeEventListener("pointermove", this.updateSelection);
		}
	}

	inSelectionBox = (event: PointerEvent): boolean => {
		const { startX, startY, endX, endY } = this.state;
		const { clientX, clientY } = event;
		if (
			clientX >= startX &&
			clientX <= endX &&
			clientY >= startY &&
			clientY <= endY
		) {
			return true;
		}

		return false;
	};

	startSelection = (event: PointerEvent): void => {
		const { clientX, clientY } = event;

		// if (this.inSelectionBox(event)) {
		// 	this.setState({
		// 		isDragging: true,
		// 	});
		// 	return;
		// }

		this.setState({
			startX: clientX,
			startY: clientY,
			endX: clientX,
			endY: clientY,
			isDragging: true,
		});
	};

	updateSelection = (event: PointerEvent): void => {
		if (this.state.isDragging) {
			const { clientX, clientY } = event;

			// if (this.inSelectionBox(event)) {
			// 	this.setState(prevState => ({
			// 		startX: clientX,
			// 		startY: clientY,
			// 		endX: prevState.endX + clientX,
			// 		endY: prevState.endY + clientY,
			// 	}));

			// 	return;
			// }

			this.setState({
				endX: clientX,
				endY: clientY,
			});
		}
	};

	endSelection = (): void => {
		this.setState({
			isDragging: false,
		});

		const { startX, startY, endX, endY } = this.state;
		this.props.setSelection(new Mbr(startX, startY, endX, endY));
	};

	clear = (drawingContext: DrawingContext): void => {
		drawingContext.clear();
	};

	renderBackdrop = (drawingContext: DrawingContext): void => {
		const { ctx } = drawingContext;
		const { innerWidth, innerHeight } = window;

		ctx.fillStyle = BACKDROP_COLOR;
		ctx.globalAlpha = 0.5;
		ctx.fillRect(0, 0, innerWidth, innerHeight);
	};

	renderSelectionBox = (drawingContext: DrawingContext): void => {
		const { ctx } = drawingContext;
		const { startX, startY, endX, endY } = this.state;
		ctx.globalAlpha = 1;
		ctx.clearRect(startX, startY, endX - startX, endY - startY);
	};

	renderItems = (drawingContext: DrawingContext): void => {
		const { board } = this.props;

		drawingContext.setCamera(board.camera);
		drawingContext.ctx.setTransform(
			1 * drawingContext.DPI,
			0,
			0,
			1 * drawingContext.DPI,
			0,
			0,
		);
		drawingContext.matrix.applyToContext(drawingContext.ctx);
		board.items.render(drawingContext);
	};

	renderSubItems = (drawingContext: DrawingContext): void => {
		const { board } = this.props;
		const { startX, startY, endX, endY } = this.state;
		drawingContext.setCamera(board.camera);
		drawingContext.ctx.setTransform(
			1 * drawingContext.DPI,
			0,
			0,
			1 * drawingContext.DPI,
			0,
			0,
		);
		drawingContext.matrix.applyToContext(drawingContext.ctx);
		const inView = board.items.index.getRectsEnclosedOrCrossed(
			startX,
			startY,
			endX,
			endY,
		);
		for (const item of inView) {
			item.render(drawingContext);
		}
	};

	restoreBoard = (drawingContext: DrawingContext): void => {
		this.clear(drawingContext);
		this.renderItems(drawingContext);
	};

	renderSnapshotMode = (): void => {
		const { board } = this.props;
		const drawingContext = board.getDrawingContext();
		if (!drawingContext) {
			console.log("render snapshot mode: no context");
			return;
		}

		this.clear(drawingContext);
		this.renderItems(drawingContext);
		this.renderBackdrop(drawingContext);
		this.renderSelectionBox(drawingContext);
		this.renderSubItems(drawingContext);
	};

	render(): ReactElement {
		this.renderSnapshotMode();

		return <div ref={this.containerRef} className="SnapshotSelection" />;
	}
}

applyStyle(`
	.SnapshotSelection {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
	}
`);
