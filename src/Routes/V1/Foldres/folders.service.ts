import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { FolderItems, FolderPayload } from "./types";
import { folders, foldersToBoards, foldersToFolders, folderType, FolderType } from "drizzle/entities/folders";
import { aliasedTable, and, eq, getTableColumns, sql } from "drizzle-orm";
import { boardOwner, boards } from "drizzle/entities";
import type { BoardsService } from "../Boards/boards.service";
import { BoardDto } from "../Boards/dto";
import { NestedFolderDto } from "./dto/nested-folder.dto";

type FolderResult = {
    folderId: number;
    type: string;
    folderTitle: string;
    boardId: number | null;
    foldersToBoardId: number | null;
    boardOrder: number | null;
    boardUniqId: string | null;
    boardTitle: string | null;
    isPublic: boolean | null;
    authorKey: string | null;
    directAccessType: string | null;
    nestedFolderId: number | null;
    nestedFolderOrder: number | null;
    foldersToFolderId: number | null;
    nestedFolderTitle: string | null;
    nestedFolderType: string | null;
};

export class FoldersService {
    constructor(private db: NodePgDatabase, private boardsService: BoardsService) {}

    async create(newFolder: FolderPayload & { parentFolder?: number }) {
        const parentFolder = newFolder.parentFolder && (await this.get(newFolder.parentFolder));

        const folder = await this.db.transaction(async (tx) => {
            const [record] = await this.db.insert(folders).values(newFolder).returning().execute();

            if (parentFolder) {
                await tx
                    .insert(foldersToFolders)
                    .values({ folderId: newFolder.parentFolder, containsFolderId: record.id })
                    .execute();
            }

            return record;
        });

        if (parentFolder) {
            await this.reorder(parentFolder.id, [
                { id: folder.id, order: 0 },
                ...parentFolder.items.map((item, idx) => ({ id: item.id, order: idx + 1 })),
            ]);
        }

        return folder;
    }

    async get(folderId: number) {
        const nestedFolders = aliasedTable(folders, "nestedFolders");
        const result: FolderResult[] = await this.db
            .select({
                folderId: folders.id,
                type: folders.type,
                folderTitle: folders.title,
                boardId: foldersToBoards.containsBoardId,
                foldersToBoardId: foldersToBoards.id,
                boardOrder: foldersToBoards.order,
                boardUniqId: boards.uniqId,
                boardTitle: boards.title,
                isPublic: boards.isPublic,
                authorKey: boards.authorUUID,
                directAccessType: boards.directAccessType,
                nestedFolderId: foldersToFolders.containsFolderId,
                nestedFolderOrder: foldersToFolders.order,
                foldersToFolderId: foldersToFolders.id,
                nestedFolderTitle: nestedFolders.title,
                nestedFolderType: nestedFolders.type,
            })
            .from(folders)
            .leftJoin(foldersToFolders, eq(foldersToFolders.folderId, folders.id))
            .leftJoin(nestedFolders, eq(foldersToFolders.containsFolderId, nestedFolders.id)) // Join again for nested folders
            .leftJoin(foldersToBoards, eq(foldersToBoards.folderId, folders.id))
            .leftJoin(boards, eq(foldersToBoards.containsBoardId, boards.id))
            .where(eq(folders.id, folderId))
            .execute();

        const uniqueItemsMap = new Map();

        for (const r of result) {
            if (r.boardId !== null) {
                const boardKey = `board-${r.boardId}`;
                if (!uniqueItemsMap.has(boardKey)) {
                    uniqueItemsMap.set(boardKey, {
                        ...new BoardDto({
                            id: r.boardUniqId!,
                            title: r.boardTitle || "",
                            isPublic: r.isPublic ?? false,
                            directAccessType: r.directAccessType!,
                            authorKey: r.authorKey,
                            order: r.boardOrder ?? undefined,
                        }),
                        itemType: "board",
                    });
                }
            }
            if (r.nestedFolderId !== null) {
                const folderKey = `folder-${r.nestedFolderId}`;
                if (!uniqueItemsMap.has(folderKey)) {
                    const nestedFolder = await this.get(r.nestedFolderId); // Recursive call to get nested folder items
                    uniqueItemsMap.set(
                        folderKey,
                        new NestedFolderDto({
                            itemType: "folder",
                            type: r.nestedFolderType as FolderType,
                            id: r.nestedFolderId,
                            title: r.nestedFolderTitle || "",
                            items: nestedFolder.items, // Include items of the nested folder
                            order: r.nestedFolderOrder ?? undefined,
                        })
                    );
                }
            }
        }

        const sortedItems = Array.from(uniqueItemsMap.values()).sort((a, b) => {
            return (a.order ?? 0) - (b.order ?? 0);
        });

        const folder = {
            id: result[0].folderId,
            title: result[0].folderTitle,
            type: result[0].type as FolderType,
            items: sortedItems,
        };

        return folder;
    }

