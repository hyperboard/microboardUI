import type { ShapeData } from "Board/Items";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { ConnectorEdge } from "Board/Items/Connector/Pointers";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import type { TextStyle } from "Board/Items/RichText";
import type { StickerData } from "Board/Items/Sticker/StickerOperation";

export class SessionStorage {
	private set<T>(key: string, value: T, boardId: string) {
		const savedData = sessionStorage.getItem(key);

		sessionStorage.setItem(
			key,
			JSON.stringify(
				savedData
					? { ...JSON.parse(savedData), [boardId]: value }
					: { [boardId]: value },
			),
		);

		localStorage.setItem(key, JSON.stringify({ [boardId]: value }));
	}

	private get<T>(key: string, boardId: string) {
		let savedData = sessionStorage.getItem(key);
		if (!savedData || !savedData.includes(boardId)) {
			savedData = localStorage.getItem(key);
		}
		if (!savedData || !savedData.includes(boardId)) {
			return null;
		}
		return JSON.parse(savedData)[boardId] as T;
	}

	setConnectorPointer(
		type: ConnectorPointerStyle,
		edge: ConnectorEdge,
		boardId: string,
	): void {
		this.set(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
			type,
			boardId,
		);
	}

	getConnectorPointer(
		edge: ConnectorEdge,
		boardId: string,
	): ConnectorPointerStyle | null {
		return this.get<ConnectorPointerStyle>(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
			boardId,
		);
	}

	setConnectorLineStyle(type: ConnectorLineStyle, boardId: string): void {
		this.set("connectorLineStyle", type, boardId);
	}

	getConnectorLineStyle(boardId: string): ConnectorLineStyle | null {
		return this.get("connectorLineStyle", boardId);
	}

	setShapeData(data: Partial<ShapeData>, boardId: string) {
		this.set("lastShapeData", data, boardId);
	}

	getShapeData(boardId: string) {
		return this.get<ShapeData>("lastShapeData", boardId);
	}

	setStickerData(data: Partial<StickerData>, boardId: string) {
		this.set("lastSticker", data, boardId);
	}

	getStickerData(boardId: string) {
		return this.get<StickerData>("lastSticker", boardId);
	}

	setShapeWidth(width: number, boardId: string) {
		this.set("shapeWidth", width, boardId);
	}

	getShapeWidth(boardId: string) {
		return this.get<number>("shapeWidth", boardId);
	}

	setShapeHeight(height: number, boardId: string) {
		this.set("shapeHeight", height, boardId);
	}

	getShapeHeight(boardId: string) {
		return this.get<number>("shapeHeight", boardId);
	}

	setFontSize(itemType: string, size: number | "auto", boardId: string) {
		this.set(`fontSize_${itemType}`, size, boardId);
	}

	getFontSize(itemType: string, boardId: string) {
		return this.get<number | "auto">(`fontSize_${itemType}`, boardId);
	}

	setFontStyles(itemType: string, styles: TextStyle[], boardId: string) {
		this.set(`fontStyles_${itemType}`, styles, boardId);
	}

	getFontStyles(itemType: string, boardId: string) {
		return this.get<TextStyle[]>(`fontStyles_${itemType}`, boardId);
	}

	setFontColor(itemType: string, color: string, boardId: string) {
		this.set(`fontColor_${itemType}`, color, boardId);
	}

	getFontColor(itemType: string, boardId: string) {
		return this.get<string>(`fontColor_${itemType}`, boardId);
	}

	setFontHighlight(
		itemType: string,
		highlightColor: string,
		boardId: string,
	) {
		this.set(`fontHighlightColor_${itemType}`, highlightColor, boardId);
	}

	getFontHighlight(itemType: string, boardId: string) {
		return this.get<string>(`fontHighlightColor_${itemType}`, boardId);
	}

	setHorizontalAlignment(
		itemType: string,
		horizontalAlignment: "left" | "center" | "right",
		boardId: string,
	) {
		this.set(
			`fontHorizontalAlignment_${itemType}`,
			horizontalAlignment,
			boardId,
		);
	}

	getHorizontalAlignment(itemType: string, boardId: string) {
		return this.get<"left" | "center" | "right">(
			`fontHorizontalAlignment_${itemType}`,
			boardId,
		);
	}

	setVerticalAlignment(
		itemType: string,
		verticalAlignment: "top" | "center" | "bottom",
		boardId: string,
	) {
		this.set(
			`fontVerticalAlignment_${itemType}`,
			verticalAlignment,
			boardId,
		);
	}

	getVerticalAlignment(itemType: string, boardId: string) {
		return this.get<"top" | "center" | "bottom">(
			`fontVerticalAlignment_${itemType}`,
			boardId,
		);
	}

	clear() {
		sessionStorage.clear();
	}

