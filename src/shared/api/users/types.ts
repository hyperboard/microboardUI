export type User = {
	id: number;
	email: string;
	name: string;
	avatar: string;
	avatarGenerated: boolean;
	newsletter: boolean;
};

export type UpdateUserNewsletter = {
	newsletter: boolean;
};

export type UpdateUserPayload = {
	name: string;
};
