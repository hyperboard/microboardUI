import { api } from "../base/base";
import type { MessageResponse } from "../types";
import type { AnonymousBoard, Board, BoardsList } from "./types";

export function createBoard(title?: string, isPublic?: boolean) {
	return api.post<Board>(
		"/boards",
		{
			title,
			isPublic,
		},
		{
			redirect: "follow",
			referrerPolicy: "no-referrer",
			mode: "cors",
			cache: "no-cache",
		},
	);
}

export function createBoardUnAuthed(title?: string) {
	return api.post<AnonymousBoard>(
		"/boards/unauthed",
		{
			title,
		},
		{
			redirect: "follow",
			referrerPolicy: "no-referrer",
			mode: "cors",
			cache: "no-cache",
		},
	);
}

export function claim(body: ClaimPayload) {
	return api.post<MessageResponse>("/boards/claim", body);
}

export function getBoards() {
	return api.get<BoardsList>("/boards");
}

export function getBoardDetails(boardId: string) {
	return api.get<Board>("/boards/:boardId/details", {
		params: {
			boardId,
		},
	});
}

export function deleteBoard(boardId: string) {
	return api.delete("/boards/:boardId", {
		params: {
			boardId,
		},
	});
}

export function unvisitBoard(boardId: string) {
	return api.delete("/boards/:boardId/visited", {
		params: {
			boardId,
		},
	});
}

export function deleteBoardUnauthed(boardId: string, authorKey: string) {
	return api.delete("/boards/:boardId/:authorKey", {
		params: {
			authorKey,
			boardId,
		},
	});
}

export function renameBoard(boardId: string, newTitle: string) {
	return api.patch(
		"/boards/:boardId",
		{ newTitle },
		{
			params: {
				boardId,
			},
		},
	);
}

export function renameBoardUnauthed(
	boardId: string,
	authorKey: string,
	newTitle: string,
) {
	return api.patch(
		"/boards/:boardId/:authorKey",
		{ newTitle },
		{
			params: {
				boardId,
				authorKey,
			},
		},
	);
}
