import { boards, boardSnapshots, type boardEvents } from "drizzle/entities";

export enum UserAccessType {
  VIEW = 'view',
  EDIT = 'edit',
  NO_ACCESS = 'noAccess'
}

export type BoardPayload = typeof boards.$inferInsert;
export type BoardSnapshotPayload = typeof boardSnapshots.$inferInsert;
export type BoardEventPayload = typeof boardEvents.$inferInsert;

export const BOARD_UUID_PARAM = 'boardUUID';
export const ACCESS_KEY_PARAM = 'accessKey';
