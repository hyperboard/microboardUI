import type { Board } from "../boards";

export enum FolderType {
  ROOT = "root",
  NESTED = "nested",
  VISITED = "visited",
  TRASH = "trash",
  DRAFTS = "drafts",
}

export type Folder = {
  id: number;
  items: (NestedFolder | NestedBoard)[];
  type: FolderType;
  title: string;
};

export type NestedFolder = Folder & { itemType: "folder" };
export type NestedBoard = Board & { itemType: "board" };

export type FolderPayload = Partial<
  Pick<Folder, "title"> & {
    parentFolder: number;
  }
>;

export type AddToFolderPayload = Partial<{
  nestedFolderId: number;
  nestedBoardId: string;
}>;

export type ReorderFolderPayload = {
  id: string | number;
  order: number;
};
