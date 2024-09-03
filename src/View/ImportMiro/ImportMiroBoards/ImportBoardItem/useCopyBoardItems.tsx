import { Board } from "Board";
import {
	IMiroBoardItem,
	IMiroBoardItemConnector,
	IMiroBoardItemFrame,
	IMiroBoardItemImage,
	IMiroBoardItemShape,
	IMiroBoardItemSticker,
	IMiroBoardItemStyle,
	IMiroBoardItemText,
	IMiroGeometry,
	IMiroParent,
	IMiroPosition,
	MiroBoardItemTypes,
	MiroItemsTypes,
	MiroRelativeTo,
} from "../MiroBoards/MiroBoardsModels";
import {
	Connector,
	Frame,
	Item,
	Mbr,
	Point,
	RichText,
	Shape,
} from "Board/Items";
import { Sticker } from "Board/Items/Sticker";
import { ImageItem } from "Board/Items/Image";
import Cookies from "js-cookie";
import { ConnectionLineWidths } from "Board/Items/Connector/Connector";
import { CONNECTOR_LINE_WIDTH } from "View/Items/Connector";
import { prepareImage } from "Board/Items/Image/ImageHelpers";
import { FixedPoint } from "Board/Items/Connector";
import { Descendant } from "slate";
import { TextNode } from "Board/Items/RichText/Editor/TextNode";
import type { HorisontalAlignment } from "Board/Items/Alignment";
import { STICKER_COLORS } from "View/Tools/AddSticker";
import { toRelativePoint } from "Board/Items/Connector/ControlPoint";

interface MiroImage {
	type: string;
	url: string;
}

const RICH_TEXT_MAX_WIDTH = 600;

const INITIAL_GEOMETRY = {
	sticky_note: {
		square: {
			width: 210,
			height: 210,
		},
		rectangle: {
			width: 240,
			height: 240,
		},
	},
	shape: {
		width: 100,
		height: 100,
	},
	frame: {
		width: 100,
		height: 100,
	},
};

const TEXT_VERTICAL_ALIGNMENT = {
	top: "top",
	middle: "center",
	bottom: "bottom",
};

const STICKER_COLOR = {
	dark_blue: STICKER_COLORS[0],
	blue: STICKER_COLORS[0],
	light_blue: STICKER_COLORS[0],
	red: STICKER_COLORS[5],
	orange: STICKER_COLORS[1],
	violet: STICKER_COLORS[3],
	pink: STICKER_COLORS[5],
	light_pink: STICKER_COLORS[5],
	cyan: STICKER_COLORS[4],
	dark_green: STICKER_COLORS[2],
	green: STICKER_COLORS[2],
	light_green: STICKER_COLORS[2],
	yellow: STICKER_COLORS[1],
	light_yellow: STICKER_COLORS[1],
	gray: STICKER_COLORS[6],
	black: STICKER_COLORS[7],
};

const SHAPE_TYPES = {
	round_rectangle: "RoundedRectangle",
	circle: "Circle",
	triangle: "Triangle",
	rhombus: "Rhombus",
	wedge_round_rectangle_callout: "SpeachBubble",
	parallelogram: "Parallelogram",
	star: "Star",
	right_arrow: "ArrowRight",
	left_arrow: "ArrowLeft",
	rectangle: "Rectangle",
	left_right_arrow: "ArrowLeftRight",
	pentagon: "Pentagon",
	octagon: "Octagon",
	hexagon: "Hexagon",
	flow_chart_predefined_process: "PredefinedProcess",
	trapezoid: "Trapezoid",
	cloud: "Cloud",
	cross: "Cross",
	can: "Cylinder",
	left_brace: "BracesRight",
	right_brace: "BracesLeft",
};

const BORDER_STYLES = {
	normal: "solid",
	dotted: "dot",
	dashed: "dash",
};

const CONNECTOR_TYPES = {
	straight: "straight",
	curved: "curved",
	elbowed: "curved",
};

const FRAME_TYPES = {
	custom: "Custom",
	a4: "A4",
	letter: "Letter",
	ratio_16x9: "Frame16x9",
	ratio_4x3: "Frame4x3",
	ratio_1x1: "Frame1x1",
	phone: "Custom",
	tablet: "Custom",
	desktop: "Custom",
};

