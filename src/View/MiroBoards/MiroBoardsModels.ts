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
