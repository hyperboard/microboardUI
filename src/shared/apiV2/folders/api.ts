import { apiV2 } from "../base";
import type {
	AddToFolderPayload,
	Folder,
	FolderPayload,
	FolderType,
} from "./types";

export function getRootFolder(folderType?: FolderType) {
	return apiV2.get<Folder>("/folders", {
		query: folderType ? { type: folderType } : undefined,
	});
}

export function createFolder(body: FolderPayload) {
	return apiV2.post<Folder>("/folders", body);
}

export function initFolders() {
	return apiV2.post("/folders/init");
}

export function getFodler(folderId: number) {
	return apiV2.get("/folders/:folderId", {
		params: {
			folderId,
		},
	});
}

export function addToFolder(folderId: number, body: AddToFolderPayload) {
	return apiV2.post("/folders/:folderId", body, {
		params: {
			folderId,
		},
	});
}

export function deleteFolder(folderId: number) {
	return apiV2.delete("/folders/:folderId", {
		params: {
			folderId,
		},
	});
}

export function deleteFolderContent(
	folderId: number,
	body: AddToFolderPayload,
) {
	return apiV2.delete(
		"/folders/:folderId",
		{
			params: {
				folderId,
			},
		},
		body,
	);
}

export function editFolder(folderId: number, body: FolderPayload) {
	return apiV2.patch("/folders/:folderId", body, {
		params: {
			folderId,
		},
	});
}