	// saveStickerData(sticker: Sticker | undefined, boardId: string) {
	// 	if (!sticker) {
	// 		return;
	// 	}
	//
	// 	const stickersData = sessionStorage.getItem("lastSticker");
	//
	// 	const stickerData = {
	// 		backgroundColor: sticker.getBackgroundColor(),
	// 		id: sticker.getId(),
	// 		itemType: sticker.itemType,
	// 		parent: sticker.parent,
	// 		stickerPath: sticker.getPaths(),
	// 	};
	//
	// 	sessionStorage.setItem(
	// 		"lastSticker",
	// 		JSON.stringify(
	// 			stickersData
	// 				? { ...JSON.parse(stickersData), [boardId]: stickerData }
	// 				: { [boardId]: stickerData },
	// 		),
	// 	);
	//
	// 	localStorage.setItem(
	// 		"lastSticker",
	// 		JSON.stringify({ [boardId]: stickerData }),
	// 	);
	// }

	// getLastSticker(boardId: string): Sticker | null {
	// 	let lastSticker = sessionStorage.getItem("lastSticker");
	// 	if (!lastSticker || !lastSticker.includes(boardId)) {
	// 		lastSticker = localStorage.getItem("lastSticker");
	// 	}
	// 	if (lastSticker && lastSticker.includes(boardId)) {
	// 		return new Sticker().deserialize(JSON.parse(lastSticker)[boardId]);
	// 	} else {
	// 		return null;
	// 	}
	// }

	// saveShapeData(shape: Shape | undefined, boardId: string): void {
	// 	if (!shape) {
	// 		return;
	// 	}
	//
	// 	const shapesData = sessionStorage.getItem("lastShapeData");
	//
	// 	const shapeData = {
	// 		shapeType: shape.getShapeType(),
	// 		backgroundColor: shape.getBackgroundColor(),
	// 		backgroundOpacity: shape.getBackgroundOpacity(),
	// 		borderColor: shape.getBorderColor(),
	// 		borderOpacity: shape.getBorderOpacity(),
	// 		borderStyle: shape.getBorderStyle(),
	// 		borderWidth: shape.getBorderWidth(),
	// 	};
	//
	// 	sessionStorage.setItem(
	// 		"lastShapeData",
	// 		JSON.stringify(
	// 			shapesData
	// 				? { ...JSON.parse(shapesData), [boardId]: shapeData }
	// 				: { [boardId]: shapeData },
	// 		),
	// 	);
	//
	// 	localStorage.setItem(
	// 		"lastShapeData",
	// 		JSON.stringify({ [boardId]: shapeData }),
	// 	);
	// }

	// getShapeData(boardId: string): DefaultShapeData | null {
	// 	let savedShapeData = sessionStorage.getItem("lastShapeData");
	//
	// 	if (!savedShapeData || !savedShapeData.includes(boardId)) {
	// 		savedShapeData = localStorage.getItem("lastShapeData");
	// 	}
	//
	// 	if (savedShapeData && savedShapeData.includes(boardId)) {
	// 		return JSON.parse(savedShapeData)[boardId] as DefaultShapeData;
	// 	}
	//
	// 	return null;
	// }

	// saveShapeWidth(width: number, boardId: string): void {
	// 	const savedWidths = sessionStorage.getItem("shapeWidth");
	//
	// 	sessionStorage.setItem(
	// 		"shapeWidth",
	// 		JSON.stringify(
	// 			savedWidths
	// 				? { ...JSON.parse(savedWidths), [boardId]: width }
	// 				: { [boardId]: width },
	// 		),
	// 	);
	//
	// 	localStorage.setItem(
	// 		"shapeWidth",
	// 		JSON.stringify({ [boardId]: width }),
	// 	);
	// }

	// saveShapeHeight(height: number, boardId: string): void {
	// 	const savedHeights = sessionStorage.getItem("shapeHeight");
	//
	// 	sessionStorage.setItem(
	// 		"shapeHeight",
	// 		JSON.stringify(
	// 			savedHeights
	// 				? { ...JSON.parse(savedHeights), [boardId]: height }
	// 				: { [boardId]: height },
	// 		),
	// 	);
	//
	// 	localStorage.setItem(
	// 		"shapeHeight",
	// 		JSON.stringify({ [boardId]: height }),
	// 	);
	// }

	// getShapeWidth(boardId: string): null | number {
	// 	let savedWidth = sessionStorage.getItem("shapeWidth");
	// 	if (!savedWidth || !savedWidth.includes(boardId)) {
	// 		savedWidth = localStorage.getItem("shapeWidth");
	// 	}
	// 	if (!savedWidth || !savedWidth.includes(boardId)) {
	// 		return null;
	// 	}
	// 	return JSON.parse(savedWidth)[boardId];
	// }

	// getShapeHeight(boardId: string): null | number {
	// 	let savedHeight = sessionStorage.getItem("shapeHeight");
	// 	if (!savedHeight || !savedHeight.includes(boardId)) {
	// 		savedHeight = localStorage.getItem("shapeHeight");
	// 	}
	// 	if (!savedHeight || !savedHeight.includes(boardId)) {
	// 		return null;
	// 	}
	// 	return JSON.parse(savedHeight)[boardId];
	// }
}

export const tempStorage = new SessionStorage();
