export const AUTHOR_KEY_HEADER = "x-author-key";

export enum DirectAccessType {
  EDIT = "edit",
  VIEW = "view",
}

export enum AccessKeyType {
  EDIT = "edit",
  VIEW = "view",
}

export type Board = {
  id: string;
  title: string;
  authorKey: string | null;
  isPublic: boolean;
  directAccessType: DirectAccessType;
  order: number;
};

export type BoardPayload = Partial<
  Omit<Board, "id" | "authorKey"> & {
    parentFolder: number;
  }
>;

export type ClaimBoardsPayload = Partial<{
  authorKeys: string[];
  visited: string[];
}>;

export type AccessKey = {
  boardId: string;
  keyType: AccessKeyType;
  accessKey: string;
};

export type AccessKeyPayload = Pick<AccessKey, "keyType">;

export enum UserAccessType {
  View = "view",
  Edit = "edit",
  NoAccess = "noAccess",
}

export type GrantedUser = {
  id: number;
  name: string | null;
  email: string;
  accessType: UserAccessType;
  avatar: string | null;
  isOwner: boolean;
};

export type GrantAccessPayload = {
  userId: number | null;
  accessType: UserAccessType;
  email: string | null;
};

export type ManageAccessPayload = {
  users: GrantAccessPayload[];
  directAccessType: DirectAccessType;
  isPublic: boolean;
};

export interface BoardUser {
  id: number;
  email: string;
  permissions: UserAccessType[];
}

export interface BoardAuthor {
  id: number;
  email: string;
}

export interface BoardWithUsers {
  uuid: string;
  title: string | null;
  isPublic: boolean;
  author: BoardAuthor | null;
  users: BoardUser[];
}

export interface GetBoardsResponse {
  total: number;
  results: number;
  data: BoardWithUsers[];
}
