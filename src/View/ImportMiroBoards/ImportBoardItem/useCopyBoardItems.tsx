import { Board } from "Board";
import { IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { Connector, Mbr, RichText, Shape } from "Board/Items";
import { ShapeType } from "Board/Items/Shape/Basic";
import { BorderStyle } from "Board/Items/Path";
import { Sticker, stickerColors } from "Board/Items/Sticker";
import { ImageItem } from "Board/Items/Image";
import Cookies from "js-cookie";
import { BoardPoint } from "Board/Items/Connector";
import {
	ConnectorLineStyle,
	ConnectionLineWidth,
} from "Board/Items/Connector/Connector";

interface MiroImage {
	type: string;
	url: string;
}

export function useCopyBoardItems(
	board: Board,
	miroItems: IMiroBoardItem[],
): void {
	const setItemText = (
		item: Shape | Sticker,
		text: string,
		fontSize: string,
		fontFamily: string,
	) => {
		const textWithoutTag = text.replace(/<[^>]*>/g, "");
		item.text.addText(textWithoutTag);
		item.text.setSelectionFontSize(+fontSize);
		item.text.setSelectionFontFamily(fontFamily);
	};

	const getShapeType = (miroShapeType: string): ShapeType => {
		switch (miroShapeType) {
			case "round_rectangle":
				return "RoundedRectangle";
			case "circle":
				return "Circle";
			case "triangle":
				return "Triangle";
			case "rhombus":
				return "Rhombus";
			case "wedge_round_rectangle_callout":
				return "SpeachBubble";
			case "parallelogram":
				return "Parallelogram";
			case "star":
				return "Star";
			case "right_arrow":
				return "ArrowRight";
		}
		return "Rectangle";
	};

	const getBorderStyle = (
		borderStyle: string,
	): Omit<BorderStyle, "solid" | "dot" | "dash"> => {
		switch (borderStyle) {
			case "normal":
				return "solid";
			case "dotted":
				return "dot";
			case "dashed":
				return "dash";
		}
		return "solid";
	};

	const getStickerColor = (color: string): string => {
		switch (color) {
			case "dark_blue":
			case "blue":
			case "light_blue":
				return stickerColors["Sky Blue"];
			case "red":
			case "orange":
				return stickerColors["Pastel Red"];
			case "violet":
			case "pink":
			case "light_pink":
				return stickerColors["Lavender"];
			case "cyan":
				return stickerColors["Aqua Cyan"];
			case "dark_green":
			case "green":
			case "light_green":
				return stickerColors["Sage Green"];
			case "yellow":
			case "light_yellow":
				return stickerColors["Pale Yellow"];
			case "gray":
				return stickerColors["Light Gray"];
		}
		return stickerColors["Sky Blue"];
	};

	const copyShape = (item: IMiroBoardItem) => {
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
			const shapeType = getShapeType(miroShapeType);
			if (borderOpacity && borderWidth && borderColor && borderStyle) {
				const newBorderStyle = getBorderStyle(borderStyle);
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
				newShape.transformation.scaleTo(width / 100, height / 100);

				content && setItemText(newShape, content, fontSize, fontFamily);

				board.add(newShape);
			}
		}
	};

	const copySticker = (item: IMiroBoardItem) => {
		const { id, style, position, data, geometry } = item;
		const { x, y } = position;
		const { height, width } = geometry;
		const { fillColor, fontSize, fontFamily } = style;
		if (data && fillColor) {
			const color = getStickerColor(fillColor);
			const sticker = new Sticker(undefined, id, color);

			sticker.transformation.translateTo(x, y);
			sticker.transformation.scaleTo(width / 200, height / 200);

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

	const copyImage = async (item: IMiroBoardItem) => {
		const { id, position, data, geometry } = item;
		if (data && data.imageUrl) {
			const { x, y } = position;
			const { height, width } = geometry;

			const imgUrl = await getImage(data.imageUrl);
			const img = new ImageItem(imgUrl?.url ?? "", undefined, id);

			img.transformation.translateTo(x, y);
			img.transformation.scaleTo(width / 150, height / 150);

			board.add(img);
		}
	};

	const getMiroItemById = (id: string) =>
		miroItems.find((item: IMiroBoardItem) => item.id === id) || undefined;

	const getConnectorPoint = (start: number, end: number, percent: string) => {
		const percentInt = +percent.replace("%", "");
		return start + (end * percentInt) / 100;
	};

	const copyConnector = async (item: IMiroBoardItem) => {
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

				const { strokeColor, strokeWidth } = style;
				strokeColor && connector.setLineColor(strokeColor);
				strokeColor && connector.setLineColor(strokeColor);
				connector.setLineStyle(shape as ConnectorLineStyle);
				strokeWidth &&
					connector.setLineWidth(+strokeWidth as ConnectionLineWidth);

				board.add(connector);
			}
		}
	};

	const copyText = (item: IMiroBoardItem) => {
		const { style, position, data, geometry } = item;
		if (data && data.content) {
			const { fontSize, fontFamily } = style;
			const { x, y } = position;
			const { width } = geometry;

			const richtext = new RichText(new Mbr());
			richtext.transformation.translateTo(x, y);
			richtext.transformation.scaleTo(width / 250, width / 250);

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

	const copyBoardItems = () => {
		miroItems.forEach(async item => {
			if (item.type === "shape") {
				copyShape(item);
			} else if (item.type === "sticky_note") {
				copySticker(item);
			} else if (item.type === "image") {
				await copyImage(item);
			} else if (item.type === "text") {
				copyText(item);
			} else if (item.type === "connector") {
				copyConnector(item);
			}
		});
	};

	copyBoardItems();
}
