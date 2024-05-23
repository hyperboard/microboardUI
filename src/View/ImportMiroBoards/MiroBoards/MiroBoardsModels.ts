export interface IMiroBoards {
	data: IMiroBoard[];
}

export interface IMiroBoard {
	id: string;
	name: string;
	picture: {
		imageURL: string;
	};
}

export interface IMiroBoardItem {
	id: string;
	type: string;
	data: {
		content?: string;
		shape?: string;
		imageUrl?: string;
	};
	geometry: {
		height: number;
		width: number;
	};
	position: {
		origin: string;
		relativeTo: string;
		x: number;
		y: number;
	};
	startItem?: IMiroBoardConnectionsPoints;
	endItem?: IMiroBoardConnectionsPoints;
	style?: IMiroBoardItemStyle;
}

export interface IMiroBoardItemStyle {
	borderColor?: string;
	borderOpacity?: string;
	borderStyle?: string;
	borderWidth?: string;
	color: string;
	fillColor: string;
	fillOpacity: string;
	fontFamily: string;
	fontSize: string;
	textAlign: string;
	textAlignVertical: string;
}

interface IMiroBoardConnectionsPoints {
	id: number;
	position: {
		x: string;
		y: string;
	};
}
