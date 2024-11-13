import {
	IMiroBoardItem,
	IMiroBoardItemConnector,
	IMiroBoardItemFrame,
	IMiroBoardItemImage,
	IMiroBoardItemPaint,
	IMiroBoardItemShape,
	IMiroBoardItemSticker,
	IMiroBoardItemText,
	MiroBoardItemTypes,
	MiroRelativeTo,
	MiroUnsupportedItem,
} from "../MiroBoards/MiroBoardsModels";
import { Board } from "Board";
import { useCopyBoardItems } from "./useCopyBoardItems";
import {
	INITIAL_DRAWING_STROKE_WIDTH,
	MAX_DRAWING_STROKE_WIDTH,
} from "../../../Tools/AddDrawing";
import { getGlobalModalFunctions } from "View/Modal/ModalProvider";

type SupportedMiroType =
	| IMiroBoardItemConnector
	| IMiroBoardItemFrame
	| IMiroBoardItemImage
	| IMiroBoardItemShape
	| IMiroBoardItemSticker
	| IMiroBoardItemText
	| IMiroBoardItemPaint;

interface MiroClipboardItem {
	widgetData: {
		json?: Record<string, any>;
		type:
			| "line"
			| "sticker"
			| "shape"
			| "image"
			| "text"
			| "frame"
			| (string & {});
	};
	type: number;
	id: number;
	initialId: string;
}

const SHAPE_TYPES = {
	0: "rectangle",
	1: "rectangle",
	2: "rectangle",
	3: "rectangle",
	4: "circle",
	5: "triangle",
	6: "wedge_round_rectangle_callout", // comment
	7: "round_rectangle",
	8: "rhombus",
	9: "rectangle",
	10: "parallelogram",
	11: "star",
	12: "right_arrow",
	13: "left_arrow",
	16: "pentagon",
	17: "hexagon",
	18: "octagon",
	19: "trapezoid",
	20: "flow_chart_predefined_process",
	21: "left_right_arrow",
	22: "cloud",
	23: "left_brace",
	24: "right_brace",
	25: "cross",
	26: "can", // cilinder
};

// lt from style
const LINE_TYPE = {
	0: "straight",
	1: "elbowed",
	2: "curved",
};

// brs from style
const BORDER_STYLES = {
	0: "dotted",
	1: "dashed",
	2: "solid",
};

// sbc from styles
// It is hex colors. Miro can transform shape with custom background to sticker.
const STICKER_COLORS = {
	16119544: "white", // white
	16775601: "light_yellow", // light yellow
	16109864: "yellow", // yellow
	16751944: "orange", // orange
	16764640: "light_pink", // light pink
	15373499: "pink", // pink
	13017810: "violet", // violet
	15766429: "red", // red
	10931445: "light_blue", // light blue
	7133434: "blue", // blue
	10398207: "dark_blue", // dark blue
	0: "black", // black
	14022290: "light_green", // light green
	13229910: "green", // green
	9687669: "dark_green", // dark green
	6801088: "cyan", // cyan
};

// ta from style (text)
const TEXT_ALIGNMENT = {
	l: "left",
	c: "center",
	r: "right",
};

// tav from style
const TEXT_VERTICAL_ALIGNMENT = {
	t: "top",
	m: "center",
	b: "bottom",
};

// ff from frame style
const FRAME_TYPE = {
	5: "custom",
	11: "a4",
	15: "letter",
	1: "ratio_16x9",
	0: "ratio_4x3",
	4: "ratio_1x1",
	12: "phone",
	13: "tablet",
	14: "desktop", // browser?
};

// a_start, a_end from connector styles
const CONNECTOR_STYLES = {
	0: "none", // null
	9: "filled_triangle", // rounded arrow
	1: "arrow", // thick arrow
	7: "arrow", // backgroundless arrow
	8: "arrow", // background arrow
	6: "arrow", // hollow arrow
	3: "filled_diamond", // rhombus
	2: "diamond", // hollow rhombus
	5: "filled_oval", // circle
	4: "oval", // hollow circle
	10: "erd_one", // one line
	11: "erd_many", // many
	14: "erd_one_or_many", // many with line
	12: "erd_only_one", // two lines
	15: "erd_zero_or_many", // circle many
	13: "erd_zero_or_one", // circle line
};

