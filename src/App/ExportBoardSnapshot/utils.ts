import { CANVAS_EXPORT_BACKGROUND } from "./const";

export function drawExportBackground({
	context,
	width,
	height,
}: {
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
}): void {
	context.rect(0, 0, width, height);
	context.fillStyle = CANVAS_EXPORT_BACKGROUND;
	context.fill();
}
