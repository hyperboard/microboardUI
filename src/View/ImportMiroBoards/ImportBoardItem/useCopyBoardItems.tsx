import { Board } from "Board";
import { IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { Shape } from "Board/Items";
import { ShapeType } from "Board/Items/Shape/Basic";

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

	const copyShape = (item: IMiroBoardItem) => {
		const { id, style, position, data, geometry } = item;
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
				const newShape = new Shape(
					undefined,
					"",
					shapeType,
					fillColor,
					+fillOpacity,
					borderColor,
					+borderOpacity,
					"solid",
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
