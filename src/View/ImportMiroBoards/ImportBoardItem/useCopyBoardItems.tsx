import { Board } from "Board";
import { IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { Shape } from "Board/Items";
import { ShapeType } from "Board/Items/Shape/Basic";
import { BorderStyle } from "Board/Items/Path";

export function useCopyBoardItems(board: Board, miroItems: IMiroBoardItem[]) {
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

	const copyShape = (item: IMiroBoardItem) => {
		const { style, position, data, geometry } = item;
		if (style && data) {
			const {
				fillColor,
				fillOpacity,
				borderColor,
				borderOpacity,
				borderStyle,
				borderWidth,
			} = style;
			const { x, y } = position;
			const { height, width } = geometry;
			const miroShapeType = data.shape ?? "";
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

	const copyBoardItems = () => {
		miroItems.forEach(item => {
			if (item.type === "shape") {
				copyShape(item);
			}
		});
	};

	copyBoardItems();
}
