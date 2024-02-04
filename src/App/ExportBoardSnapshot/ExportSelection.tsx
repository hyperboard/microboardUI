import { PureComponent, ReactElement, createRef } from "react";
import { Mbr } from "Board/Items";
import { Board } from "Board";
import React from "react";
import { DrawingContext } from "Board/Items/DrawingContext";
import { BACKDROP_COLOR, DEFAULT_SELECTION_SIZE } from "./const";
import { applyStyle } from "lib/applyStyle";

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

type PointerEventWithTarget = PointerEvent & { target: { className: string } };

const eventIsTargetEvent = (
	event: PointerEvent,
): event is PointerEventWithTarget => {
	return (
		event.hasOwnProperty("target") &&
		Boolean(event.target?.hasOwnProperty("className"))
	);
};

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
		const { startX, startY, endX, endY } = this.state;
		this.props.setSelection(new Mbr(startX, startY, endX, endY));

		if (container) {
			container.addEventListener("pointerdown", this.startSelection);
			container.addEventListener("pointerup", this.endSelection);
			container.addEventListener("pointermove", this.updateSelection);
		}
	}

	componentWillUnmount(): void {
		const container = this.containerRef.current;
		const { board } = this.props;
		const drawingContext = board.getDrawingContext();

		if (drawingContext) {
			this.restoreBoard(drawingContext);
		}

		if (container) {
			container.removeEventListener("pointerdown", this.startSelection);
			container.removeEventListener("pointerup", this.endSelection);
			container.removeEventListener("pointermove", this.updateSelection);
		}
	}

	isMinimumBox = (): boolean => {
		const { startX, startY, endX, endY } = this.state;
		return endX - startX > 0 && endY - startY > 0;
	};

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

	isArea = (event: PointerEvent): boolean => {
		if (eventIsTargetEvent(event)) {
			return event.target.className !== "SnapshotSelectionBoxContainer";
		}

		return true;
	};

	startSelection = (event: PointerEvent): void => {
		const { clientX, clientY } = event;

		// if (this.inSelectionBox(event)) {
		// 	this.setState({
		// 		isDragging: true,
		// 	});
		// 	return;
		// }
		if (!this.isArea(event)) {
			return;
		}
		this.setState({
			startX: clientX,
			startY: clientY,
			endX: clientX,
			endY: clientY,
			isDragging: true,
		});
	};

	updateSelection = (event: PointerEvent): void => {
		if (!this.isArea(event)) {
			return;
		}
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

	endSelection = (event: PointerEvent): void => {
		if (!this.isArea(event)) {
			return;
		}
		this.setState({
			isDragging: false,
		});

		const { startX, startY, endX, endY } = this.state;
		const mbr = new Mbr(startX, startY, endX, endY);

		this.props.setSelection(mbr);
	};

	restoreBoard = (drawingContext: DrawingContext): void => {
		const { board } = this.props;
		drawingContext.clear();
		board.items.render(drawingContext);
	};

	fullRender(): void {
		const { startX, startY, endX, endY } = this.state;
		const { innerWidth, innerHeight } = window;
		const { board } = this.props;
		const context = board.getDrawingContext()!;
		const { ctx, DPI, camera } = context;
		const matrix = camera.getMatrix();
		context.matrix = matrix;
		const scale = context.matrix.scaleX;
		context.isBorderInvisible = 4 * scale < 0.1;
		context.shapeVisibilityTreshold = 4 / scale;
		context.rectangleVisibilyTreshold = 2 / scale;

		ctx.setTransform(1 * DPI, 0, 0, 1 * DPI, 0, 0);
		ctx.clearRect(0, 0, innerWidth, innerHeight);

		ctx.transform(
			matrix.scaleX,
			matrix.shearY,
			matrix.shearX,
			matrix.scaleY,
			matrix.translateX,
			matrix.translateY,
		);

		board.items.render(context);

		ctx.setTransform(1 * DPI, 0, 0, 1 * DPI, 0, 0);

		ctx.fillStyle = BACKDROP_COLOR;
		ctx.globalAlpha = 0.5;

		if (this.isMinimumBox()) {
			ctx.fillRect(0, 0, innerWidth, startY);
			ctx.fillRect(0, startY, startX, endY - startY);
			ctx.fillRect(0, endY, innerWidth, innerHeight - endY);
			ctx.fillRect(endX, startY, innerWidth - endX, endY - startY);
		}

		ctx.globalAlpha = 1;
	}

	render(): ReactElement {
		this.fullRender();

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
		z-index: 1;
	}
`);