const CONNECTOR_STYLES = {
	stealth: "ArrowBroad",
	"Arc Arrow": "ArrowThin",
	filled_triangle: "Angle",
	arrow: "ArrowThin",
	triangle: "TriangleEmpty",
	filled_diamond: "DiamondFilled",
	diamond: "DiamondEmpty",
	filled_oval: "CircleFilled",
	oval: "Zero",
	erd_one: "One",
	erd_many: "Many",
	erd_one_or_many: "ManyMandatory",
	erd_only_one: "OneMandatory",
	erd_zero_or_many: "ManyOptional",
	erd_zero_or_one: "OneOptional",
};

export const useCopyBoardItems = (
	board: Board,
	miroItems: IMiroBoardItem[],
): void => {
	const boardMiroId: { [key: string]: string } = {};

	const setBoardMiroId = (id: string): void => {
		boardMiroId[id] =
			board.items.listAll()[board.items.listAll().length - 1]?.getId() ||
			"";
	};

	const parseTextData = (text: string): Element[] => {
		const parser = new DOMParser();
		const parsedText = parser.parseFromString(text, "text/html");
		const elementsWithText: HTMLElement[] = [];
		const relevantTags = new Set(["strong", "em", "s", "u", "span", "br"]);

		function traverse(node: Node): void {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as HTMLElement;
				let hasText = false;
				let hasRelevantTag = false;

				element.childNodes.forEach(child => {
					if (child.nodeType === Node.ELEMENT_NODE) {
						const childElement = child as HTMLElement;
						const tagName = childElement.tagName.toLowerCase();

						if (relevantTags.has(tagName)) {
							hasRelevantTag = true;
							return;
						}
					}

					if (
						child.nodeType === Node.TEXT_NODE &&
						child.textContent?.trim()
					) {
						hasText = true;
					}

					traverse(child);
				});

				if (hasRelevantTag || hasText) {
					elementsWithText.push(element);
				}
			}
		}

		traverse(parsedText.body);

		return elementsWithText;
	};

	const setItemText = (
		item: Shape | Sticker | RichText | Connector,
		text: string,
		style: IMiroBoardItemStyle,
	): void => {
		const textEls = parseTextData(text);

		if (!textEls) {
			return;
		}

		const { textAlign } = style;
		const targetText = item.itemType === "RichText" ? item : item.text;
		const editor = targetText.editor.editor;

		textEls.forEach((element, index) => {
			const textChildren = getTextNodes(
				element as HTMLElement,
				style,
				item,
			);

			const node: Descendant = {
				type: "paragraph",
				children: textChildren,
				horisontalAlignment: textAlign as HorisontalAlignment,
			};

			editor.children = index === 0 ? [node] : [...editor.children, node];
		});
	};

	const getTextNodes = (
		element: HTMLElement,
		style?: IMiroBoardItemStyle,
		item?: Shape | Sticker | RichText | Connector,
	): (TextNode & { "line-through": boolean })[] => {
		return Array.from(element.childNodes).map(child => {
			const childElement = child as HTMLElement;
			const stringText = child.textContent ?? "";
			const fontStyles = getFontStyles(childElement);
			const spanText =
				childElement.children &&
				childElement.getElementsByTagName("span")[0];
			const textStyles = spanText ? spanText.style : childElement.style;
			const stickerColor =
				item &&
				item.itemType === "Sticker" &&
				item.getBackgroundColor() === STICKER_COLORS[7] &&
				"white";
			const textColor =
				textStyles?.color || style?.color || stickerColor || "black";

			return {
				text: stringText,
				type: "text",
				bold: fontStyles.includes("bold"),
				italic: fontStyles.includes("italic"),
				underline: fontStyles.includes("underline"),
				overline: false,
				lineThrough: fontStyles.includes("line-through"),
				subscript: false,
				superscript: false,
				fontColor: textColor,
				fontSize: style?.fontSize ? +style.fontSize : 14,
				fontHighlight: textStyles?.backgroundColor,
				"line-through": fontStyles.includes("line-through"),
			};
		});
	};

	const getFontStyles = (element: HTMLElement): string[] => {
		const fontStyles: string[] = [];
		const tagName = element?.tagName?.toLowerCase();

		if (tagName === "strong") {
			fontStyles.push("bold");
		}
		if (tagName === "em") {
			fontStyles.push("italic");
		}
		if (tagName === "u") {
			fontStyles.push("underline");
		}
		if (tagName === "s") {
			fontStyles.push("line-through");
		}

		Array.from(element.childNodes).forEach(child => {
			if (child instanceof HTMLElement) {
				fontStyles.push(...getFontStyles(child));
			}
		});

		return fontStyles;
	};

	const setVerticalAlignment = (textAlignVertical: string): void => {
		const lastBoardItem =
			board.items.listAll()[board.items.listAll().length - 1];

		board.selection.add(lastBoardItem);
		board.selection.setVerticalAlignment(
			TEXT_VERTICAL_ALIGNMENT[textAlignVertical],
		);
		board.selection.remove(lastBoardItem);
	};

	const getMiroItemById = (id: string): IMiroBoardItem | undefined =>
		miroItems.find((item: IMiroBoardItem) => item.id === id);

	const getItemPosition = (
		position: IMiroPosition,
		geometry: IMiroGeometry,
		parent?: IMiroParent,
	): { x: number; y: number } | null => {
		const { x, y, relativeTo } = position;
		const { height, width } = geometry;
		if (relativeTo === MiroRelativeTo.board) {
			return {
				x: x - width / 2,
				y: y - height / 2,
			};
		}

		if (!parent) {
			console.error("Parent is undefined");
			return null;
		}

		const frame = getMiroItemById(parent?.id) as IMiroBoardItemFrame;
		const framePosition = getItemPosition(frame.position, frame.geometry);

		if (!framePosition) {
			console.error("Unable to find frame position");
			return null;
		}

		return {
			x: x - width / 2 + framePosition.x,
			y: y - height / 2 + framePosition.y,
		};
	};

	const getItemGeometry = (
		geometry: IMiroGeometry,
		itemType: string,
		shapeType?: string,
	): { width: number; height: number } => {
		const { width, height } = geometry;

		if (itemType === "sticky_note" && shapeType) {
			return {
				width: width / INITIAL_GEOMETRY[itemType][shapeType].width,
				height: height / INITIAL_GEOMETRY[itemType][shapeType].height,
			};
		}

		const initialGeometry = INITIAL_GEOMETRY[itemType] ?? {
			width: 1,
			height: 1,
		};

		return {
			width: width / initialGeometry.width,
			height: height / initialGeometry.height,
		};
	};

	const setTransformation = (item: Item, miroItem: IMiroBoardItem): void => {
		const { geometry, position, parent } = miroItem;
		const shapeType =
			miroItem.type === "sticky_note" ? miroItem.data.shape : undefined;
		const itemGeometry = getItemGeometry(
			geometry,
			miroItem.type,
			shapeType,
		);

		if (item.itemType === "RichText") {
			applyRichTextTransformation(item, position, parent);
		} else {
			applyStandardTransformation(
				item,
				itemGeometry,
				miroItem,
				position,
				parent,
			);
		}
	};

	const applyRichTextTransformation = (
		item: Item,
		position: IMiroPosition,
		parent?: IMiroParent,
	): void => {
		const { width, height } = getItemDimensions(item);
		const itemPosition = getItemPosition(
			position,
			{ width, height },
			parent,
		);

		if (itemPosition) {
			item.transformation.translateTo(itemPosition.x, itemPosition.y);
		}
	};

	const applyStandardTransformation = (
		item: Item,
		itemGeometry: { width: number; height: number },
		miroItem: IMiroBoardItem,
		position: IMiroPosition,
		parent?: IMiroParent,
	): void => {
		const updatedGeometry = updateStickerGeometry(
			item,
			itemGeometry,
			miroItem,
		);
		const itemPosition = getItemPosition(
			position,
			miroItem.geometry,
			parent,
		);

		if (itemPosition) {
			item.transformation.translateTo(itemPosition.x, itemPosition.y);
		}

		item.transformation.scaleTo(
			updatedGeometry.width,
			updatedGeometry.height,
		);
	};

	const getItemDimensions = (
		item: Item,
	): { width: number; height: number } => {
		const mbr = item.getPath().getMbr();
		return {
			width: mbr.getWidth(),
			height: mbr.getHeight(),
		};
	};

	const updateStickerGeometry = (
		item: Item,
		geometry: { width: number; height: number },
		miroItem: IMiroBoardItem,
	): { width: number; height: number } => {
		if (item.itemType !== "Sticker") {
			return geometry;
		}

		if ((miroItem as IMiroBoardItemSticker).data.shape === "square") {
			return {
				width: geometry.height,
				height: geometry.height,
			};
		}

		return {
			width: geometry.width,
			height: geometry.height,
		};
	};

	const copyShape = (item: IMiroBoardItemShape): void | null => {
		const { id, style, position, data, geometry } = item;
		if (!position || !geometry) {
			return null;
		}

		const miroShapeType = data?.shape ?? "rectangle";
		const shapeType = SHAPE_TYPES[miroShapeType];

		const newShape = new Shape(undefined, id, shapeType);

		if (style) {
			const {
				fillColor,
				fillOpacity,
				borderColor,
				borderOpacity,
				borderStyle,
				borderWidth,
			} = style;

			if (borderStyle) {
				const newBorderStyle = BORDER_STYLES[borderStyle];
				newShape.setBorderStyle(newBorderStyle);
			}

			if (fillColor) {
				const shapeFillColor =
					fillColor === "#ffffff" ? "transparent" : fillColor;
				newShape.setBackgroundColor(shapeFillColor);
			}

			fillOpacity && newShape.setBackgroundOpacity(+fillOpacity);
			borderColor && newShape.setBorderColor(borderColor);
			borderOpacity && newShape.setBorderOpacity(+borderOpacity);
			borderWidth && newShape.setBorderWidth(+borderWidth);
		}

		setTransformation(newShape, item);
		data?.content && setItemText(newShape, data.content, style);

		board.add(newShape);
		setBoardMiroId(id);

		if (style?.textAlignVertical) {
			setVerticalAlignment(style.textAlignVertical);
		}
	};

	const copySticker = (item: IMiroBoardItemSticker): void | null => {
		const { id, style, data } = item;
		const { fillColor, textAlignVertical } = style;
		if (!fillColor) {
			return null;
		}
		const color = STICKER_COLOR[fillColor];
		const sticker = new Sticker(undefined, id, color);

		setTransformation(sticker, item);
		setItemText(sticker, data.content, style);

		board.add(sticker);
		setBoardMiroId(id);

		if (textAlignVertical) {
			setVerticalAlignment(textAlignVertical);
		}
	};

	const getImage = async (imageUrl: string): Promise<MiroImage | null> => {
		const token = Cookies.get("miro_accessToken");
		try {
			const response = await fetch(imageUrl, {
				headers: {
					Authorization: "Bearer " + token,
				},
			});
			const img = await response.json();
			return img;
		} catch (error) {
			console.error(error);
		}
		return null;
	};

	const imageUrlToBase64 = async (
		url: string,
	): Promise<string | undefined> => {
		const data = await fetch(url);
		const blob = await data.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				const base64data = reader.result?.toString();
				resolve(base64data);
			};
			reader.onerror = reject;
		});
	};

	const copyImage = async (item: IMiroBoardItemImage): Promise<void> => {
		const { id, position, data, geometry } = item;
		const prepareImgUrl =
			data.imageUrl.split("?")[0] + "?format=original&redirect=false";
		const img = await getImage(prepareImgUrl);
		const imgUrl = img?.url ?? "";
		const imgBase64: string = await imageUrlToBase64(imgUrl ?? "").then(
			base64Data => base64Data ?? "",
		);

		prepareImage(imgBase64).then(imageData => {
			const imgItem = new ImageItem(imageData).setId(id);

			const imgItemWidth = geometry.width / imgItem.imageDimension.width;
			const imgItemHeight =
				geometry.height / imgItem.imageDimension.height;

			const imgPosition = getItemPosition(
				position,
				geometry,
				item.parent,
			);

			imgPosition &&
				imgItem.transformation.translateTo(
					imgPosition.x,
					imgPosition.y,
				);

			imgItem.transformation.scaleTo(imgItemWidth, imgItemHeight);

			board.add(imgItem);
			setBoardMiroId(id);
		});
	};

	const getConnectorPoint = (
		start: number,
		geometry?: number,
		percent?: string,
	): number => {
		if (geometry) {
			const percentInt = percent?.replace("%", "") ?? 1;
			return start + (geometry * Number(percentInt)) / 100;
		}
		return start;
	};

	const setConnectorsStyles = (
		connector: Connector,
		startMiroStyle?: string,
		endMiroStyle?: string,
	): void => {
		if (endMiroStyle) {
			const endStyle = CONNECTOR_STYLES[endMiroStyle];
			connector.setEndPointerStyle(endStyle);
		}

		if (startMiroStyle) {
			const startStyle = CONNECTOR_STYLES[startMiroStyle];
			connector.setStartPointerStyle(startStyle);
		}
	};

	const copyConnector = (item: IMiroBoardItemConnector): void | null => {
		const { startItem, endItem, style, shape, captions } = item;
		const connectorError = "Start and end connector points not found";
		const notFoundConnectorItemById =
			"Start and end connection objects for the connector not found";

		if (!startItem || !endItem) {
			console.error(connectorError);
			return null;
		}
		// start and end connection objects for the connector
		const startItemMiro = board.items.getById(boardMiroId[startItem.id]);
		const endItemMiro = board.items.getById(boardMiroId[endItem.id]);

		if (!startItemMiro || !endItemMiro) {
			console.error(notFoundConnectorItemById);
			return null;
		}

		const startDimensions = getItemDimensions(startItemMiro);
		const { left: startItemX, top: startItemY } = startItemMiro
			.getPath()
			.getMbr();

		const endDimensions = getItemDimensions(endItemMiro);
		const { left: endItemX, top: endItemY } = endItemMiro
			.getPath()
			.getMbr();

		const startX = getConnectorPoint(
			startItemX,
			startDimensions.width,
			startItem.position?.x,
		);
		const startY = getConnectorPoint(
			startItemY,
			startDimensions.height,
			startItem.position?.y,
		);

		const endX = getConnectorPoint(
			endItemX,
			endDimensions.width,
			endItem.position?.x,
		);
		const endY = getConnectorPoint(
			endItemY,
			endDimensions.height,
			endItem.position?.y,
		);

		const startRelativePoint = toRelativePoint(
			new Point(startX, startY),
			startItemMiro,
		);
		const endRelativePoint = toRelativePoint(
			new Point(endX, endY),
			endItemMiro,
		);

		const connector = new Connector(
			board,
			undefined,
			new FixedPoint(startItemMiro, startRelativePoint),
			new FixedPoint(endItemMiro, endRelativePoint),
		);

		const {
			strokeColor,
			strokeWidth: miroStrokeWidth,
			startStrokeCap,
			endStrokeCap,
		} = style;
		strokeColor && connector.setLineColor(strokeColor);

		const connectorType = CONNECTOR_TYPES[shape];
		connectorType && connector.setLineStyle(connectorType);

		const strokeWidth =
			miroStrokeWidth &&
			ConnectionLineWidths.find(width => width === +miroStrokeWidth);
		connector.setLineWidth(
			strokeWidth ? strokeWidth : CONNECTOR_LINE_WIDTH,
		);

		setConnectorsStyles(connector, startStrokeCap, endStrokeCap);
		captions && setItemText(connector, captions[0].content, style);

		board.add(connector);
	};

	const copyText = (item: IMiroBoardItemText): void => {
		const { id, style, data, geometry } = item;

		const richtext = new RichText(new Mbr(), id);

		const richTextWidth = geometry?.width ?? RICH_TEXT_MAX_WIDTH;
		richtext.setMaxWidth(richTextWidth);
		setItemText(richtext, data.content, style);

		board.add(richtext);
		setBoardMiroId(id);

		const boardRichText =
			board.items.listAll()[board.items.listAll().length - 1];
		setTransformation(boardRichText, item);
	};

	const copyFrame = (item: IMiroBoardItemFrame): void => {
		const { style, id, data } = item;
		const { fillColor } = style;
		const { format } = data;
		const frame = new Frame().setId(id).setBoard(board);

		fillColor && frame.setBackgroundColor(fillColor);
		frame.setFrameType(FRAME_TYPES[format]);

		setTransformation(frame, item);

		board.add(frame);

		setBoardMiroId(id);
	};

	const zoomToFit = (): void => {
		const items = board.items.listAll();
		if (items.length > 0) {
			const rect = board.items.getMbr();
			board.camera.zoomToFit(rect);
		}
	};

	const copyBoardItems = (): void => {
		const itemsTypes: {
			[key in MiroItemsTypes]: (item: any) => void;
		} = {
			shape: copyShape,
			sticky_note: copySticker,
			image: copyImage,
			text: copyText,
			frame: copyFrame,
			connector: copyConnector,
		};

		miroItems.forEach((item: IMiroBoardItem) => {
			const type = item.type as MiroItemsTypes;

			if (
				item.type !== MiroBoardItemTypes.CONNECTOR &&
				itemsTypes[type]
			) {
				itemsTypes[type](item);
			}
		});

		miroItems
			.filter(item => item.type === MiroBoardItemTypes.CONNECTOR)
			.forEach((item: IMiroBoardItem) => {
				copyConnector(item as IMiroBoardItemConnector);
			});

		zoomToFit();
	};

	copyBoardItems();
};
