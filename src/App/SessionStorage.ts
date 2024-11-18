import type { ShapeData } from "Board/Items";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { ConnectorEdge } from "Board/Items/Connector/Pointers";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import type { TextStyle } from "Board/Items/RichText";
import type { StickerData } from "Board/Items/Sticker/StickerOperation";

export class SessionStorage {
	private set<T>(key: string, value: T) {
		sessionStorage.setItem(key, JSON.stringify(value));
	}

	private get<T>(key: string) {
		const item = sessionStorage.getItem(key);

		if (!item) {
			return;
		}

		return JSON.parse(item) as T;
	}

	remove(key: string) {
		sessionStorage.removeItem(key);
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
