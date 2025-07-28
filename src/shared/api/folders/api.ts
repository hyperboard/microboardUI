import { api } from "../index";
import type {
  AddToFolderPayload,
  Folder,
  FolderPayload,
  FolderType,
  ReorderFolderPayload,
} from "./types";

export function getRootFolder(folderType?: FolderType) {
  return api.get<Folder>("/folders", {
    query: folderType ? { type: folderType } : undefined,
  });
}

export function createFolder(body: FolderPayload) {
  return api.post<Folder>("/folders", body);
}

export function initFolders() {
  return api.post("/folders/init");
}

export function getFodler(folderId: number) {
  return api.get("/folders/:folderId", {
    params: {
      folderId,
    },
  });
}

export function addToFolder(folderId: number, body: AddToFolderPayload) {
  return api.post("/folders/:folderId", body, {
    params: {
      folderId,
    },
  });
}

export function deleteFolder(folderId: number) {
  return api.delete("/folders/:folderId", {
    params: {
      folderId,
    },
  });
}

export function deleteFolderContent(
  folderId: number,
  body: AddToFolderPayload,
) {
  return api.delete(
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
  return api.patch("/folders/:folderId", body, {
    params: {
      folderId,
    },
  });
}

export function reorderFolder(folderId: number, body: ReorderFolderPayload[]) {
  return api.post(
    "/folders/:folderId/reorder",
    { items: body },
    {
      params: {
        folderId,
      },
    },
  );
}
