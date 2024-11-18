// import type { ShapeData } from "Board/Items";
// import { ConnectorLineStyle } from "Board/Items/Connector";
// import { ConnectorEdge } from "Board/Items/Connector/Pointers";
// import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
// import type { TextStyle } from "Board/Items/RichText";
// import type { StickerData } from "Board/Items/Sticker/StickerOperation";
//
// export class SessionStorage {
// 	private set<T>(key: string, value: T, boardId: string) {
// 		const savedData = sessionStorage.getItem(key);
//
// 		sessionStorage.setItem(
// 			key,
// 			JSON.stringify(
// 				savedData
// 					? { ...JSON.parse(savedData), [boardId]: value }
// 					: { [boardId]: value },
// 			),
// 		);
//
// 		localStorage.setItem(key, JSON.stringify({ [boardId]: value }));
// 	}
//
// 	private get<T>(key: string, boardId: string) {
// 		let savedData = sessionStorage.getItem(key);
// 		if (!savedData || !savedData.includes(boardId)) {
// 			savedData = localStorage.getItem(key);
// 		}
// 		if (!savedData || !savedData.includes(boardId)) {
// 			return null;
// 		}
// 		return JSON.parse(savedData)[boardId] as T;
// 	}
//
// 	remove(key: string) {
// 		sessionStorage.removeItem(key);
// 	}
//
// 	setConnectorPointer(
// 		type: ConnectorPointerStyle,
// 		edge: ConnectorEdge,
// 		boardId: string,
// 	): void {
// 		this.set(
// 			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
// 			type,
// 			boardId,
// 		);
// 	}
//
// 	getConnectorPointer(
// 		edge: ConnectorEdge,
// 		boardId: string,
// 	): ConnectorPointerStyle | null {
// 		return this.get<ConnectorPointerStyle>(
// 			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
// 			boardId,
// 		);
// 	}
//
// 	setConnectorLineStyle(type: ConnectorLineStyle, boardId: string): void {
// 		this.set("connectorLineStyle", type, boardId);
// 	}
//
// 	getConnectorLineStyle(boardId: string): ConnectorLineStyle | null {
// 		return this.get("connectorLineStyle", boardId);
// 	}
//
// 	setShapeData(data: Partial<ShapeData>, boardId: string) {
// 		this.set("lastShapeData", data, boardId);
// 	}
//
// 	getShapeData(boardId: string) {
// 		return this.get<ShapeData>("lastShapeData", boardId);
// 	}
//
// 	setStickerData(data: Partial<StickerData>, boardId: string) {
// 		this.set("lastSticker", data, boardId);
// 	}
//
// 	getStickerData(boardId: string) {
// 		return this.get<StickerData>("lastSticker", boardId);
// 	}
//
// 	setShapeWidth(width: number, boardId: string) {
// 		this.set("shapeWidth", width, boardId);
// 	}
//
// 	getShapeWidth(boardId: string) {
// 		return this.get<number>("shapeWidth", boardId);
// 	}
//
// 	setShapeHeight(height: number, boardId: string) {
// 		this.set("shapeHeight", height, boardId);
// 	}
//
// 	getShapeHeight(boardId: string) {
// 		return this.get<number>("shapeHeight", boardId);
// 	}
//
// 	setFontSize(itemType: string, size: number | "auto", boardId: string) {
// 		this.set(`fontSize_${itemType}`, size, boardId);
// 	}
//
// 	getFontSize(itemType: string, boardId: string) {
// 		return this.get<number | "auto">(`fontSize_${itemType}`, boardId);
// 	}
//
// 	setFontStyles(itemType: string, styles: TextStyle[], boardId: string) {
// 		this.set(`fontStyles_${itemType}`, styles, boardId);
// 	}
//
// 	getFontStyles(itemType: string, boardId: string) {
// 		return this.get<TextStyle[]>(`fontStyles_${itemType}`, boardId);
// 	}
//
// 	setFontColor(itemType: string, color: string, boardId: string) {
// 		this.set(`fontColor_${itemType}`, color, boardId);
// 	}
//
// 	getFontColor(itemType: string, boardId: string) {
// 		return this.get<string>(`fontColor_${itemType}`, boardId);
// 	}
//
// 	setFontHighlight(
// 		itemType: string,
// 		highlightColor: string,
// 		boardId: string,
// 	) {
// 		this.set(`fontHighlightColor_${itemType}`, highlightColor, boardId);
// 	}
//
// 	getFontHighlight(itemType: string, boardId: string) {
// 		return this.get<string>(`fontHighlightColor_${itemType}`, boardId);
// 	}
//
// 	setHorizontalAlignment(
// 		itemType: string,
// 		horizontalAlignment: "left" | "center" | "right",
// 		boardId: string,
// 	) {
// 		this.set(
// 			`fontHorizontalAlignment_${itemType}`,
// 			horizontalAlignment,
// 			boardId,
// 		);
// 	}
//
// 	getHorizontalAlignment(itemType: string, boardId: string) {
// 		return this.get<"left" | "center" | "right">(
// 			`fontHorizontalAlignment_${itemType}`,
// 			boardId,
// 		);
// 	}
//
// 	setVerticalAlignment(
// 		itemType: string,
// 		verticalAlignment: "top" | "center" | "bottom",
// 		boardId: string,
// 	) {
// 		this.set(
// 			`fontVerticalAlignment_${itemType}`,
// 			verticalAlignment,
// 			boardId,
// 		);
// 	}
//
// 	getVerticalAlignment(itemType: string, boardId: string) {
// 		return this.get<"top" | "center" | "bottom">(
// 			`fontVerticalAlignment_${itemType}`,
// 			boardId,
// 		);
// 	}
//
// 	clear() {
// 		sessionStorage.clear();
// 	}
// }
//
// export const tempStorage = new SessionStorage();

