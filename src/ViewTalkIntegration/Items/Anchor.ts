type Center = {
	x: number;
	y: number;
};

export const ANCHOR_BORDER_COLOR = "rgba(34, 145, 255, 1)";
export const ANCHOR_BACKGROUND_COLOR = "none";
export const ANCHOR_STROKE_WIDTH = 1;

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
	ctx.roundRect(
		center.x - width / scale / 2,
		center.y - width / scale / 2,
		width / scale,
		width / scale,
		1 / scale,
	);
	if (backgroundColor !== "none") {
		ctx.fillStyle = backgroundColor;
		ctx.fill();
	}
	ctx.stroke();
	ctx.closePath();
}

export function renderCircleAnchor(
	ctx: CanvasRenderingContext2D,
	center: Center,
	radius: number,
	borderColor: string,
	backgroundColor: string,
	strokeWidth: number,
	scale: number,
) {
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = strokeWidth / scale;
	ctx.beginPath();
	ctx.arc(center.x, center.y, radius / scale, 0, 2 * Math.PI);

	if (backgroundColor !== "none") {
		ctx.fillStyle = backgroundColor;
		ctx.fill();
	}
	ctx.stroke();
	ctx.closePath();
}
