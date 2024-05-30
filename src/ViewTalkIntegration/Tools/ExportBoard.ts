import { ExportFrameDecorationRecord } from "Board/Tools/ExportSnapshot/types";

export const BLUR_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.2)";
export const BACKGROUND_BLUR = 3;
export const SELECTION_BOX_WIDTH = 440;
export const SELECTION_BOX_HEIGHT = 440;
export const MIN_EXPORT_WIDTH = 200;
export const MIN_EXPORT_HEIGHT = 200;
const LINE_WIDTH = 6;
const DECORATION_COLOR = "#2291FF";
const DECORATION_SIZE = 62;

export const FRAME_DECORATIONS: ExportFrameDecorationRecord = {
	"top-left": {
		path: new Path2D("M70 2H22C10.9543 2 2 10.9543 2 22V70"),
		lineWidth: LINE_WIDTH,
		color: DECORATION_COLOR,
		width: DECORATION_SIZE,
		height: DECORATION_SIZE,
		offsetX: 0,
		offsetY: 0,
	},
	"top-right": {
		path: new Path2D("M70 70V22C70 10.9543 61.0457 2 50 2L2 2"),
		lineWidth: LINE_WIDTH,
		color: DECORATION_COLOR,
		width: DECORATION_SIZE,
		height: DECORATION_SIZE,
		offsetX: -4,
		offsetY: 0,
	},
	"bottom-left": {
		path: new Path2D("M2 2L2 50C2 61.0457 10.9543 70 22 70H70"),
		lineWidth: LINE_WIDTH,
		color: DECORATION_COLOR,
		width: DECORATION_SIZE,
		height: DECORATION_SIZE,
		offsetX: 0,
		offsetY: -4,
	},
	"bottom-right": {
		path: new Path2D("M2 70L50 70C61.0457 70 70 61.0457 70 50L70 2"),
		lineWidth: LINE_WIDTH,
		color: DECORATION_COLOR,
		width: DECORATION_SIZE,
		height: DECORATION_SIZE,
		offsetX: -4,
		offsetY: -4,
	},
};
