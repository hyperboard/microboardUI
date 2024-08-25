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
import { Connector, Frame, Item, Mbr, RichText, Shape } from "Board/Items";
import { BorderStyle } from "Board/Items/Path";
import { Sticker, stickerColors } from "Board/Items/Sticker";
import { ImageItem } from "Board/Items/Image";
import Cookies from "js-cookie";
import { ConnectionLineWidths } from "Board/Items/Connector/Connector";
import { CONNECTOR_LINE_WIDTH } from "View/Items/Connector";
import { prepareImage } from "Board/Items/Image/ImageHelpers";
import { BoardPoint } from "Board/Items/Connector";
import { Descendant, Editor, Path, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { TextNode, TextStyle } from "Board/Items/RichText/Editor/TextNode";

interface MiroImage {
	type: string;
	url: string;
}

const RICH_TEXT_MAX_WIDTH = 600;

const INITIAL_GEOMETRY = {
	sticky_note: {
		width: 200,
		height: 200,
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

const STICKER_COLOR = {
	dark_blue: stickerColors["Sky Blue"],
	blue: stickerColors["Sky Blue"],
	light_blue: stickerColors["Sky Blue"],
	red: stickerColors["Pastel Red"],
	orange: stickerColors["Pastel Red"],
	violet: stickerColors["Pastel Red"],
	pink: stickerColors["Pastel Red"],
	light_pink: stickerColors["Lavender"],
	cyan: stickerColors["Aqua Cyan"],
	dark_green: stickerColors["Sage Green"],
	green: stickerColors["Sage Green"],
	light_green: stickerColors["Sage Green"],
	yellow: stickerColors["Pale Yellow"],
	light_yellow: stickerColors["Pale Yellow"],
	gray: stickerColors["Light Gray"],
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

		function traverse(node: Node): void {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as HTMLElement;
				let hasText = false;
				let hasStrong = false;

				element.childNodes.forEach(child => {
					if (child.nodeType === Node.ELEMENT_NODE) {
						const childElement = child as HTMLElement;

						if (
							childElement.tagName.toLowerCase() === "strong" ||
							childElement.tagName.toLowerCase() === "em" ||
							childElement.tagName.toLowerCase() === "s" ||
							childElement.tagName.toLowerCase() === "u" ||
							childElement.tagName.toLowerCase() === "span"
						) {
							hasStrong = true;
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

				if (hasStrong || hasText) {
					elementsWithText.push(element);
				}
			}
		}

		traverse(parsedText.body);

		return elementsWithText;
	};

	//

	const setItemText = (
		item: Shape | Sticker | RichText,
		text: string,
		style: IMiroBoardItemStyle,
	): void => {
		const textEls = parseTextData(text);

		if (!textEls) return;

		const { fontSize } = style;
		const targetText = item.itemType === "RichText" ? item : item.text;
		const editor = targetText.editor.editor;

		textEls.forEach((element, index) => {
			const textChildren: TextNode[] = getTextNodes(
				element as HTMLElement,
			);

			Transforms.insertNodes(
				editor,
				{ type: "paragraph", children: textChildren },
				{
					at: {
						path: [index, 0],
						offset: targetText.getTextString().length,
					},
				},
			);

			if (fontSize) {
				targetText.setSelectionFontSize(+fontSize);
			}
		});
	};

	const getTextNodes = (element: HTMLElement): TextNode[] => {
		return Array.from(element.childNodes).map(child => {
			const childElement = child as HTMLElement;
			const stringText = child.textContent ?? "";
			const fontStyles = getFontStyles(childElement);
			const textStyles = childElement.style;

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
				fontColor: textStyles?.color ?? "black",
			};
		});
	};

	const getFontStyles = (element: HTMLElement): string[] => {
		const fontStyles: string[] = [];
		const tagName = element?.tagName?.toLowerCase();

		if (tagName === "strong") fontStyles.push("bold");
		if (tagName === "em") fontStyles.push("italic");
		if (tagName === "u") fontStyles.push("underline");
		if (tagName === "s") fontStyles.push("line-through");

		Array.from(element.childNodes).forEach(child => {
			if (child instanceof HTMLElement) {
				fontStyles.push(...getFontStyles(child));
			}
		});

		return fontStyles;
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
	): { width: number; height: number } => {
		const initialGeometry = INITIAL_GEOMETRY[itemType] ?? {
			width: 1,
			height: 1,
		};
		const { width, height } = geometry;

		return {
			width: width / initialGeometry.width,
			height: height / initialGeometry.height,
		};
	};

	const setTransformation = (item: Item, miroItem: IMiroBoardItem): void => {
		const { geometry, position, parent } = miroItem;

		const itemGeometry = getItemGeometry(
			geometry,
			MiroBoardItemTypes.SHAPE,
		);

		if (item.itemType === "RichText") {
			const height = item.getPath().getMbr().getHeight();
			const width = item.getPath().getMbr().getWidth();
			const richtextGeometry = {
				width,
				height,
			};
			const itemPosition = getItemPosition(
				position,
				richtextGeometry,
				parent,
			);

			itemPosition &&
				item.transformation.translateTo(itemPosition.x, itemPosition.y);

			return;
		}

		const itemPosition = getItemPosition(position, geometry, parent);

		itemPosition &&
			item.transformation.translateTo(itemPosition.x, itemPosition.y);

		item.transformation.scaleTo(itemGeometry.width, itemGeometry.height);
	};

	const copyShape = (item: IMiroBoardItemShape): void | null => {
		const { id, style, position, data, geometry } = item;
		if (!data || !position || !geometry) return null;

		const {
			fillColor,
			fillOpacity,
			borderColor,
			borderOpacity,
			borderStyle,
			borderWidth,
		} = style;
		const { shape, content } = data;
		const miroShapeType = shape ?? "";
		const shapeType = SHAPE_TYPES[miroShapeType];
		if (borderOpacity && borderWidth && borderColor && borderStyle) {
			const newBorderStyle = BORDER_STYLES[borderStyle];
			const newShape = new Shape(
				undefined,
				id,
				shapeType,
				fillColor === "#ffffff" ? "transparent" : fillColor,
				+fillOpacity,
				borderColor,
				+borderOpacity,
				newBorderStyle as BorderStyle,
				+borderWidth,
			);

			setTransformation(newShape, item);

			content && setItemText(newShape, content, style);

			board.add(newShape);
			setBoardMiroId(id);
		}
	};

	const copySticker = (item: IMiroBoardItemSticker): void | null => {
		const { id, style, data } = item;
		const { fillColor } = style;
		if (!fillColor) return null;
		const color = STICKER_COLOR[fillColor];
		const sticker = new Sticker(undefined, id, color);

		setTransformation(sticker, item);

		if (!data.content) return null;
		setItemText(sticker, data.content, style);

		board.add(sticker);
		setBoardMiroId(id);
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
			const percentInt = Number(percent?.replace("%", "")) ?? 1;
			return start + (geometry * percentInt) / 100;
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
		const { startItem, endItem, style, shape } = item;
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

		const startWidth = startItemMiro.getPath().getMbr().getWidth();
		const startHeight = startItemMiro.getPath().getMbr().getHeight();
		const { left: startItemX, top: startItemY } = startItemMiro
			.getPath()
			.getMbr();

		const endWidth = endItemMiro.getPath().getMbr().getWidth();
		const endHeight = endItemMiro.getPath().getMbr().getHeight();
		const { left: endItemX, top: endItemY } = endItemMiro
			.getPath()
			.getMbr();

		const startX = getConnectorPoint(
			startItemX,
			startWidth,
			startItem.position?.x,
		);
		const startY = getConnectorPoint(
			startItemY,
			startHeight,
			startItem.position?.y,
		);

		const endX = getConnectorPoint(endItemX, endWidth, endItem.position?.x);
		const endY = getConnectorPoint(
			endItemY,
			endHeight,
			endItem.position?.y,
		);

		const connector = new Connector(
			board,
			undefined,
			new BoardPoint(startX, startY),
			new BoardPoint(endX, endY),
		);

		const {
			strokeColor,
			strokeWidth: miroStrokeWidth,
			startStrokeCap,
			endStrokeCap,
		} = style;
		strokeColor && connector.setLineColor(strokeColor);

		const connectorType = CONNECTOR_TYPES[shape];
		connector.setLineStyle(connectorType);
		const strokeWidth =
			miroStrokeWidth &&
			ConnectionLineWidths.find(width => width === +miroStrokeWidth);
		connector.setLineWidth(
			strokeWidth ? strokeWidth : CONNECTOR_LINE_WIDTH,
		);

		setConnectorsStyles(connector, startStrokeCap, endStrokeCap);

		board.add(connector);
	};

	const copyText = (item: IMiroBoardItemText): void => {
		const { id, style, data, geometry } = item;

		const richtext = new RichText(new Mbr(), id);

		const richTextWidth = geometry?.width ?? RICH_TEXT_MAX_WIDTH;
		richtext.setMaxWidth(richTextWidth);

		board.add(richtext);
		setBoardMiroId(id);

		const boardRichText =
			board.items.listAll()[board.items.listAll().length - 1];
		setTransformation(boardRichText, item);
		setItemText(boardRichText as RichText, data.content, style);
	};

	const copyFrame = (item: IMiroBoardItemFrame): void => {
		const { style, id, data } = item;
		const { fillColor } = style;
		const { format } = data;
		const frame = new Frame(board.events).setId(id).setBoard(board);

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
