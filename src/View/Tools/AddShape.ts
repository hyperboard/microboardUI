import type { ShapeType } from "Board/Items/Shape/Basic";

export const ADD_TO_SELECTION = true;
export const DEFAULT_SHAPE: ShapeType | "None" = "Rectangle";
export const MIN_STROKE_WIDTH = 1;
export const MAX_STROKE_WIDTH = 12;
export const STEP_STROKE_WIDTH = 1;

export const SHAPE_TYPES = [
	"Rectangle",
	"RoundedRectangle",
	"Circle",
	"Triangle",
	"Rhombus",
	"SpeachBubble",
	"ArrowRight",
	"ArrowLeft",
	"Cloud",
	"Parallelogram",
	"Star",
	"BracesLeft",
	"BracesRight",
	"ArrowLeftRight",
	"Cross",
	"Cylinder",
	"Trapezoid",
	"PredefinedProcess",
	"Octagon",
	"Hexagon",
	"Pentagon",
] as const;

export const STROKE_COLORS = [
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

export const DEFAULT_STROKE_COLOR = STROKE_COLORS[12];

export const FILL_COLORS = [
	"none",
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
