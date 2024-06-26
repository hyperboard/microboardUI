type Center = {
	x: number;
	y: number;
};

export const ANCHOR_BORDER_COLOR = "rgb(147, 175, 246)";
export const ANCHOR_BACKGROUND_COLOR = "rgb(255, 255, 255)";
export const ANCHOR_STROKE_WIDTH = 1;
export const ANCHOR_RADIUS = 50;
export function renderAnchor(
	ctx: CanvasRenderingContext2D,
	center: Center,
	width: number,
	borderColor: string,
	backgroundColor: string,
	strokeWidth: number,
	scale: number,
) {
	const sizeFactor = 0.8; // Adjust this factor to decrease the size
	const adjustedWidth = width * sizeFactor;

	ctx.strokeStyle = borderColor;
	ctx.lineWidth = strokeWidth / scale;
	ctx.beginPath();
	ctx.roundRect(
		center.x - adjustedWidth / scale / 2,
		center.y - adjustedWidth / scale / 2,
		adjustedWidth / scale,
		adjustedWidth / scale,
		1 / scale,
	);
	if (backgroundColor !== "none") {
		ctx.fillStyle = backgroundColor;
		ctx.fill();
	}
	ctx.stroke();
	ctx.closePath();
}
