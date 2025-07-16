import { apiV2 } from "../base";
import {
  AUTHOR_KEY_HEADER,
  type AccessKey,
  type AccessKeyPayload,
  type Board,
  type BoardPayload,
  type ClaimBoardsPayload,
  type GrantAccessPayload,
  type GrantedUser,
  type ManageAccessPayload,
} from "./types";

export function createBoard(body: BoardPayload) {
  return apiV2.post<Board>("/boards", body);
}

export function claimBoards(body: ClaimBoardsPayload) {
  return apiV2.post("/boards/claim", body);
}

export function getBoard(boardId: string) {
  return apiV2.get<Board>("/boards/:boardId", {
    params: {
      boardId,
    },
  });
}

export function editBoard(
  boardId: string,
  body: BoardPayload,
  authorKey?: string | null,
) {
  return apiV2.patch<Board>("/boards/:boardId", body, {
    params: {
      boardId,
    },
    headers: {
      ...(authorKey && { [AUTHOR_KEY_HEADER]: authorKey }),
    },
  });
}

export function deleteBoard(boardId: string, authorKey?: string | null) {
  return apiV2.delete("/boards/:boardId", {
    params: {
      boardId,
    },
    headers: {
      ...(authorKey && { [AUTHOR_KEY_HEADER]: authorKey }),
    },
  });
}

export function createAccessKey(
  boardId: string,
  body: AccessKeyPayload,
  authorKey?: string,
) {
  return apiV2.post<AccessKey>("/boards/:boardId/access-key", body, {
    params: {
      boardId,
    },
    headers: {
      ...(authorKey && { [AUTHOR_KEY_HEADER]: authorKey }),
    },
  });
}

export function getAccessKeys(boardId: string, authorKey?: string) {
  return apiV2.get<AccessKey[]>("/boards/:boardId/access-key", {
    params: {
      boardId,
    },
    headers: {
      ...(authorKey && { [AUTHOR_KEY_HEADER]: authorKey }),
    },
  });
}

export function getAccessKey(
  boardId: string,
  accessKey: string,
  authorKey?: string,
) {
  return apiV2.get<AccessKey[]>("/boards/:boardId/access-key/:accessKey", {
    params: {
      boardId,
      accessKey,
    },
    headers: {
      ...(authorKey && { [AUTHOR_KEY_HEADER]: authorKey }),
    },
  });
}

export function deleteAccessKey(
  boardId: string,
  accessKey: string,
  authorKey?: string,
) {
  return apiV2.delete("/boards/:boardId/access-key/:accessKey", {
    params: {
      boardId,
      accessKey,
    },
    headers: {
      ...(authorKey && { [AUTHOR_KEY_HEADER]: authorKey }),
    },
  });
}

export function getGrantedUsers(boardId: string) {
  return apiV2.get<GrantedUser[]>("/boards/:boardId/grant-access", {
    params: {
      boardId,
    },
  });
}

export function grantAccess(boardId: string, users: GrantAccessPayload[]) {
  return apiV2.post(
    "/boards/:boardId/grant-access",
    { users },
    {
      params: {
        boardId,
      },
    },
  );
}

export function manageAccess(
  boardId: string,
  manageAccess: ManageAccessPayload,
) {
  return apiV2.post("/boards/:boardId/manage-access", manageAccess, {
    params: {
      boardId,
    },
  });
}
