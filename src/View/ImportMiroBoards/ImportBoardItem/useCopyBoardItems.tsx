import { Board } from "Board";
import { IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { Connector, Mbr, RichText, Shape } from "Board/Items";
import { BorderStyle } from "Board/Items/Path";
import { Sticker, stickerColors } from "Board/Items/Sticker";
import { ImageItem } from "Board/Items/Image";
import Cookies from "js-cookie";
import { BoardPoint } from "Board/Items/Connector";
import { ConnectionLineWidths } from "Board/Items/Connector/Connector";
import { CONNECTOR_LINE_WIDTH } from "View/Items/Connector";

interface MiroImage {
	type: string;
	url: string;
}

export function useCopyBoardItems(
	board: Board,
	miroItems: IMiroBoardItem[],
): void {
	const SCALE_FACTOR = 100;

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
		rectangle: "Rectangle",
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

	const setItemText = (
		item: Shape | Sticker,
		text: string,
		fontSize: string,
		fontFamily: string,
	): void => {
		const textWithoutTag = text.replace(/<[^>]*>/g, "");
		item.text.addText(textWithoutTag);
		item.text.setSelectionFontSize(+fontSize);
		item.text.setSelectionFontFamily(fontFamily);
	};

	const copyShape = (item: IMiroBoardItem): void => {
		const { id, style, position, data, geometry } = item;
		const { x, y } = position;
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
		if (data) {
			const { shape, content } = data;
			const miroShapeType = shape ?? "";
			const shapeType = shapeTypes[miroShapeType];
			if (borderOpacity && borderWidth && borderColor && borderStyle) {
				const newBorderStyle = borderStyles[borderStyle];
				const newShape = new Shape(
					undefined,
					id,
					shapeType,
					fillColor,
					+fillOpacity,
					borderColor,
					+borderOpacity,
					newBorderStyle as BorderStyle,
					+borderWidth,
				);

				newShape.transformation.translateTo(x, y);
				newShape.transformation.scaleTo(
					width / SCALE_FACTOR,
					height / SCALE_FACTOR,
				);

				content && setItemText(newShape, content, fontSize, fontFamily);

				board.add(newShape);
			}
		}
	};

	const copySticker = (item: IMiroBoardItem): void => {
		const { id, style, position, data, geometry } = item;
		const { x, y } = position;
		const { height, width } = geometry;
		const { fillColor, fontSize, fontFamily } = style;
		if (data && fillColor) {
			const color = colorsSticker[fillColor];
			const sticker = new Sticker(undefined, id, color);

			sticker.transformation.translateTo(x, y);
			const stickerScaleFactor = SCALE_FACTOR * 2;
			sticker.transformation.scaleTo(
				width / stickerScaleFactor,
				height / stickerScaleFactor,
			);

			data.content &&
				setItemText(sticker, data.content, fontSize, fontFamily);

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
			const data = await response.json();
			return data;
		} catch (error) {
			console.log(error);
		}
		return null;
	};

	const imageUrlToBase64 = async (
		url: string,
	): Promise<string | ArrayBuffer | null> => {
		const data = await fetch(url);
		const blob = await data.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				const base64data = reader.result;
				resolve(base64data);
			};
			reader.onerror = reject;
		});
	};

	const copyImage = async (item: IMiroBoardItem): Promise<void> => {
		const { id, position, data, geometry } = item;
		if (data && data.imageUrl) {
			const { x, y } = position;
			const { height, width } = geometry;

			const imgUrl = await getImage(data.imageUrl);
			const imgBase64 = await imageUrlToBase64(imgUrl?.url ?? "").then(
				base64Data => base64Data,
			);
			const img = new ImageItem(imgBase64, undefined, id);

			img.transformation.translateTo(x, y);
			const imgScaleFactor = SCALE_FACTOR + 50;
			img.transformation.scaleTo(
				width / imgScaleFactor,
				height / imgScaleFactor,
			);

			board.add(img);
		}
	};

	const getMiroItemById = (id: string): IMiroBoardItem | undefined =>
		miroItems.find((item: IMiroBoardItem) => item.id === id) || undefined;

	const getConnectorPoint = (
		start: number,
		end: number,
		percent: string,
	): number => {
		const percentInt = +percent.replace("%", "");
		return start + (end * percentInt) / SCALE_FACTOR;
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

	const copyConnector = async (item: IMiroBoardItem): Promise<void> => {
		const { startItem, endItem, style, shape } = item;
		if (startItem && endItem && shape) {
			const startItemMiro = getMiroItemById(startItem.id);
			const endItemMiro = getMiroItemById(endItem.id);

			if (startItemMiro && endItemMiro) {
				const startX = getConnectorPoint(
					startItemMiro.position.x,
					startItemMiro.geometry.width,
					startItem.position.x,
				);
				const startY = getConnectorPoint(
					startItemMiro.position.y,
					startItemMiro.geometry.height,
					startItem.position.y,
				);

				const endX = getConnectorPoint(
					endItemMiro.position.x,
					startItemMiro.geometry.width,
					endItem.position.x,
				);
				const endY = getConnectorPoint(
					endItemMiro.position.y,
					startItemMiro.geometry.height,
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
					ConnectionLineWidths.find(
						width => width === +miroStrokeWidth,
					);
				connector.setLineWidth(
					strokeWidth ? strokeWidth : CONNECTOR_LINE_WIDTH,
				);

				setConnectorsStyles(connector, startStrokeCap, endStrokeCap);

				board.add(connector);
			}
		}
	};

	const copyText = (item: IMiroBoardItem): void => {
		const { style, position, data, geometry } = item;
		if (data && data.content) {
			const { fontSize, fontFamily } = style;
			const { x, y } = position;
			const { width } = geometry;

			const richtext = new RichText(new Mbr());
			richtext.transformation.translateTo(x, y);
			richtext.transformation.scaleTo(
				width / SCALE_FACTOR,
				width / SCALE_FACTOR,
			);

			richtext.setSelectionFontFamily(fontFamily);
			richtext.setSelectionFontSize(+fontSize);

			richtext.editor.editor.children = [
				{
					type: "paragraph",
					children: [
						{
							type: "text",
							text: data.content.replace(/<[^>]*>/g, ""),
						},
					],
				},
			];

			board.add(richtext);
		}
	};

	const copyBoardItems = (): void => {
		const itemsTypes = {
			shape: copyShape,
			sticky_note: copySticker,
			image: copyImage,
			text: copyText,
			connector: copyConnector,
		};

		miroItems.forEach(async item => {
			itemsTypes[item.type](item);
		});
	};

	copyBoardItems();
}
