import { ExportFrameDecorationRecord } from "Board/Tools/ExportSnapshot/types";

export const BLUR_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.2)";
export const BACKGROUND_BLUR = 3;
export const SELECTION_BOX_WIDTH = 440;
export const SELECTION_BOX_HEIGHT = 440;
export const MIN_EXPORT_WIDTH = 200;
export const MIN_EXPORT_HEIGHT = 200;

const LINE_WIDTH = 2;
const DECORATION_COLOR = "black";
const DECORATION_SIZE = 12;

export const FRAME_DECORATIONS: ExportFrameDecorationRecord = {
	"top-left": {
		path: new Path2D("M13 1H1V13"),
		lineWidth: LINE_WIDTH,
		color: DECORATION_COLOR,
		width: DECORATION_SIZE,
		height: DECORATION_SIZE,
		offsetX: -3,
		offsetY: -3,
	},
	"top-right": {
		path: new Path2D("M0 1H12V13"),
		lineWidth: LINE_WIDTH,
		color: DECORATION_COLOR,
		width: DECORATION_SIZE,
		height: DECORATION_SIZE,
		offsetX: -10,
		offsetY: -3,
	},
	"bottom-left": {
		path: new Path2D("M13 12H1V0"),
		lineWidth: LINE_WIDTH,
		color: DECORATION_COLOR,
		width: DECORATION_SIZE,
		height: DECORATION_SIZE,
		offsetX: -3,
		offsetY: -10,
	},
	"bottom-right": {
		path: new Path2D("M0 12H12V0"),
		lineWidth: LINE_WIDTH,
		color: DECORATION_COLOR,
		width: DECORATION_SIZE,
		height: DECORATION_SIZE,
		offsetX: -10,
		offsetY: -10,
	},
};
