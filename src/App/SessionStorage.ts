import { ConnectorLineStyle } from "Board/Items/Connector";
import { ConnectorEdge } from "Board/Items/Connector/Pointers";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import { Sticker } from "../Board/Items/Sticker";
import { Shape } from "../Board/Items";
import { DefaultShapeData } from "../Board/Items/Shape";

export class SessionStorage {
	setConnectorPointer(
		type: ConnectorPointerStyle,
		edge: ConnectorEdge,
	): void {
		sessionStorage.setItem(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
			type,
		);
	}

	getConnectorPointer(
		edge: ConnectorEdge,
	): ConnectorPointerStyle | undefined {
		const saved = sessionStorage.getItem(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
		);
		return (saved as ConnectorPointerStyle) || undefined;
	}

	setConnectorLineStyle(type: ConnectorLineStyle): void {
		sessionStorage.setItem("connectorLineStyle", type);
	}

	getConnectorLineStyle(): ConnectorLineStyle | undefined {
		const saved = sessionStorage.getItem("connectorLineStyle");
		if (saved) {
			return saved as ConnectorLineStyle;
		}

		return undefined;
	}

	saveStickerData(sticker: Sticker | undefined, boardId: string) {
		if (!sticker) {
			return;
		}

		const stickersData = sessionStorage.getItem("lastSticker");

		const stickerData = {
			backgroundColor: sticker.getBackgroundColor(),
			id: sticker.getId(),
			itemType: sticker.itemType,
			parent: sticker.parent,
			stickerPath: sticker.getPaths(),
		};

		sessionStorage.setItem(
			"lastSticker",
			JSON.stringify(
				stickersData
					? { ...JSON.parse(stickersData), [boardId]: stickerData }
					: { [boardId]: stickerData },
			),
		);

		localStorage.setItem(
			"lastSticker",
			JSON.stringify({ [boardId]: stickerData }),
		);
	}

	getLastSticker(boardId: string): Sticker | null {
		let lastSticker = sessionStorage.getItem("lastSticker");
		if (!lastSticker || !lastSticker.includes(boardId)) {
			lastSticker = localStorage.getItem("lastSticker");
		}
		if (lastSticker && lastSticker.includes(boardId)) {
			return new Sticker().deserialize(JSON.parse(lastSticker)[boardId]);
		} else {
			return null;
		}
	}

	saveShapeData(shape: Shape | undefined, boardId: string): void {
		if (!shape) {
			return;
		}

		const shapesData = sessionStorage.getItem("lastShapeData");

		const shapeData = {
			shapeType: shape.getShapeType(),
			backgroundColor: shape.getBackgroundColor(),
			backgroundOpacity: shape.getBackgroundOpacity(),
			borderColor: shape.getBorderColor(),
			borderOpacity: shape.getBorderOpacity(),
			borderStyle: shape.getBorderStyle(),
			borderWidth: shape.getBorderWidth(),
		};

		sessionStorage.setItem(
			"lastShapeData",
			JSON.stringify(
				shapesData
					? { ...JSON.parse(shapesData), [boardId]: shapeData }
					: { [boardId]: shapeData },
			),
		);

		localStorage.setItem(
			"lastShapeData",
			JSON.stringify({ [boardId]: shapeData }),
		);
	}

	getShapeData(boardId: string): DefaultShapeData | null {
		let savedShapeData = sessionStorage.getItem("lastShapeData");

		if (!savedShapeData || !savedShapeData.includes(boardId)) {
			savedShapeData = localStorage.getItem("lastShapeData");
		}

		if (savedShapeData && savedShapeData.includes(boardId)) {
			return JSON.parse(savedShapeData)[boardId] as DefaultShapeData;
		}

		return null;
	}

	saveShapeWidth(width: number, boardId: string): void {
		const savedWidths = sessionStorage.getItem("shapeWidth");

		sessionStorage.setItem(
			"shapeWidth",
			JSON.stringify(
				savedWidths
					? { ...JSON.parse(savedWidths), [boardId]: width }
					: { [boardId]: width },
			),
		);

		localStorage.setItem(
			"shapeWidth",
			JSON.stringify({ [boardId]: width }),
		);
	}

	saveShapeHeight(height: number, boardId: string): void {
		const savedHeights = sessionStorage.getItem("shapeHeight");

		sessionStorage.setItem(
			"shapeHeight",
			JSON.stringify(
				savedHeights
					? { ...JSON.parse(savedHeights), [boardId]: height }
					: { [boardId]: height },
			),
		);

		localStorage.setItem(
			"shapeHeight",
			JSON.stringify({ [boardId]: height }),
		);
	}

	getShapeWidth(boardId: string): null | number {
		let savedWidth = sessionStorage.getItem("shapeWidth");
		if (!savedWidth || !savedWidth.includes(boardId)) {
			savedWidth = localStorage.getItem("shapeWidth");
		}
		if (!savedWidth || !savedWidth.includes(boardId)) {
			return null;
		}
		return JSON.parse(savedWidth)[boardId];
	}

	getShapeHeight(boardId: string): null | number {
		let savedHeight = sessionStorage.getItem("shapeHeight");
		if (!savedHeight || !savedHeight.includes(boardId)) {
			savedHeight = localStorage.getItem("shapeHeight");
		}
		if (!savedHeight || !savedHeight.includes(boardId)) {
			return null;
		}
		return JSON.parse(savedHeight)[boardId];
	}
}
