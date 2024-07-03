export const FRAME_BORDER_COLOR = "transparent";
export const FRAME_TITLE_COLOR = "rgb(107, 110, 120)";
export const FRAME_TYPES = [
	{ id: "Custom", label: "Custom" },
	{ id: "Frame16x9", label: "16:9" },
	{ id: "Frame4x3", label: "4:3" },
	{ id: "A4", label: "A4" },
	{ id: "Letter", label: "Letter" },
	{ id: "Frame1x1", label: "1:1" },
] as const;

export const FRAME_FILL_COLORS = [
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

export const FRAME_FILL_COLOR = FRAME_FILL_COLORS[0];
