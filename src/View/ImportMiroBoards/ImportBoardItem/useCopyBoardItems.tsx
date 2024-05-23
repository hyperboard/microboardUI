import { Board } from "Board";
import { IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { Shape } from "Board/Items";
import { ShapeType } from "Board/Items/Shape/Basic";
import { BorderStyle } from "Board/Items/Path";
import { Sticker, stickerColors } from "Board/Items/Sticker";
import { ImageItem } from "Board/Items/Image";
import Cookies from "js-cookie";

export function useCopyBoardItems(board: Board, miroItems: IMiroBoardItem[]) {
	// const setText = (content: string, x: number, y: number, style: IMiroBoardItemStyle) => {
	// 	const {fontFamily, fontSize, textAlign, textAlignVertical} = style
	// 	const richtext = new RichText(new Mbr());
	// 	richtext.transformation.translateTo(x, y);
	// 	richtext.setSelectionFontFamily(fontFamily)
	// 	richtext.setSelectionFontSize(+fontSize)
	// 	richtext.setSelectionHorisontalAlignment(textAlign as HorisontalAlignment)
	// 	richtext.editor.editor.children = [
	// 		{
	// 			type: "paragraph",
	// 			children: [
	// 				{
	// 					type: "text",
	// 					text: content,
	// 				},
	// 			],
	// 		},
	// 	];
	// 	const dimensions = richtext.getDimensions();
	// 	if (dimensions.width > board.camera.window.width) {
	// 		richtext.editor.setMaxWidth(board.camera.window.width);
	// 	}
	// 	board.add(richtext);
	// };

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

	const getStikerColor = (color: string): string => {
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
			case "dark_green":
			case "green":
				return stickerColors["Sage Green"];
			case "yellow":
			case "light_yellow":
				return stickerColors["Pale Yellow"];
			case "yellow":
			case "light_yellow":
				return stickerColors["Pale Yellow"];
			case "gray":
			case "light_yellow":
				return stickerColors["Light Gray"];
		}
		return stickerColors["Sky Blue"];
	};

	const copyShape = (item: IMiroBoardItem) => {
		const { style, position, data, geometry } = item;
		const { x, y } = position;
		const { height, width } = geometry;
		if (style && data) {
			const {
				fillColor,
				fillOpacity,
				borderColor,
				borderOpacity,
				borderStyle,
				borderWidth,
			} = style;
			const { shape } = data;
			const miroShapeType = shape ?? "";
			const shapeType = getShapeType(miroShapeType);
			if (borderOpacity && borderWidth && borderColor && borderStyle) {
				const newBorderStyle = getBorderStyle(borderStyle);
				const newShape = new Shape(
					undefined,
					"",
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

				board.add(newShape);
			}
		}
	};

	const copySticker = (item: IMiroBoardItem) => {
		const { style, position, data, geometry } = item;
		const { x, y } = position;
		const { height, width } = geometry;
		if (style && data) {
			const { fillColor } = style;
			if (fillColor) {
				const color = getStikerColor(fillColor);
				const stiker = new Sticker(undefined, "", color);

				stiker.transformation.translateTo(x, y);
				stiker.transformation.scaleTo(width / 200, height / 200);

				board.add(stiker);
			}
		}
	};

	const copyImage = async (item: IMiroBoardItem) => {
		const { position, data, geometry } = item;
		if (data && data.imageUrl) {
			const { x, y } = position;
			const { height, width } = geometry;
			const token = Cookies.get("miro_accessToken");
			const response = await fetch(data.imageUrl, {
				headers: {
					Authorization: "Bearer " + token,
				},
			});
			const dataImg = await response.json();
			const img = new ImageItem(dataImg.url);

			img.transformation.translateTo(x, y);
			img.transformation.scaleTo(width / 100, height / 100);

			board.add(img);
		}
	};

	const copyBoardItems = () => {
		miroItems.forEach(item => {
			if (item.type === "shape") {
				copyShape(item);
			} else if (item.type === "sticky_note") {
				copySticker(item);
			} else if (item.type === "image") {
				copyImage(item);
			}
		});
	};

	copyBoardItems();
}
