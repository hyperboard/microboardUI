import { Board } from "Board";

export function exportBoardSnapshot(board: Board): void {
	const downloadLink = document.createElement("a");
	downloadLink.setAttribute("download", "CanvasAsImage.png");
	const drawingContext = board.getDrawingContext();
	const dataURL = drawingContext?.canvas.toDataURL("image/png");
	if (dataURL) {
		const url = dataURL.replace(
			/^data:image\/png/,
			"data:application/octet-stream",
		);
		downloadLink.setAttribute("href", url);
		downloadLink.click();
	}
}
