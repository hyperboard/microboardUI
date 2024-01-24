import { Board } from "Board";
import { Quality, Resolution } from "./types";
import { DrawingContext } from "Board/Items/DrawingContext";
import { Camera } from "Board/Camera";

export function exportBoardSnapshot(board: Board, quality: Quality): void {
	const boardId = board.getBoardId();
	const drawingContext = board.getDrawingContext();
	const resolution = Resolution[quality];
	if (!drawingContext) {
		console.log("no drawingContext in board");
		return;
	}

	const canvas = drawingContext.ctx.canvas;

	if (!canvas) {
		console.log("no board canvas");
		return;
	}

	const newCanvas = document.createElement("canvas");
	newCanvas.width = canvas.width * resolution;
	newCanvas.height = canvas.height * resolution;

	const context = newCanvas.getContext("2d");
	if (!context) {
		console.error("Unable to get 2D context");
		return;
	}

	context.scale(resolution, resolution);

	const newDrawingContext = new DrawingContext(
		new Camera(board.pointer),
		context,
	);

	board.items.render(newDrawingContext);

	const dataURL = newDrawingContext.ctx.canvas.toDataURL("image/png");

	const link = document.createElement("a");
	link.href = dataURL;
	link.download = `board-${boardId}.png`;
	link.click();
}
