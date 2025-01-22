import { and, eq, getTableColumns } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { boardAccessKeys, boards } from "drizzle/entities";
import type { AccessKeyType } from "drizzle/entities/boardAccessKeys";

export class AccessKeysService {
    constructor(private readonly db: NodePgDatabase) {}

    async createAccessKey(boardId: number, keyType: AccessKeyType) {
        const [key] = await this.db.insert(boardAccessKeys).values({ boardId, keyType }).returning();

        return key;
    }

    async getAccessKeys(boardId: number) {
        const keys = await this.db
            .select({ ...getTableColumns(boardAccessKeys), boardUUID: boards.uniqId })
            .from(boardAccessKeys)
            .innerJoin(boards, eq(boardAccessKeys.boardId, boards.id))
            .where(eq(boardAccessKeys.boardId, boardId));

        return keys;
    }

    async getAccessKey(boardId: number, keyUUID: string) {
        const [key] = await this.db
            .select({ ...getTableColumns(boardAccessKeys), boardUUID: boards.uniqId })
            .from(boardAccessKeys)
            .innerJoin(boards, eq(boardAccessKeys.boardId, boards.id))
            .where(and(eq(boardAccessKeys.keyUUID, keyUUID), eq(boardAccessKeys.boardId, boardId)));
        return key;
    }

    async deleteAccessKey(boardId: number, keyUUID: string) {
        await this.db
            .delete(boardAccessKeys)
            .where(and(eq(boardAccessKeys.boardId, boardId), eq(boardAccessKeys.keyUUID, keyUUID)));
    }
}
