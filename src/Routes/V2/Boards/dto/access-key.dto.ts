import type { AccessKeyType } from "drizzle/entities/boardAccessKeys";

export class AccessKeyDto {
  boardId: string;
  accessKey: string;
  keyType: AccessKeyType;

  constructor(payload: BoardDto) {
    this.boardId = payload.boardId;
    this.accessKey = payload.accessKey;
    this.keyType = payload.keyType;
  }
}