import type { ShapeData } from "Board/Items";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { ConnectorEdge } from "Board/Items/Connector/Pointers";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import type { TextStyle } from "Board/Items/RichText";
import type { StickerData } from "Board/Items/Sticker/StickerOperation";

export class SessionStorage {
	private set<T>(key: string, value: T) {
		const boardId = window.app.getBoard().getBoardId();
		sessionStorage.setItem(boardId + "_" + key, JSON.stringify(value));
	}

	private get<T>(key: string) {
		const boardId = window.app.getBoard().getBoardId();
		const item = sessionStorage.getItem(boardId + "_" + key);

		if (!item) {
			return;
		}

		return JSON.parse(item) as T;
	}

	remove(key: string) {
		const boardId = window.app.getBoard().getBoardId();
		sessionStorage.removeItem(boardId + "_" + key);
	}

	setConnectorPointer(
		type: ConnectorPointerStyle,
		edge: ConnectorEdge,
	): void {
		this.set(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
			type,
		);
	}

	getConnectorPointer(
		edge: ConnectorEdge,
	): ConnectorPointerStyle | undefined {
		return this.get<ConnectorPointerStyle>(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
		);
	}

	setConnectorLineStyle(type: ConnectorLineStyle): void {
		this.set("connectorLineStyle", type);
	}

	getConnectorLineStyle(): ConnectorLineStyle | undefined {
		return this.get("connectorLineStyle");
	}

	setShapeData(data: Partial<ShapeData>) {
		this.set("lastShapeData", data);
	}

	getShapeData() {
		return this.get<ShapeData>("lastShapeData");
	}

	setStickerData(data: Partial<StickerData>) {
		this.set("lastSticker", data);
	}

	getStickerData() {
		return this.get<StickerData>("lastSticker");
	}

	setShapeWidth(width: number) {
		this.set("shapeWidth", width);
	}

	getShapeWidth() {
		return this.get<number>("shapeWidth");
	}

	setShapeHeight(height: number) {
		this.set("shapeHeight", height);
	}

	getShapeHeight() {
		return this.get<number>("shapeHeight");
	}

	setFontSize(itemType: string, size: number | "auto") {
		this.set(`fontSize_${itemType}`, size);
	}

	getFontSize(itemType: string) {
		return this.get<number | "auto">(`fontSize_${itemType}`);
	}

	setFontStyles(itemType: string, styles: TextStyle[]) {
		this.set(`fontStyles_${itemType}`, styles);
	}

	getFontStyles(itemType: string) {
		return this.get<TextStyle[]>(`fontStyles_${itemType}`);
	}

	setFontColor(itemType: string, color: string) {
		this.set(`fontColor_${itemType}`, color);
	}

	getFontColor(itemType: string) {
		return this.get<string>(`fontColor_${itemType}`);
	}

	setFontHighlight(itemType: string, highlightColor: string) {
		this.set(`fontHighlightColor_${itemType}`, highlightColor);
	}

	getFontHighlight(itemType: string) {
		return this.get<string>(`fontHighlightColor_${itemType}`);
	}

	setHorizontalAlignment(
		itemType: string,
		horizontalAlignment: "left" | "center" | "right",
	) {
		this.set(`fontHorizontalAlignment_${itemType}`, horizontalAlignment);
	}

	getHorizontalAlignment(itemType: string) {
		return this.get<"left" | "center" | "right">(
			`fontHorizontalAlignment_${itemType}`,
		);
	}

	setVerticalAlignment(
		itemType: string,
		verticalAlignment: "top" | "center" | "bottom",
	) {
		this.set(`fontVerticalAlignment_${itemType}`, verticalAlignment);
	}

	getVerticalAlignment(itemType: string) {
		return this.get<"top" | "center" | "bottom">(
			`fontVerticalAlignment_${itemType}`,
		);
	}

	clear() {
		sessionStorage.clear();
	}
}

export const tempStorage = new SessionStorage();
