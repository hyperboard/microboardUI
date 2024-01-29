import { Board } from "Board";
import { Quality, Resolution } from "./types";
import { DrawingContext } from "Board/Items/DrawingContext";
import { Camera } from "Board/Camera";
import { drawExportBackground } from "./utils";
import { Selection } from "Board/Selection";

export function exportBoardSnapshot(
	board: Board,
	quality: Quality,
	selection?: Selection,
): void {
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

	let newMbr = drawingContext.camera.getMbr();

	if (selection) {
		newMbr = selection.getMbr()!;
	}

	const newCamera = new Camera();
	const newDrawingContext = new DrawingContext(newCamera, context);

	newDrawingContext.camera.viewRectangle(newMbr);
	newDrawingContext.setCamera(newCamera);
	drawExportBackground({
		context,
		width: newCanvas.width,
		height: newCanvas.height,
	});
	newDrawingContext.applyChanges();

	board.items.render(newDrawingContext);

	const dataURL = newDrawingContext.ctx.canvas.toDataURL("image/png");

	const link = document.createElement("a");
	link.href = dataURL;
	link.download = `board-${boardId}.png`;
	link.click();
}
