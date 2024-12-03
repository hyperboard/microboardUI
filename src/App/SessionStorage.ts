import type { ShapeData } from "Board/Items";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { ConnectorEdge } from "Board/Items/Connector/Pointers";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import type { TextStyle } from "Board/Items/RichText";
import type { StickerData } from "Board/Items/Sticker/StickerOperation";

export class SessionStorage {
	private set<T>(key: string, value: T): void {
		const boardId = this.getBoardId() || "";
		sessionStorage.setItem(boardId + "_" + key, JSON.stringify(value));
	}

	private get<T>(key: string): T | undefined {
		const boardId = this.getBoardId() || "";
		const item = sessionStorage.getItem(boardId + "_" + key);

		if (!item) {
			return;
		}

		return JSON.parse(item) as T;
	}

	remove(key: string): void {
		const boardId = this.getBoardId() || "";
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
		return this.get<ConnectorLineStyle>("connectorLineStyle");
	}

	setShapeData(data: Partial<ShapeData>): void {
		this.set("lastShapeData", data);
	}

	getShapeData(): ShapeData | undefined {
		return this.get<ShapeData>("lastShapeData");
	}

	setStickerData(data: Partial<StickerData>): void {
		this.set("lastSticker", data);
	}

	getStickerData(): StickerData | undefined {
		return this.get<StickerData>("lastSticker");
	}

	setShapeWidth(width: number): void {
		this.set("shapeWidth", width);
	}

	getShapeWidth(): number | undefined {
		return this.get<number>("shapeWidth");
	}

	setShapeHeight(height: number): void {
		this.set("shapeHeight", height);
	}

	getShapeHeight(): number | undefined {
		return this.get<number>("shapeHeight");
	}

	setFontSize(itemType: string, size: number | "auto"): void {
		this.set(`fontSize_${itemType}`, size);
	}

	getFontSize(itemType: string): number | "auto" | undefined {
		return this.get<number | "auto">(`fontSize_${itemType}`);
	}

	setFontStyles(itemType: string, styles: TextStyle[]): void {
		this.set(`fontStyles_${itemType}`, styles);
	}

	getFontStyles(itemType: string): TextStyle[] | undefined {
		return this.get<TextStyle[]>(`fontStyles_${itemType}`);
	}

	setFontColor(itemType: string, color: string): void {
		this.set(`fontColor_${itemType}`, color);
	}

	getFontColor(itemType: string): string | undefined {
		return this.get<string>(`fontColor_${itemType}`);
	}

	setFontHighlight(itemType: string, highlightColor: string): void {
		this.set(`fontHighlightColor_${itemType}`, highlightColor);
	}

	getFontHighlight(itemType: string): string | undefined {
		return this.get<string>(`fontHighlightColor_${itemType}`);
	}

	setHorizontalAlignment(
		itemType: string,
		horizontalAlignment: "left" | "center" | "right",
	): void {
		this.set(`fontHorizontalAlignment_${itemType}`, horizontalAlignment);
	}

	getHorizontalAlignment(
		itemType: string,
	): "left" | "center" | "right" | undefined {
		return this.get<"left" | "center" | "right">(
			`fontHorizontalAlignment_${itemType}`,
		);
	}

	setVerticalAlignment(
		itemType: string,
		verticalAlignment: "top" | "center" | "bottom",
	): void {
		this.set(`fontVerticalAlignment_${itemType}`, verticalAlignment);
	}

	getVerticalAlignment(
		itemType: string,
	): "top" | "center" | "bottom" | undefined {
		return this.get<"top" | "center" | "bottom">(
			`fontVerticalAlignment_${itemType}`,
		);
	}

	clear(): void {
		sessionStorage.clear();
	}

	private getBoardId(): string | undefined {
		return window.location.href.split("/").pop()?.split("?")[0];
	}
}

export const tempStorage = new SessionStorage();