const parseStyle = (styleString: string): Record<string, any> => {
	return JSON.parse(styleString.replace(/'/g, '"'));
};

const getColor = (colorCode: number, opacity?: number): string => {
	if (!colorCode) {
		return "#000000";
	}
	if (colorCode.toString().includes("-1")) {
		return "#000000";
	}

	// hex with alpha
	if (opacity) {
		return (
			`#${colorCode.toString(16).padStart(6, "0")}` +
			Math.round(opacity * 255)
				.toString(16)
				.padStart(2, "0")
		);
	}

	return `#${colorCode.toString(16).padStart(6, "0")}`;
};

const createBaseItem = (item: MiroClipboardItem) => ({
	id: item.initialId,
	links: {
		self: "",
	},
	createdAt: new Date().toISOString(),
	createdBy: {
		id: "",
		type: "",
	},
	modifiedAt: new Date().toISOString(),
	modifiedBy: {
		id: "",
		type: "",
	},
});

export const transformShape = (
	shape: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
): IMiroBoardItemShape => {
	const json = shape.widgetData.json!;
	const style = parseStyle(json.style);

	const transformedShape: IMiroBoardItemShape = {
		...createBaseItem(shape),
		type: MiroBoardItemTypes.SHAPE,
		geometry: {
			width: json.size?.width || 100,
			height: json.size?.height || 100,
		},
		style: {
			borderColor: getColor(style.brc),
			borderStyle: BORDER_STYLES[style.brs] || "solid",
			borderWidth: style.brw?.toString() || "1",
			color: getColor(style.tc),
			fillColor: style.bc !== -1 ? getColor(style.bc) : undefined,
			fillOpacity: style.bro?.toString() || "1",
			fontSize: style.fs?.toString() || "14",
			fontFamily: style.ffn || "Arial",
			textAlign: TEXT_ALIGNMENT[style.ta] || "left",
			textAlignVertical: TEXT_VERTICAL_ALIGNMENT[style.tav] || "top",
		},
		position: {
			x:
				(json._position?.offsetPx?.x || 0) +
				(json._parent ? 0 : cursorPosition.x),
			y:
				(json._position?.offsetPx?.y || 0) +
				(json._parent ? 0 : cursorPosition.y),
			origin: "center",
			relativeTo: json._parent
				? MiroRelativeTo.frame
				: MiroRelativeTo.board,
		},
		data: {
			shape: SHAPE_TYPES[json.shape] || "rectangle",
			content: json.text || "",
		},
	};

	if (json._parent) {
		transformedShape.parent = {
			id: clipboardItems[json._parent.index].initialId,
			links: {
				self: "",
			},
		};
	}

	return transformedShape;
};

export const transformText = (
	text: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
): IMiroBoardItemText => {
	const json = text.widgetData.json!;
	const style = parseStyle(json.style);

	const transformedText: IMiroBoardItemText = {
		...createBaseItem(text),
		type: MiroBoardItemTypes.TEXT,
		geometry: {
			width: json.size?.width || 100,
			height: json.size?.height || 100,
		},
		data: {
			content: json.text || "",
		},
		style: {
			color: getColor(style.tc),
			fillColor: style.bc !== -1 ? getColor(style.bc) : undefined,
			fillOpacity: style.bro?.toString() || "1",
			fontSize: style.fs?.toString() || "14",
			fontFamily: style.ffn || "Arial",
			textAlign: TEXT_ALIGNMENT[style.ta] || "left",
			textAlignVertical: "top",
		},
		position: {
			x:
				(json._position?.offsetPx?.x || 0) +
				(json._parent ? 0 : cursorPosition.x),
			y:
				(json._position?.offsetPx?.y || 0) +
				(json._parent ? 0 : cursorPosition.y),
			origin: "center",
			relativeTo: json._parent
				? MiroRelativeTo.frame
				: MiroRelativeTo.board,
		},
		scale: json.scale.scale,
	};

	if (json._parent) {
		transformedText.parent = {
			id: clipboardItems[json._parent.index].initialId,
			links: {
				self: "",
			},
		};
	}

	return transformedText;
};

export const transformConnector = (
	connector: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
): IMiroBoardItemConnector => {
	const json = connector.widgetData.json!;
	const style = parseStyle(json.style);

	const transformedConnector: IMiroBoardItemConnector = {
		...createBaseItem(connector),
		type: MiroBoardItemTypes.CONNECTOR,
		style: {
			strokeColor: getColor(style.lc),
			strokeWidth: style.t?.toString() || "1",
			strokeStyle: BORDER_STYLES[style.brs] || "solid",
			startStrokeCap: CONNECTOR_STYLES[style.a_start] || "none",
			endStrokeCap: CONNECTOR_STYLES[style.a_end] || "none",
			color: getColor(style.tc),
			fillOpacity: "1",
			fontFamily: "Arial",
			fontSize: style.fs || json.line.captions[0]?.fontSize || "14",
			textAlign: "center",
			textAlignVertical: "middle",
		},
		geometry: {
			width: 0,
			height: 0,
		},
		position: {
			x: 0,
			y: 0,
			origin: "center",
			relativeTo: MiroRelativeTo.board,
		},
		captions: json.line?.captions
			? json.line.captions.map(c => ({
					content: c.text || "",
					position: "center",
					textAlignVertical: "middle",
				}))
			: [],
		shape: LINE_TYPE[style.lt] || "straight",
		startItem: json.primary
			? {
					id:
						`${
							clipboardItems[json.primary.widgetIndex!]?.initialId
						}` || "",
					position: {
						x: (json.primary?.point?.x || 0) * 100 + "%",
						y: (json.primary?.point?.y || 0) * 100 + "%",
					},
					links: { self: "" },
				}
			: undefined,
		endItem: json.secondary
			? {
					id:
						`${
							clipboardItems[json.secondary.widgetIndex!]
								?.initialId
						}` || "",
					position: {
						x: (json.secondary?.point?.x || 0) * 100 + "%",
						y: (json.secondary?.point?.y || 0) * 100 + "%",
					},
					links: { self: "" },
				}
			: undefined,
	};

	// if (json.primary) {
	// }
	// if (json.secondary){}

	return transformedConnector;
};

export const transformSticker = (
	sticker: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
): IMiroBoardItemSticker => {
	const json = sticker.widgetData.json!;
	const style = parseStyle(json.style);

	const scaleModifier = parseFloat(json.scale?.scale) || 1.0;

	const sizes = {
		width: (json.size?.width || 100) * scaleModifier,
		height: (json.size?.height || 100) * scaleModifier,
	};

	const transformedSticker: IMiroBoardItemSticker = {
		...createBaseItem(sticker),
		type: MiroBoardItemTypes.STICKER,
		geometry: { ...sizes },
		style: {
			fillColor: STICKER_COLORS[style.sbc] || "light_yellow",
			fillOpacity: "1",
			textAlign: TEXT_ALIGNMENT[style.ta] || "center",
			textAlignVertical: TEXT_VERTICAL_ALIGNMENT[style.tav] || "middle",
			fontSize: style.fs?.toString() || "14",
			fontFamily: style.ffn || "Arial",
			color:
				STICKER_COLORS[style.sbc] === "black"
					? "white"
					: getColor(style.tc),
		},
		data: {
			content: json.text || "",
			shape: "square",
		},
		position: {
			x:
				(json._position?.offsetPx?.x || 0) +
				(json._parent ? 0 : cursorPosition.x),
			y:
				(json._position?.offsetPx?.y || 0) +
				(json._parent ? 0 : cursorPosition.y),
			origin: "center",
			relativeTo: json._parent
				? MiroRelativeTo.frame
				: MiroRelativeTo.board,
		},
	};

	if (json._parent) {
		transformedSticker.parent = {
			id: clipboardItems[json._parent.index].initialId,
			links: {
				self: "",
			},
		};
	}

	return transformedSticker;
};

export const transformImage = (
	image: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
	boardId: string,
): IMiroBoardItemImage => {
	const json = image.widgetData.json!;
	const style = parseStyle(json.style);

	const transformedImage: IMiroBoardItemImage = {
		...createBaseItem(image),
		type: MiroBoardItemTypes.IMAGE,
		geometry: {
			width: json.resource?.width || 100,
			height: json.resource?.height || 100,
		},
		data: {
			imageUrl: `https://api.miro.com/v2/boards/${boardId}/resources/images/${
				json.resource?.id || 0
			}?format=preview&redirect=false`,
		},
		style: {
			borderColor: getColor(style.brc),
			borderWidth: style.brw?.toString() || "0",
			borderStyle: BORDER_STYLES[style.brs] || "solid",
			color: "#000000",
			fillOpacity: "1",
			fontFamily: "Arial",
			fontSize: "14",
			textAlign: "center",
			textAlignVertical: "middle",
		},
		position: {
			x:
				(json._position?.offsetPx?.x || 0) +
				(json._parent ? 0 : cursorPosition.x),
			y:
				(json._position?.offsetPx?.y || 0) +
				(json._parent ? 0 : cursorPosition.y),
			origin: "center",
			relativeTo: json._parent
				? MiroRelativeTo.frame
				: MiroRelativeTo.board,
		},
	};

	if (json._parent) {
		transformedImage.parent = {
			id: clipboardItems[json._parent.index].initialId,
			links: {
				self: "",
			},
		};
	}

	return transformedImage;
};

export const transformFrame = (
	frame: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
): IMiroBoardItemFrame => {
	const json = frame.widgetData.json!;
	const style = parseStyle(json.style);

	const transformedFrame: IMiroBoardItemFrame = {
		...createBaseItem(frame),
		type: MiroBoardItemTypes.FRAME,
		geometry: {
			width: json.width || 100,
			height: json.height || 100,
		},
		style: {
			fillColor: style.bc !== -1 ? getColor(style.bc) : "#ffffff",
			fillOpacity: style.fo?.toString() || "1",
			color: "#000000",
			fontFamily: "Arial",
			fontSize: "14",
			textAlign: "left",
			textAlignVertical: "top",
		},
		data: {
			title: json.text || `Frame ${(json?.prevFrameIndex || -1) + 2}`,
			format: FRAME_TYPE[style.ff] || "custom",
			showContent: true,
			type: "frame",
		},
		position: {
			x: (json._position?.offsetPx?.x || 0) + cursorPosition.x,
			y: (json._position?.offsetPx?.y || 0) + cursorPosition.y,
			origin: "center",
			relativeTo: MiroRelativeTo.board,
		},
	};

	return transformedFrame;
};

const transformDrawing = (
	paint: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
): IMiroBoardItemPaint => {
	const json = paint.widgetData.json!;
	const style = parseStyle(json.style);
	const strokeWidth =
		style.t > MAX_DRAWING_STROKE_WIDTH ? MAX_DRAWING_STROKE_WIDTH : style.t;
	const { x: offsetX = 0, y: offsetY = 0 } = json._position?.offsetPx || {};

	const transformDrawing: IMiroBoardItemPaint = {
		...createBaseItem(paint),
		type: MiroBoardItemTypes.PAINT,
		geometry: {
			width: json.size.width || 100,
			height: json.size.height || 100,
		},
		style: {
			color: getColor(style.lc, style.lo),
			strokeWidth: strokeWidth || INITIAL_DRAWING_STROKE_WIDTH,
			strokeOpacity: style.lo,
		},
		data: {
			points: json.points,
			scale: json.scale,
		},
		position: {
			x: json._parent ? offsetX : offsetX + cursorPosition.x,
			y: json._parent ? offsetY : offsetY + cursorPosition.y,
			origin: "center",
			relativeTo: json._parent
				? MiroRelativeTo.frame
				: MiroRelativeTo.board,
		},
	};

	if (json._parent) {
		transformDrawing.parent = {
			id: clipboardItems[json._parent.index].initialId,
			links: {
				self: "",
			},
		};
	}

	return transformDrawing;
};

export const transformUnsupportedItems = (
	item: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
): MiroUnsupportedItem | null => {
	const json = item.widgetData?.json;
	if (
		!json ||
		(json._parent &&
			clipboardItems[json._parent.index].widgetData.type === "usm")
	) {
		return null;
	}

	const { x: offsetX = 0, y: offsetY = 0 } = json._position?.offsetPx || {};
	const transformUnsupportedItem: MiroUnsupportedItem = {
		...createBaseItem(item),
		type: MiroBoardItemTypes.UNSUPPORTED,
		geometry: {
			width: json.size?.width || 100,
			height: json.size?.height || 100,
		},
		position: {
			x: json._parent ? offsetX : offsetX + cursorPosition.x,
			y: json._parent ? offsetY : offsetY + cursorPosition.y,
			origin: "center",
			relativeTo: json._parent
				? MiroRelativeTo.frame
				: MiroRelativeTo.board,
		},
		miroData: item,
		style: {
			color: "",
		},
	};

	if (json._parent) {
		transformUnsupportedItem.parent = {
			id: clipboardItems[json._parent.index].initialId,
			links: {
				self: "",
			},
		};
	}

	return transformUnsupportedItem;
};

export const parseItem = (
	item: MiroClipboardItem,
	cursorPosition: {
		x: number;
		y: number;
	},
	clipboardItems: MiroClipboardItem[],
	boardId: string,
): SupportedMiroType | MiroUnsupportedItem | null => {
	switch (item.widgetData?.type) {
		case "shape":
			return transformShape(item, cursorPosition, clipboardItems);
		case "text":
			return transformText(item, cursorPosition, clipboardItems);
		// case "line":
		//     return transformConnector(item, cursorPosition, clipboardItems);
		case "paint":
			return transformDrawing(item, cursorPosition, clipboardItems);
		case "sticker":
			return transformSticker(item, cursorPosition, clipboardItems);
		case "image":
			return transformImage(
				item,
				cursorPosition,
				clipboardItems,
				boardId,
			);
		case "frame":
			return transformFrame(item, cursorPosition, clipboardItems);
		default:
			if (item.widgetData?.type !== "line") {
				return transformUnsupportedItems(
					item,
					cursorPosition,
					clipboardItems,
				);
			}

			return null;
	}
};

export const pasteMiroClipboard = (board: Board, clipboardJson: any): any => {
	console.log("Clipboard json: ", clipboardJson);
	const clipboardItems: MiroClipboardItem[] =
		clipboardJson?.data?.objects || [];
	const boardId = clipboardJson?.boardId || "";
	const pointer = board.pointer.point;
	const initialPositions = {
		x: pointer.x || 0,
		y: pointer.y || 0,
	};
	// const initialPositions = {
	//     x: 0,
	//     y: 0,
	// };
	const { showModal, setModalData } = getGlobalModalFunctions();
	showModal?.("loadingNotification");
	setModalData?.(0);

	const miroItems = clipboardItems.reduce((acc, item, index) => {
		const transformedItem = parseItem(
			item,
			initialPositions,
			clipboardItems,
			boardId,
		);
		if (transformedItem) {
			acc.push(transformedItem);
		}
		setModalData?.(Math.floor(((index / clipboardItems.length) * 100) / 2));
		return acc;
	}, [] as IMiroBoardItem[]);
	const miroConnectors = clipboardItems.reduce((acc, item) => {
		if (item.widgetData?.type === "line") {
			acc.push(
				transformConnector(item, initialPositions, clipboardItems),
			);
		}
		return acc;
	}, [] as IMiroBoardItemConnector[]);
	useCopyBoardItems(board, [...miroItems, ...miroConnectors]);
};
