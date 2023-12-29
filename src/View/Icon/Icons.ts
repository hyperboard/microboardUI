export const Icons = {
	ZoomIn: {
		paths: ["M 12,1 V 23", "M 1,12 H 23"],
		width: 24,
		height: 24,
	},
	ZoomOut: {
		paths: ["M 1,12 H 23"],
		width: 24,
		height: 24,
	},
	ZoomToFit: {
		paths: [
			"m 15,1 h 8 v 8",
			"M 9,1 H 1 v 8",
			"m 23,15 v 8 h -8",
			"M 9,23 H 1 v -8",
		],
		width: 24,
		height: 24,
	},
	Rectangle: {
		paths: ["M 0,0 H 100 V 100 H 0 Z"],
		width: 100,
		height: 100,
	},
	Triangle: {
		paths: ["M 0,100 50,0 100,100 Z"],
		width: 100,
		height: 100,
	},
	Circle: {
		paths: [
			"M 0,50 C 0,50 0,0 50,0 c 50,0 50,50 50,50 0,0 0,50 -50,50 C 0,100 0,50 0,50 Z",
		],
		width: 100,
		height: 100,
	},
	ArrowLeft: {
		paths: ["M 100,75 H 50 v 25 L 0,50 50,0 v 25 h 50 z"],
		width: 100,
		height: 100,
	},
	ArrowLeftRight: {
		paths: ["M 0,50 25,0 V 25 H 75 V 0 l 25,50 -25,50 V 75 H 25 v 25 z"],
		width: 100,
		height: 100,
	},
	ArrowRight: {
		paths: ["M 0,25 H 50 V 0 l 50,50 -50,50 V 75 H 0 Z"],
		width: 100,
		height: 100,
	},
	BracesLeft: {
		paths: [
			"m 0,100 c 0,0 10,0 10,-10 V 55 L 20,50 10,45 V 10 C 10,10 10,3 0,3",
		],
		width: 100,
		height: 100,
	},
	BracesRight: {
		paths: [
			"m 100,0 c 0,0 -10,-10 -10,10 l 0,35 -10,5 10,5 0,35 c 0,0 -10,10 10,10",
		],
		width: 100,
		height: 100,
	},
	Cloud: {
		paths: [
			"M 0,50 C 0,35 5,35 15,35 15,35 5,25 15,15 25,5 35,15 35,15 35,15 40,0 50,0 c 10,0 15,15 15,15 0,0 10,-10 20,0 10,10 0,20 0,20 0,0 15,0 15,15 0,15 -15,15 -15,15 0,0 10,15 0,25 -10,10 -20,-5 -20,-5 0,0 -5,15 -15,15 C 40,100 35,85 35,85 35,85 25,100 15,90 5,80 15,65 15,65 15,65 0,65 0,50 Z",
		],
		width: 100,
		height: 100,
	},
	Cross: {
		paths: [
			"M 0,25 H 25 V 0 h 50 v 25 h 25 V 75 H 75 v 25 H 25 V 75 H 0 Z",
		],
		width: 100,
		height: 100,
	},
	Cylinder: {
		paths: [
			"m 0,5 c 0,0 0,-5 50,-5 50,0 50,5 50,5 v 90 c 0,0 0,5 -50,5 C 0,100 0,95 0,95 Z",
			"m 0,5 c 0,0 0,5 50,5 50,0 50,-5 50,-5",
		],
		width: 100,
		height: 100,
	},
	Hexagon: {
		paths: ["M 0,50 25,0 h 50 l 25,50 -25,50 H 25 Z"],
		width: 100,
		height: 100,
	},
	Octagon: {
		paths: [
			"M 0,25 C 25,0 25,0 25,0 h 50 l 25,25 V 75 L 75,100 H 25 L 0,75 Z",
		],
		width: 100,
		height: 100,
	},
	Parallelogram: {
		paths: ["M 0,100 10,0 h 90 L 90,100 Z"],
		width: 100,
		height: 100,
	},
	Pentagon: {
		paths: ["M 0,50 50,0 100,50 75,100 H 25 Z"],
		width: 100,
		height: 100,
	},
	PredefinedProcess: {
		paths: ["M 0,0 H 100 V 100 H 0 Z", "M 10,0 V 100", "M 90,0 V 100"],
		width: 100,
		height: 100,
	},
	Rhombus: {
		paths: ["M 0,50 50,0 100,50 50,100 Z"],
		width: 100,
		height: 100,
	},
	RoundedRectangle: {
		paths: [
			"M 0,10 C 0,10 0,0 10,0 c 10,0 80,0 80,0 0,0 10,0 10,10 0,10 0,80 0,80 0,0 0,10 -10,10 -10,0 -80,0 -80,0 C 10,100 0,100 0,90 0,80 0,10 0,10 Z",
		],
		width: 100,
		height: 100,
	},
	SpeachBubble: {
		paths: [
			"M 0,10 C 0,10 0,0 10,0 c 10,0 80,0 80,0 0,0 10,0 10,10 0,10 0,70 0,70 0,0 0,10 -10,10 -10,0 -60,0 -60,0 L 20,100 V 90 H 10 C 10,90 0,90 0,80 0,70 0,10 0,10 Z",
		],
		width: 100,
		height: 100,
	},
	Star: {
		paths: [
			"M 0,35 H 35 L 50,0 65,35 h 35 L 75,60 90,95 50,75 10,95 25,60 Z",
		],
		width: 100,
		height: 100,
	},
	Trapezoid: {
		paths: ["M 0,100 20,0 h 60 l 20,100 z"],
		width: 100,
		height: 100,
	},
	Bold: {
		paths: [
			"m 8,2 v 18 c 0,0 9,0 10,-4 C 18,10 8,11 8,11 8,11 16,10 16,5 16,2 8,2 8,2 Z",
		],
		width: 24,
		height: 24,
	},
	BoldUnderline: {
		paths: [
			"m 8,2 v 18 c 0,0 9,0 10,-4 C 18,10 8,11 8,11 8,11 16,10 16,6 16,2 8,2 8,2 Z",
			"M 3,22 H 21",
		],
		width: 24,
		height: 24,
	},
	Strikethrough: {
		paths: [
			"M 3,12 H 21",
			"M 20,7 C 20,7 12,-5 6,5 2,12 21,12 19,18 18,24 7,24 5,20",
		],
		width: 24,
		height: 24,
	},
	LineSolid: {
		paths: ["M 1,12 h 22"],
		width: 24,
		height: 24,
	},
	LineDashed: {
		paths: ["M 1,12 h 4", "m 9,12 h 4", "m 17,12 h 4"],
		width: 24,
		height: 24,
	},
	LineDotted: {
		paths: [
			"M 1,12 h 2",
			"M 5,12 h 2",
			"M 9,12 h 2",
			"M 13,12 h 2",
			"m 17,12 h 2",
			"m 21,12 h 2",
		],
		width: 24,
		height: 24,
	},
	HorisontalAlignCenter: {
		paths: ["M 1,5 H 23", "M 5,20 H 19", "M 1,15 H 23", "M 5,10 H 19"],
		width: 24,
		height: 24,
	},
	HorisontalAlignLeft: {
		paths: ["M 1,5 H 23", "M 1,20 H 15", "M 1,15 H 23", "M 1,10 H 15"],
		width: 24,
		height: 24,
	},
	HorisontalAlignRight: {
		paths: ["M 1,5 H 23", "M 9,20 H 23", "M 1,15 H 23", "M 9,10 H 23"],
		width: 24,
		height: 24,
	},
	Italics: {
		paths: ["M 10,20 15,2", "m 12,2 h 6", "m 7,20 h 6"],
		width: 24,
		height: 24,
	},
	TextColor: {
		paths: ["M 3,22 H 21", "M 3,20 12,2 21,20", "M 7,12 H 17"],
		width: 24,
		height: 24,
	},
	TextHighlight: {
		paths: [
			"M 3,22 H 21",
			"m 8,16 2,2 8,-8 -2,-2 z",
			"M 17,6 20,9 22,7 19,4 Z",
			"m 8,16 -2,4 4,-2",
		],
		width: 24,
		height: 24,
	},
	Underline: {
		paths: ["M 3,22 H 21", "M 4,2 C 4,2 5,20 12,20 19,20 20,2 20,2"],
		width: 24,
		height: 24,
	},
	VerticalAlignBottom: {
		paths: ["M 1,15 H 23", "M 1,20 H 23"],
		width: 24,
		height: 24,
	},
	VerticalAlignCenter: {
		paths: ["M 1,10 H 23", "M 1,15 H 23"],
		width: 24,
		height: 24,
	},
	VerticalAlignTop: {
		paths: ["M 1,5 H 23", "M 1,10 H 23"],
		width: 24,
		height: 24,
	},
	Pointer: {
		paths: ["M 8.5,18.5 5,2 l 14.5,8 -4,3 5.5,7 -3,2.5 -5.5,-7 z"],
		width: 24,
		height: 24,
	},
	RichText: {
		paths: ["m 12.5,12.5 h 75 v 5 H 52.5 V 87.5 H 47.5 V 17.5 H 12.5 Z"],
		width: 100,
		height: 100,
	},
	AddText: {
		paths: ["M8 6H20V6.8H14.4V18H13.6V6.8H8V6Z", "M9 12.4286H6.42857V15H5.57143V12.4286H3V11.5714H5.57143V9H6.42857V11.5714H9V12.4286Z"],
		width: 24,
		height: 24,
	},
	Connector: {
		paths: ["M 5,95 85,15", "M 68,14 94.5,5 85.5,31.5 Z"],
		width: 100,
		height: 100,
	},
	straight: {
		paths: ["M 5,95 95,5"],
		width: 100,
		height: 100,
	},
	curved: {
		paths: ["M 5,95 C 5,25 95,75 95,5"],
		width: 100,
		height: 100,
	},
	orthogonal: {
		paths: [
			"M 37 10 L 52 10 L 52 13 L 37 13 L 37 10 M 52 10 L 59 10 L 69 20 L 67 22 L 58 13 L 52 13 L 52 13 M 65 24 L 71 18 L 74 26 L 65 24 L 67 22",
		],
		width: 100,
		height: 100,
	},
	Delete: {
		paths: [
			"M 15,95 5,5 95,5 85,95 Z",
			"m 25,5 5,90",
			"M 50,5 50,95",
			"M 75,5 70,95",
			// "m 10,50 80,0",
		],
		width: 100,
		height: 100,
	},
	Image: {
		paths: [
			"M 5,60 5,5 95,5 95,65",
			"M 5,95 5,60 35,30 55,60 75,40 95,65 95,95 Z",
			"m 55,20 c 0,-15 20,-15 20,-6e-4 -0,15 -20,15 -20,6e-4 z",
		],
		width: 100,
		height: 100,
	},
	Pen: {
		paths: [
			"M 6,94 35,80 21,66 Z",
			"M 35,80 94,22 80,9 22,66",
			"M 80,35 66,22",
		],
		width: 100,
		height: 100,
	},
	Undo: {
		paths: ["M 48,95 C 166,50 14,-36 13,50", "M 28,36 10,58 4,30 Z"],
		width: 100,
		height: 100,
	},
	Redo: {
		paths: ["M 50,95 C -68,52 82,-37 84,48", "M 70,36 88,57 94,30 Z"],
		width: 100,
		height: 100,
	},
	Sticker: {
		paths: ["M17 11H11.5C10.6716 11 10 11.6716 10 12.5L10 17M17 11L17 3C17 2.01778 16.2629 1 15 1H3C1.73714 1 1 2.01778 1 3V15C1 15.9822 1.73714 17 3 17H10M17 11L17 12.7084C17 13.1796 16.7589 13.632 16.3303 13.9653L13.0983 16.4791C12.6697 16.8124 12.088 17 11.4823 17H10"],
		width: 18,
		height: 18,
	}
};
