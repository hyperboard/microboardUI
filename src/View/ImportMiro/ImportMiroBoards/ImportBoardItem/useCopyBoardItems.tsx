import { Board } from "Board";
import {
	IMiroBoardItem,
	IMiroBoardItemConnector,
	IMiroBoardItemFrame,
	IMiroBoardItemImage,
	IMiroBoardItemShape,
	IMiroBoardItemSticker,
	IMiroBoardItemText,
	MiroBoardItemTypes,
	MiroItemsTypes,
} from "../MiroBoards/MiroBoardsModels";
import { Connector, Frame, Mbr, RichText, Shape } from "Board/Items";
import { BorderStyle } from "Board/Items/Path";
import { Sticker, stickerColors } from "Board/Items/Sticker";
import { ImageItem } from "Board/Items/Image";
import Cookies from "js-cookie";
import { ConnectionLineWidths } from "Board/Items/Connector/Connector";
import { CONNECTOR_LINE_WIDTH } from "View/Items/Connector";
import { prepareImage } from "Board/Items/Image/ImageHelpers";
import { BoardPoint } from "Board/Items/Connector";

interface MiroImage {
	type: string;
	url: string;
}

export const useCopyBoardItems = (
	board: Board,
	miroItems: IMiroBoardItem[],
): void => {
	const SCALE_FACTOR = 200;
	const RICH_TEXT_MAX_WIDTH = 600;

	const colorsSticker = {
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

	const shapeTypes = {
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

	const borderStyles = {
		normal: "solid",
		dotted: "dot",
		dashed: "dash",
	};

	const connectorTypes = {
		straight: "straight",
		curved: "curved",
		elbowed: "curved",
	};

	const frameTypes = {
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

	const connectorStyles = {
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

	const parseTextData = (text: string): Element[] => {
		const parser = new DOMParser();
		const parsedText = parser.parseFromString(text, "text/html");
		return Array.from(parsedText.getElementsByTagName("body")[0].children);
	};

	const setItemText = (
		item: Shape | Sticker,
		text: string,
		fontSize: string,
		fontFamily: string,
	): void => {
		const textEls = parseTextData(text);

		if (textEls) {
			textEls.forEach(element => {
				const textSpan = element.getElementsByTagName("span")[0];
				const paragraph = (element as HTMLElement).innerText ?? "\n";

				item.text.addText(paragraph);

				if (fontSize) {
					item.text.setSelectionFontSize(+fontSize);
				}

				item.text.setSelectionFontFamily(fontFamily);

				if (item.itemType === "Shape" && textSpan) {
					const { color, backgroundColor } = textSpan.style;
					item.text.setSelectionFontColor(color);
					item.text.setSelectionFontHighlight(backgroundColor);
				}
			});
		}
	};

	const copyShape = (item: IMiroBoardItemShape): void => {
		const { id, style, position, data, geometry } = item;
		if (data && position && geometry) {
			const { height, width } = geometry;
			const {
				fillColor,
				fillOpacity,
				borderColor,
				borderOpacity,
				borderStyle,
				borderWidth,
				fontSize,
				fontFamily,
			} = style;
			const { x, y } = position;
			const { shape, content } = data;
			const miroShapeType = shape ?? "";
			const shapeType = shapeTypes[miroShapeType];
			if (borderOpacity && borderWidth && borderColor && borderStyle) {
				const newBorderStyle = borderStyles[borderStyle];
				const newShape = new Shape(
					undefined,
					id,
					shapeType,
					fillColor ?? "",
					+fillOpacity,
					borderColor,
					+borderOpacity,
					newBorderStyle as BorderStyle,
					+borderWidth,
				);
				const shapeW = newShape.getPaths().getMbr().getWidth();
				const shapeH = newShape.getPaths().getMbr().getHeight();

				const newShapeX = x - width / 2;
				const newShapeY = y - height / 2;

				newShape.transformation.translateTo(newShapeX, newShapeY);
				newShape.transformation.scaleTo(
					width / shapeW,
					height / shapeH,
				);

				content && setItemText(newShape, content, fontSize, fontFamily);

				board.add(newShape);
			}
		}
	};

	const copySticker = (item: IMiroBoardItemSticker): void => {
		const { id, style, position, data, geometry } = item;
		const { fillColor } = style;
		if (fillColor) {
			const { height, width } = geometry;
			const { x, y } = position!;
			const color = colorsSticker[fillColor];
			const sticker = new Sticker(undefined, id, color);

			const stickerX = x - width / 2;
			const stickerY = y - height / 2;

			const initialWidth = sticker.getPaths().getMbr().getWidth();
			const initialHeight = sticker.getPaths().getMbr().getHeight();
			const stickerWidth = width / initialWidth;
			const stickerHeight = height / initialHeight;

			sticker.transformation.translateTo(stickerX, stickerY);
			sticker.transformation.scaleTo(stickerWidth, stickerHeight);

			if (data.content) {
				const { fontSize, fontFamily } = style;
				setItemText(sticker, data.content, fontSize, fontFamily);
			}

			board.add(sticker);
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
			console.log(error);
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
		const { position, data, geometry } = item;
		const { x, y } = position;
		const { width, height } = geometry;
		const prepareImgUrl =
			data.imageUrl.split("?")[0] + "?format=original&redirect=false";
		const img = await getImage(prepareImgUrl);
		const imgUrl = img?.url ?? "";
		const imgBase64: string = await imageUrlToBase64(imgUrl ?? "").then(
			base64Data => base64Data ?? "",
		);

		prepareImage(imgBase64).then(imageData => {
			const imgItem = new ImageItem(imageData);

			const imgX = x - width / 2;
			const imgY = y - height / 2;

			const imgW = width / imgItem.imageDimension.width;
			const imgH = height / imgItem.imageDimension.height;

			imgItem.transformation.translateTo(imgX, imgY);
			imgItem.transformation.scaleTo(imgW, imgH);

			board.add(imgItem);
		});
	};

	const getMiroItemById = (id: string): IMiroBoardItem | undefined =>
		miroItems.find((item: IMiroBoardItem) => item.id === id);

	const getConnectorPoint = (
		start: number,
		geometry: number | undefined,
		percent: string | undefined,
	): number => {
		const percentInt = percent?.replace("%", "") ?? 1;
		if (geometry) {
			const startPoint = start - geometry / 2;
			return startPoint + (geometry * +percentInt) / 100;
		}
		return start;
	};

	const setConnectorsStyles = (
		connector: Connector,
		startMiroStyle?: string,
		endMiroStyle?: string,
	): void => {
		if (endMiroStyle) {
			const endStyle = connectorStyles[endMiroStyle];
			connector.setEndPointerStyle(endStyle);
		}

		if (startMiroStyle) {
			const startStyle = connectorStyles[startMiroStyle];
			connector.setStartPointerStyle(startStyle);
		}
	};

	const copyConnector = (item: IMiroBoardItemConnector): void | null => {
		const { startItem, endItem, style, shape } = item;
		const connectorError = "Start and end connector points not found";
		const notFoundConnectorItemById =
			"Start and end connection objects for the connector not found";

		if (!startItem?.position || !endItem?.position) {
			console.error(connectorError);
			return null;
		}
		// start and end connection objects for the connector
		const startItemMiro = getMiroItemById(startItem.id);
		const endItemMiro = getMiroItemById(endItem.id);

		if (!startItemMiro || !endItemMiro) {
			console.error(notFoundConnectorItemById);
			return null;
		}
		// coordinates of the start and end objects for the connector
		const { x: startItemX, y: startItemY } = startItemMiro.position;
		const { x: endItemX, y: endItemY } = endItemMiro.position;

		// geometry of the start and end objects for the connector
		const startItemHeight =
			startItemMiro.type !== MiroBoardItemTypes.TEXT
				? startItemMiro.geometry.height
				: undefined;
		const endItemHeight =
			endItemMiro.type !== MiroBoardItemTypes.TEXT
				? endItemMiro.geometry.height
				: undefined;

		const startX = getConnectorPoint(
			startItemX,
			startItemMiro.geometry.width,
			startItem.position.x,
		);
		const startY = getConnectorPoint(
			startItemY,
			startItemHeight,
			startItem.position.y,
		);

		const endX = getConnectorPoint(
			endItemX,
			endItemMiro.geometry.width,
			endItem.position.x,
		);
		const endY = getConnectorPoint(
			endItemY,
			endItemHeight,
			endItem.position.y,
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

		const connectorType = connectorTypes[shape];
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
		const { style, position, data, geometry } = item;
		const { x, y } = position;
		const { fontSize, color } = style;

		const richtext = new RichText(new Mbr());

		const richTextWidth = geometry?.width ?? RICH_TEXT_MAX_WIDTH;
		richtext.setMaxWidth(richTextWidth);

		const textEls = parseTextData(data.content);
		textEls.forEach((text, index) => {
			const paragraph = (text as HTMLElement).innerText ?? "\n";
			const textSpanStyles = text.getElementsByTagName("span")[0]?.style;

			if (index === 0) {
				richtext.editor.editor.children = [
					{
						type: "paragraph",
						children: [
							{
								type: "text",
								text: paragraph,
								fontColor: color ?? "black",
								fontSize: +fontSize,
								fontHighlight:
									textSpanStyles?.backgroundColor ?? "",
							},
						],
					},
				];
			} else {
				richtext.editor.editor.children = [
					...richtext.editor.editor.children,
					{
						type: "paragraph",
						children: [
							{
								type: "text",
								text: paragraph,
								fontColor: color ?? "black",
								fontSize: +fontSize,
								fontHighlight:
									textSpanStyles?.backgroundColor ?? "",
							},
						],
					},
				];
			}
		});

		const richtextX = x - richTextWidth / 3;
		const richtextY = y;
		richtext.transformation.translateTo(richtextX, richtextY);

		const height = richtext.getHeight();
		richtext.transformation.translateTo(richtextX, y - height / 2);

		board.add(richtext);
	};

	const zoomToFit = (): void => {
		const items = board.items.listAll();
		if (items.length > 0) {
			const rect = board.items.getMbr();
			board.camera.zoomToFit(rect);
		}
	};

	const copyFrame = (item: IMiroBoardItemFrame): void => {
		const { style, geometry, position, id, data } = item;
		const { width, height } = geometry;
		const { x, y } = position;
		const { fillColor } = style;
		const { format } = data;
		const frame = new Frame(board.events).setId(id).setBoard(board);

		fillColor && frame.setBackgroundColor(fillColor);
		frame.setFrameType(frameTypes[format]);

		const frameX = x - width / 2;
		const frameY = y - height / 2;

		const initialWidth = frame.getPaths().getMbr().getWidth();
		const initialHeight = frame.getPaths().getMbr().getHeight();

		const frameWidth = width / initialWidth;
		const frameHeight = height / initialHeight;

		frame.transformation.translateTo(frameX, frameY);
		frame.transformation.scaleTo(frameWidth, frameHeight);

		board.add(frame);
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
			if (itemsTypes[type]) {
				itemsTypes[type](item);
			}
		});

		zoomToFit();
	};

	copyBoardItems();
};
