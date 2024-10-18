export const MIN_DRAWING_STROKE_WIDTH = 1;
export const MAX_DRAWING_STROKE_WIDTH = 12;
export const STEP_DRAWING_STROKE_WIDTH = 1;
export const INITIAL_DRAWING_STROKE_WIDTH = 6;
export const INITIAL_HIGHLIGHTER_STROKE_WIDTH = 9;
export const ERASER_STROKE_WIDTH = 12;
export const RENDER_POINTER_CIRCLE = true;
export const DRAWING_STROKE_STYLE = "solid";
export const DRAWING_POINTER_CIRCLE_COLOR = "rgb(227, 228, 230)";
export const DRAWING_SETTINGS_KEY = "drawingSettings";
export const HIGHLIGHTER_SETTINGS_KEY = "highlighterSettings";

export type DrawingTool = "Pen" | "Eraser" | "Highlighter";
export const DRAWING_TOOLS: DrawingTool[] = ["Pen", "Eraser", "Highlighter"];

export const PEN_COLORS = [
	"rgb(255, 255, 255)",
	"rgb(254, 244, 69)",
	"rgb(255, 177, 60)",
	"rgb(230, 72, 61)",
	"rgb(204, 208, 213)",
	"rgb(204, 241, 0)",
	"rgb(140, 236, 0)",
	"rgb(218, 0, 99)",
	"rgb(113, 118, 132)",
	"rgb(18, 205, 212)",
	"rgb(0, 158, 41)",
	"rgb(149, 16, 172)",
	"rgb(20, 21, 26)",
	"rgb(71, 120, 245)",
	"rgb(29, 84, 226)",
	"rgb(115, 29, 226)",
];

export const HIGHLIGHTER_COLORS = [
	"rgba(255, 255, 255, 0.5)",
	"rgba(254, 244, 69, 0.5)",
	"rgba(255, 177, 60, 0.5)",
	"rgba(230, 72, 61, 0.5)",
	"rgba(204, 208, 213, 0.5)",
	"rgba(204, 241, 0, 0.5)",
	"rgba(140, 236, 0, 0.5)",
	"rgba(218, 0, 99, 0.5)",
	"rgba(113, 118, 132, 0.5)",
	"rgba(18, 205, 212, 0.5)",
	"rgba(0, 158, 41, 0.5)",
	"rgba(149, 16, 172, 0.5)",
	"rgba(20, 21, 26, 0.5)",
	"rgba(71, 120, 245, 0.5)",
	"rgba(29, 84, 226, 0.5)",
	"rgba(115, 29, 226, 0.5)",
];

export const DEFAULT_PEN_COLOR = PEN_COLORS[12];
export const DEFAULT_HIGHLIGHTER_COLOR = HIGHLIGHTER_COLORS[10];
export const DEFAULT_ERASER_COLOR = "rgba(222, 224, 227, 0.5)";
export const MAX_ERASER_LINE_LENGTH = 6;