    async getRoot(userId: number, folderType: FolderType = FolderType.ROOT) {
        const [rootFolderId] = await this.db
            .select({ id: folders.id })
            .from(folders)
            .where(and(eq(folders.ownerId, userId), eq(folders.type, folderType)));

        if (!rootFolderId) {
            return null;
        }

        const rootFolder = await this.get(rootFolderId.id);

        return rootFolder;
    }

    async addNestedFolder(folderId: number, nestedFolderId: number) {
        await this.db
            .insert(foldersToFolders)
            .values({ folderId: folderId, containsFolderId: nestedFolderId })
            .execute();
    }

    async addNestedBoard(folderId: number, nestedBoardUUID: string) {
        const board = await this.boardsService.get(nestedBoardUUID);

        if (!board) {
            return;
        }

        await this.db.insert(foldersToBoards).values({ folderId: folderId, containsBoardId: board.id }).execute();
    }

    async removeNestedFolder(folderId: number, nestedFolderId: number) {
        await this.db
            .delete(foldersToFolders)
            .where(and(eq(foldersToFolders.folderId, folderId), eq(foldersToFolders.containsFolderId, nestedFolderId)))
            .execute();
    }

    async removeNestedBoard(folderId: number, nestedBoardUUID: string) {
        const board = await this.boardsService.get(nestedBoardUUID);

        if (!board) {
            return;
        }

        await this.db
            .delete(foldersToBoards)
            .where(and(eq(foldersToBoards.folderId, folderId), eq(foldersToBoards.containsBoardId, board.id)))
            .execute();
    }

    async removeFolder(folderId: number) {
        await this.db.delete(folders).where(eq(folders.id, folderId));
    }

    async editFolder(folderId: number, payload: FolderPayload) {
        await this.db.update(folders).set(payload).where(eq(folders.id, folderId));
    }

    async init(ownerId: number) {
        const rootFolder = await this.getRoot(ownerId);

        if (rootFolder) {
            if (
                rootFolder.items.length === 0 ||
                (rootFolder.items.length === 1 && rootFolder.items[0].type === FolderType.VISITED)
            ) {
                const ownedBoards = await this.db
                    .select({ id: boards.id })
                    .from(boards)
                    .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
                    .where(eq(boardOwner.ownerId, ownerId));

                const addBoardQuery = this.db
                    .insert(foldersToBoards)
                    .values({ folderId: rootFolder.id, containsBoardId: sql.placeholder("boardId") })
                    .prepare("addBoard");

                for (const board of ownedBoards) {
                    await addBoardQuery.execute({ boardId: board.id });
                }
            }

            if (rootFolder.items.length > 1) {
                return;
            }
        }

        await this.db.transaction(async (tx) => {
            const query = tx
                .insert(folders)
                .values({ ownerId, type: sql.placeholder("folderType") })
                .returning()
                .prepare("init");

            const [rootFolder] = await query.execute({ folderType: FolderType.ROOT });
            const [draftFolder] = await query.execute({ folderType: FolderType.DRAFTS });
            await query.execute({ folderType: FolderType.TRASH });
            await query.execute({ folderType: FolderType.VISITED });

            const insertFolderQuery = tx
                .insert(foldersToFolders)
                .values({ folderId: rootFolder.id, containsFolderId: sql.placeholder("containsFolderId") })
                .prepare("insertFolder");

            await insertFolderQuery.execute({ containsFolderId: draftFolder.id });
        });
    }

    async reorder(folderId: number, items: FolderItems) {
        await Promise.all(
            items.map(async (item) => {
                if (typeof item.id === "number") {
                    await this.db
                        .update(foldersToFolders)
                        .set({ order: item.order })
                        .where(
                            and(eq(foldersToFolders.folderId, folderId), eq(foldersToFolders.containsFolderId, item.id))
                        );
                }

                if (typeof item.id === "string") {
                    const [boardId] = await this.db
                        .select({ id: boards.id })
                        .from(boards)
                        .where(eq(boards.uniqId, item.id));
                    if (!boardId?.id) {
                        return;
                    }

                    await this.db
                        .update(foldersToBoards)
                        .set({ order: item.order })
                        .where(
                            and(eq(foldersToBoards.folderId, folderId), eq(foldersToBoards.containsBoardId, boardId.id))
                        );
                }
            })
        );
    }
}
