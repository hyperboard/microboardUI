type Center = {
	x: number;
	y: number;
};

export const ANCHOR_BORDER_COLOR = "black";
export const ANCHOR_BACKGROUND_COLOR = "none";
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
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = strokeWidth / scale;
	ctx.beginPath();
	ctx.arc(center.x, center.y, width / scale / 2, 0, Math.PI * 2, false);
	if (backgroundColor !== "none") {
		ctx.fillStyle = backgroundColor;
		ctx.fill();
	}
	ctx.stroke();
	ctx.closePath();
}
