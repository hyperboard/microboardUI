import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { FolderPayload } from "./types";
import { folders, foldersToBoards, foldersToFolders, folderType, FolderType } from "drizzle/entities/folders";
import { aliasedTable, and, eq, getTableColumns, sql } from "drizzle-orm";
import { boards } from "drizzle/entities";
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
  constructor(private db: NodePgDatabase, private boardsService: BoardsService) { }

  async create(newFolder: FolderPayload & { parentFolder?: number }) {
    const folder = await this.db.transaction(async tx => {
      const [record] = await this.db
        .insert(folders)
        .values(newFolder)
        .returning()
        .execute();

      if (newFolder.parentFolder) {
        await tx
          .insert(foldersToFolders)
          .values({ folderId: newFolder.parentFolder, containsFolderId: record.id })
          .execute();
      }

      return record;
    });

    return folder
  }

  async get(folderId: number) {
    const nestedFolders = aliasedTable(folders, 'nestedFolders');
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
        nestedFolderType: nestedFolders.type
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
              title: r.boardTitle || '',
              isPublic: r.isPublic ?? false,
              directAccessType: r.directAccessType!,
              authorKey: r.authorKey
            }), itemType: 'board'
          });
        }
      }
      if (r.nestedFolderId !== null) {
        const folderKey = `folder-${r.nestedFolderId}`;
        if (!uniqueItemsMap.has(folderKey)) {
          const nestedFolder = await this.get(r.nestedFolderId); // Recursive call to get nested folder items
          uniqueItemsMap.set(folderKey, new NestedFolderDto({
            itemType: 'folder',
            type: r.nestedFolderType as FolderType,
            id: r.nestedFolderId,
            title: r.nestedFolderTitle || '',
            items: nestedFolder.items // Include items of the nested folder
          }));
        }
      }
    }

    const sortedItems = Array.from(uniqueItemsMap.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const folder = {
      id: result[0].folderId,
      title: result[0].folderTitle,
      type: result[0].type as FolderType,
      items: sortedItems
    };

    return folder;
  }


  async getRoot(userId: number, folderType: FolderType = FolderType.ROOT) {
    const [rootFolderId] = await this.db
      .select({ id: folders.id })
      .from(folders)
      .where(and(eq(folders.ownerId, userId), eq(folders.type, folderType)))

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

    await this.db
      .insert(foldersToBoards)
      .values({ folderId: folderId, containsBoardId: board.id })
      .execute();
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
    await this.db
      .delete(folders)
      .where(eq(folders.id, folderId))
  }

  async editFolder(folderId: number, payload: FolderPayload) {
    await this.db
      .update(folders)
      .set(payload)
      .where(eq(folders.id, folderId));
  }

  async init(ownerId: number) {
    const [rootFolderId] = await this.db
      .select({ id: folders.id })
      .from(folders)
      .where(and(eq(folders.ownerId, ownerId), eq(folders.type, FolderType.ROOT)))

    if (rootFolderId) {
      return;
    }

    await this.db.transaction(async tx => {
      const query = tx
        .insert(folders)
        .values({ ownerId, type: sql.placeholder('folderType') })
        .returning()
        .prepare('init');

      const [rootFolder] = await query.execute({ folderType: FolderType.ROOT });
      const [draftFolder] = await query.execute({ folderType: FolderType.DRAFTS });
      await query.execute({ folderType: FolderType.TRASH });
      await query.execute({ folderType: FolderType.VISITED });

      const insertFolderQuery = tx
        .insert(foldersToFolders)
        .values({ folderId: rootFolder.id, containsFolderId: sql.placeholder('containsFolderId') })
        .prepare('insertFolder');

      await insertFolderQuery.execute({ containsFolderId: draftFolder.id });

    });
  }
}