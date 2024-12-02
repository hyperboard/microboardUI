export type User = {
	id: number;
	email: string;
	name: string;
	avatar: string;
	avatarGenerated: boolean;
};

export type UpdateUserPayload = {
	name: string;
};
