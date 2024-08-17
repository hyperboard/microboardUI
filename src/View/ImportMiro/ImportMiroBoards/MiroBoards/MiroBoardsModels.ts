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
}

export enum MiroBoardItemTypes {
	TEXT = "text",
	SHAPE = "shape",
	STICKER = "sticky_note",
	IMAGE = "image",
	CONNECTOR = "connector",
	FRAME = "frame",
}

export type MiroItemsTypes =
	| "shape"
	| "sticky_note"
	| "image"
	| "text"
	| "frame"
	| "connector";

export interface IMiroBoardItemStyle {
	borderColor?: string;
	borderOpacity?: string;
	borderStyle?: string;
	borderWidth?: string;
	color: string;
	fillColor?: string;
	fillOpacity: string;
	fontFamily: string;
	fontSize: string;
	textAlign: string;
	textAlignVertical: string;
	strokeColor?: string;
	strokeStyle?: string;
	strokeWidth?: string;
	startStrokeCap?: string;
	endStrokeCap?: string;
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
}

interface IMiroData {
	content: string;
}

interface IMiroGeometry {
	width: number;
	height: number;
}

interface IMiroPosition {
	x: number;
	y: number;
	origin: string;
	relativeTo: string;
}

export interface IMiroBoardItemText extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.TEXT;
	data: IMiroData;
	geometry: Omit<IMiroGeometry, "height">;
	position: IMiroPosition;
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

interface IMiroBoardConnectionsPoints {
	links: {
		self: string;
	};
	id: string;
	position: {
		x: string;
		y: string;
	};
}

export interface IMiroBoardItemConnector extends IMiroBoardItemBase {
	type: MiroBoardItemTypes.CONNECTOR;
	data: {
		imageUrl: string;
	};
	startItem?: IMiroBoardConnectionsPoints;
	endItem?: IMiroBoardConnectionsPoints;
	shape: string;
	geometry: IMiroGeometry;
	position: IMiroPosition;
}

export type IMiroBoardItem =
	| IMiroBoardItemText
	| IMiroBoardItemShape
	| IMiroBoardItemSticker
	| IMiroBoardItemImage
	| IMiroBoardItemConnector
	| IMiroBoardItemFrame;
