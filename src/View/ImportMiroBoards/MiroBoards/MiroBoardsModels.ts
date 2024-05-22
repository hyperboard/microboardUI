import { BorderStyle } from "Board/Items/Path";

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
	style?: {
		borderColor?: string;
		borderOpacity?: string;
		borderStyle?: BorderStyle;
		borderWidth?: string;
		color: string;
		fillColor: string;
		fillOpacity: string;
		fontFamily: string;
		fontSize: string;
		textAlign: string;
		textAlignVertical: string;
	};
}
