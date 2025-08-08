export type Board = {
	id: string;
	title: string | null;
	isPublic: boolean;
};

export type AnonymousBoard = Board & {
	authorKey: string;
};

export type ClaimPayload = Record<"visited" | "authorKeys", string[]>;
export type BoardsList = Record<
	"author" | "canView" | "canEdit" | "shared",
	Board[]
>;
