import { api } from "../base/base";
import { MessageResponse } from "../types";
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
  GetBoardsResponse,
  BoardWithUsers,
} from "./types";

export function createBoard(body: BoardPayload) {
  return api.post<Board>("/boards", body);
}

export function claimBoards(body: ClaimBoardsPayload) {
  return api.post("/boards/claim", body);
}

export function getBoard(boardId: string) {
  return api.get<Board>("/boards/:boardId", {
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
  return api.patch<Board>("/boards/:boardId", body, {
    params: {
      boardId,
    },
    headers: {
      ...(authorKey && { [AUTHOR_KEY_HEADER]: authorKey }),
    },
  });
}

export function deleteBoard(boardId: string, authorKey?: string | null) {
  return api.delete("/boards/:boardId", {
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
  return api.post<AccessKey>("/boards/:boardId/access-key", body, {
    params: {
      boardId,
    },
    headers: {
      ...(authorKey && { [AUTHOR_KEY_HEADER]: authorKey }),
    },
  });
}

export function getAccessKeys(boardId: string, authorKey?: string) {
  return api.get<AccessKey[]>("/boards/:boardId/access-key", {
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
  return api.get<AccessKey[]>("/boards/:boardId/access-key/:accessKey", {
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
  return api.delete("/boards/:boardId/access-key/:accessKey", {
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
  return api.get<GrantedUser[]>("/boards/:boardId/grant-access", {
    params: {
      boardId,
    },
  });
}

export function grantAccess(boardId: string, users: GrantAccessPayload[]) {
  return api.post(
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
  return api.post("/boards/:boardId/manage-access", manageAccess, {
    params: {
      boardId,
    },
  });
}

export async function publishSnapshot(
  HTMLSnapshot: string,
  snapshotUId: string,
  boardUId: string,
): Promise<
  MessageResponse & {
    snapshotURI: string;
  }
> {
  const { data } = await api.post<MessageResponse & { snapshotURI: string }>(
    "/media/snapshot",
    {
      snapshot: HTMLSnapshot,
      snapshotUId,
      boardUId,
    },
  );
  if (!data) {
    throw new Error();
  }

  return data;
}

export async function getBoardsWithUsers(
  page: number,
  pageSize: number,
  boardId?: string,
) {
  const query = {
    page: String(page),
    pageSize: String(pageSize),
  };

  if (boardId && boardId.trim() !== "") {
    query["uuid"] = boardId.trim();
  }

  return api.get<GetBoardsResponse>("/boards", {
    query,
  });
}
