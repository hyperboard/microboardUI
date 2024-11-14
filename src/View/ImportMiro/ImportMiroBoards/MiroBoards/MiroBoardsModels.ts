import { Point } from "Board/Items";

export interface IMiroBoards {
	data: IMiroBoard[];
	total: number;
	offset: number;
}

export interface IMiroBoard {
	id: string;
	name: string;
	picture: {
		imageURL: string;
	};
	team: {
		id: string;
		name: string;
		type: string;
	};
}

export enum MiroBoardItemTypes {
	TEXT = "text",
	SHAPE = "shape",
	STICKER = "sticky_note",
	IMAGE = "image",
	CONNECTOR = "connector",
	FRAME = "frame",
	CARD = "card",
	DOCUMENT = "document",
	MINDMAP = "mindmap_node",
	PAINT = "paint",
	UNSUPPORTED = "unsupported",
}

export type MiroItemsTypes =
	| "shape"
	| "sticky_note"
	| "image"
	| "text"
	| "frame"
	| "connector"
	| "paint"
	| "unsupported";

export interface IMiroBoardItemStyle {
	borderColor?: string;
	borderOpacity?: string;
	borderStyle?: string;
	borderWidth?: string;
	color: string;
	fillColor?: string;
	fillOpacity?: string;
	fontFamily?: string;
	fontSize?: string;
	textAlign?: string;
	textAlignVertical?: string;
	strokeColor?: string;
	strokeOpacity?: number;
	strokeStyle?: string;
	strokeWidth?: string;
	startStrokeCap?: string;
	endStrokeCap?: string;
}

export interface IMiroParent {
	id: string;
	links: {
		self: string;
	};
}

interface IMiroBoardItemBase {
	id: string;
	links: {
		self: string;
	};
	createdAt: string;
	createdBy: {
		id: string;
		type: string;
	};
	modifiedAt: string;
	modifiedBy: {
		id: string;
		type: string;
	};
	style: IMiroBoardItemStyle;
	parent?: IMiroParent;
}

export interface IMiroData {
	content: string;
}

export interface IMiroGeometry {
	width: number;
	height: number;
}

export enum MiroRelativeTo {
	frame = "parent_top_left",
	board = "canvas_center",
}

export interface IMiroPosition {
	x: number;
	y: number;
	origin: string;
	relativeTo: MiroRelativeTo;
}

export interface IMiroBoardItemMindmap extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.MINDMAP;
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export interface IMiroBoardItemCard extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.CARD;
	data: {
		title: string;
	};
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export interface IMiroBoardItemDocument extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.DOCUMENT;
	data: {
		title: string;
		documentUrl: string;
	};
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export interface IMiroBoardItemText extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.TEXT;
	data: IMiroData;
	geometry: IMiroGeometry;
	position: IMiroPosition;
	scale: number;
}

export interface IMiroBoardItemShape extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.SHAPE;
	data: IMiroData & { shape: string };
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export interface IMiroBoardItemSticker extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.STICKER;
	data: IMiroData & { shape: string };
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export interface IMiroBoardItemImage extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.IMAGE;
	data: {
		imageUrl: string;
		scale: number;
	};
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export interface IMiroBoardItemFrame extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.FRAME;
	data: {
		format: string;
		showContent: boolean;
		title: string;
		type: string;
	};
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export interface IMiroBoardItemPaint extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.PAINT;
	data: {
		points: Point[];
		scale: number;
	};
	geometry: IMiroGeometry;
	position: IMiroPosition;
	relativeScale: number;
}

interface IMiroBoardConnectionsPoints {
	links: {
		self: string;
	};
	id: string;
	position?: {
		x: string;
		y: string;
	};
}

interface IMiroBoardItemConnectorCaption {
	content: string;
	position: string;
	textAlignVertical: string;
}

export interface IMiroBoardItemConnector extends IMiroBoardItemBase {
	captions?: IMiroBoardItemConnectorCaption[];
	type: MiroBoardItemTypes.CONNECTOR;
	startItem?: IMiroBoardConnectionsPoints;
	endItem?: IMiroBoardConnectionsPoints;
	shape: string;
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export interface MiroUnsupportedItem extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.UNSUPPORTED;
	geometry: IMiroGeometry;
	position: IMiroPosition;
	miroData: unknown;
}

export type IMiroBoardItem =
	| IMiroBoardItemText
	| IMiroBoardItemShape
	| IMiroBoardItemSticker
	| IMiroBoardItemImage
	| IMiroBoardItemConnector
	| IMiroBoardItemFrame
	| IMiroBoardItemMindmap
	| IMiroBoardItemCard
	| IMiroBoardItemDocument
	| IMiroBoardItemPaint
	| MiroUnsupportedItem;
