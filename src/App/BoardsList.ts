import type { Account } from "entities/account";
import { conf } from "microboard-temp";
import { boardsApi, foldersApi } from "shared/api";
import { Subject } from "shared/Subject";
import { Storage } from "./Storage";

type FolderItem = {
  id: string | number;
  title: string;
  itemType: "board" | "folder";
  type?: foldersApi.FolderType;
};

export class BoardsList {
  subject = new Subject<void>();
  private sharedFolder: foldersApi.Folder | null = null;
  private rootFolder: foldersApi.Folder | null = null;
  private draftsFolder: foldersApi.Folder | null = null;
  private activeDndItem: FolderItem | null = null;
  private overDndItem: FolderItem | null = null;
  isLoading = true;

  constructor(
    private readonly storage: Storage,
    private readonly account: Account,
  ) {}

  getSharedFolder(): foldersApi.Folder | null {
    return this.sharedFolder;
  }

  getRootFolder(): foldersApi.Folder | null {
    return this.rootFolder;
  }

  getDraftsFolder(): foldersApi.Folder | null {
    return this.draftsFolder;
  }

  async createFolder(title?: string, parentFolder?: number) {
    if (!this.account.isLoggedIn) {
      return;
    }

    const { data: folder } = await foldersApi.createFolder({
      parentFolder,
      title,
    });
    await this.updateList();
    return folder?.id ?? null;
  }

  async createBoard(
    name?: string,
    isPublic = false,
    parentFolder?: number,
  ): Promise<string> {
    return await this.action(
      async () => {
        const { data } = await boardsApi.createBoard({
          title: name,
          parentFolder,
          isPublic,
        });
        if (!data) {
          throw new Error("Board creation error");
        }
        await this.updateList();
        return data.id;
      },
      async () => {
        const { data } = await boardsApi.createBoard({
          title: name,
          isPublic: true,
          parentFolder,
        });
        if (!data) {
          throw new Error("Board creation error");
        }
        this.storage.addCreatedBoard(data);
        await this.updateList();
        return data.id;
      },
    );
  }

  getBoardInfo(boardId: string | null): foldersApi.NestedBoard | null {
    if (!boardId) {
      return null;
    }
    const searchFolder = (
      folder: foldersApi.Folder | null,
    ): foldersApi.NestedBoard | null => {
      if (!folder) {
        return null;
      }
      for (const item of folder.items) {
        if (item.itemType === "board" && item.id === boardId) {
          return item;
        }
        if (item.itemType === "folder") {
          const found = searchFolder(item as foldersApi.Folder);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return (
      searchFolder(this.rootFolder) ||
      searchFolder(this.sharedFolder) ||
      searchFolder(this.draftsFolder)
    );
  }

  private findPathToBoard(
    boardId: string,
    folder: foldersApi.Folder | null,
    path: number[] = [],
  ): number[] | null {
    if (!folder) {
      return null;
    }

    for (const item of folder.items) {
      if (item.itemType === "board" && item.id === boardId) {
        return [...path, folder.id];
      }
      if (item.itemType === "folder") {
        const result = this.findPathToBoard(
          boardId,
          item as foldersApi.Folder,
          [...path, folder.id],
        );
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  getPathToBoard(boardId: string): number[] | null {
    return (
      this.findPathToBoard(boardId, this.rootFolder) ||
      this.findPathToBoard(boardId, this.sharedFolder) ||
      this.findPathToBoard(boardId, this.draftsFolder)
    );
  }

  private findPathToFolder(
    folderId: number,
    folder: foldersApi.Folder | null,
    path: number[] = [],
  ): number[] | null {
    if (!folder) {
      return null;
    }

    if (folder.id === folderId) {
      return [...path, folder.id];
    }

    for (const item of folder.items) {
      if (item.itemType === "folder") {
        const result = this.findPathToFolder(
          folderId,
          item as foldersApi.Folder,
          [...path, folder.id],
        );
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  getPathToFolder(folderId: number): number[] | null {
    return (
      this.findPathToFolder(folderId, this.rootFolder) ||
      this.findPathToFolder(folderId, this.sharedFolder) ||
      this.findPathToFolder(folderId, this.draftsFolder)
    );
  }

  isFolderContainsBoard(folderId: number, boardId: string): boolean {
    const path = this.getPathToBoard(boardId);
    if (!path) {
      return false;
    }

    return path.includes(folderId);
  }

  isFolderContainsFolder(folderId: number, targetFolderId: number): boolean {
    const path = this.getPathToFolder(targetFolderId);
    if (!path) {
      return false;
    }

    return path.includes(folderId);
  }

  getFolder(
    folderId: number | null,
  ): foldersApi.Folder | foldersApi.NestedFolder | null {
    if (!folderId) {
      return null;
    }
    if (this.rootFolder?.id === folderId) {
      return this.rootFolder;
    }
    if (this.sharedFolder?.id === folderId) {
      return this.sharedFolder;
    }
    if (this.draftsFolder?.id === folderId) {
      return this.draftsFolder;
    }
    const searchFolder = (
      folder: foldersApi.Folder | null,
    ): foldersApi.Folder | null => {
      if (!folder) {
        return null;
      }
      for (const item of folder.items) {
        if (item.itemType === "folder" && item.id === folderId) {
          return item;
        }
        if (item.itemType === "folder") {
          const found = searchFolder(item);
          if (found) {
            return item;
          }
        }
      }
      return null;
    };

    return (
      searchFolder(this.rootFolder) ||
      searchFolder(this.sharedFolder) ||
      searchFolder(this.draftsFolder)
    );
  }

  getFolderByType(
    folderType: foldersApi.FolderType,
  ): foldersApi.Folder | foldersApi.NestedFolder | null {
    const searchFolderByType = (
      folder: foldersApi.Folder | null,
    ): foldersApi.Folder | null => {
      if (!folder) {
        return null;
      }
      for (const item of folder.items) {
        if (item.itemType === "folder" && item.type === folderType) {
          return item;
        }
        if (item.itemType === "folder") {
          const found = searchFolderByType(item);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return (
      searchFolderByType(this.rootFolder) ||
      searchFolderByType(this.sharedFolder) ||
      searchFolderByType(this.draftsFolder)
    );
  }

  async loadBoards(): Promise<void> {
    this.isLoading = true;
    if (this.account.isLoggedIn) {
      const { data: rootFolder } = await foldersApi.getRootFolder();
      const { data: sharedFolder } = await foldersApi.getRootFolder(
        foldersApi.FolderType.VISITED,
      );
      const { data: draftsFolder } = await foldersApi.getRootFolder(
        foldersApi.FolderType.DRAFTS,
      );
      if (!rootFolder || !sharedFolder || !draftsFolder) {
        throw new Error("Failed to load folders");
      }
      this.rootFolder = rootFolder;
      this.sharedFolder = sharedFolder;
      this.draftsFolder = draftsFolder;
      this.updateEmptyTitles(this.rootFolder);
      this.updateEmptyTitles(this.sharedFolder);
      this.updateEmptyTitles(this.draftsFolder);
      this.rootFolder.title = conf.i18n.t("sidePanel.folders.myBoards");
      this.sharedFolder.title = conf.i18n.t("sidePanel.folders.sharedBoards");
      this.draftsFolder.title = conf.i18n.t("sidePanel.folders.publicDrafts");
      this.isLoading = false;
      this.subject.publish();
    } else {
      this.rootFolder = {
        id: -1,
        items: this.storage.listCreatedBoards().map((board) => ({
          ...board,
          itemType: "board",
          title: board.title || conf.i18n.t("board.untitled"),
        })),
        title: conf.i18n.t("sidePanel.folders.publicDrafts"),
        type: foldersApi.FolderType.DRAFTS,
      };
      this.sharedFolder = {
        id: -2,
        items: this.storage.listVisitedBoards().map((board) => ({
          ...board,
          itemType: "board" as const,
          title: board.title || conf.i18n.t("board.untitled"),
        })),
        title: conf.i18n.t("sidePanel.folders.sharedBoards"),
        type: foldersApi.FolderType.VISITED,
      };
      this.draftsFolder = null;
      await this.updateDetails();
      this.isLoading = false;
      this.subject.publish();
    }
  }

  async updatePrivacySettings(
    boardId: string,
    isPublic: boolean,
    mode: boardsApi.DirectAccessType,
  ): Promise<void> {
    if (!this.account.isLoggedIn) {
      return;
    }
    this.isLoading = true;
    this.subject.publish();

    await boardsApi.editBoard(boardId, {
      isPublic,
      directAccessType: mode,
    });
    await this.updateList();
  }

  private updateEmptyTitles(folder: foldersApi.Folder | null): void {
    if (!folder) {
      return;
    }
    for (const item of folder.items) {
      if (!item.title) {
        item.title = conf.i18n.t("board.untitled");
      }
      if (item.itemType === "folder") {
        this.updateEmptyTitles(item as foldersApi.Folder);
      }
    }
  }

  async visitBoard(id: string): Promise<Promise<void>> {
    return await this.action(
      async () => {
        await boardsApi.claimBoards({ visited: [id] });
        await this.updateList();
      },
      async () => {
        if (
          this.storage.getVisitedBoard(id) ||
          this.storage.getCreatedBoard(id)
        ) {
          return;
        }
        const { data } = await boardsApi.getBoard(id);
        if (data && data.isPublic) {
          this.storage.addVisitedBoard(data);
          await this.updateList();
        }
      },
    );
  }

  async claim(): Promise<void> {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    const isTemplateView = searchParams.get("isTemplateView");
    if (!this.account.isLoggedIn || isTemplateView) {
      return;
    }
    const publicBoards = this.storage.listCreatedBoards();
    const sharedBoards = this.storage.listVisitedBoards();
    if (publicBoards.length === 0 && sharedBoards.length === 0) {
      return;
    }
    try {
      await boardsApi.claimBoards({
        authorKeys: publicBoards
          .map(({ authorKey }) => authorKey)
          .filter((ak) => ak !== null),
        visited: sharedBoards.map(({ id }) => id),
      });
    } catch {
      console.error("Error claiming boards");
    }
    await this.updateList();
  }

  async rename(boardId: string, name: string): Promise<void> {
    if (name === conf.i18n.t("board.untitled")) {
      return;
    }

    const board = this.getBoardInfo(boardId);
    if (!board) {
      return;
    }

    board.title = name || conf.i18n.t("board.untitled");

    this.subject.publish();

    await this.action(
      async () => {
        await boardsApi.editBoard(boardId, { title: name });
        await this.updateList();
      },
      async () => {
        await boardsApi.editBoard(boardId, { title: name }, board.authorKey);
        this.storage.renameCreatedBoard(board.id, name);
        await this.updateList();
      },
    );
  }

  async renameFolder(folderId: number, name: string): Promise<void> {
    if (!this.account.isLoggedIn) {
      return;
    }

    if (name === conf.i18n.t("board.untitled")) {
      return;
    }

    const folder = this.getFolder(folderId);

    if (!folder) {
      return;
    }

    folder.title = name || conf.i18n.t("board.untitled");

    this.subject.publish();

    await foldersApi.editFolder(folderId, {
      title: name,
    });

    await this.updateList();
  }

  async removeBoard(boardId: string): Promise<void> {
    await this.action(
      async () => {
        await boardsApi.deleteBoard(boardId);
        await this.updateList();
      },
      async () => {
        const createdBoard = this.storage.getCreatedBoard(boardId);
        if (createdBoard) {
          try {
            await boardsApi.deleteBoard(
              createdBoard.id,
              createdBoard.authorKey,
            );
          } finally {
            this.storage.removeCreatedBoard(boardId);
          }
        } else {
          this.storage.removeVisitedBoard(boardId);
        }
        await this.updateList();
      },
    );
  }

  async addItemToFolder(
    folderId: number,
    item: foldersApi.NestedBoard | foldersApi.NestedFolder,
    order = 0,
  ): Promise<void> {
    if (!this.account.isLoggedIn) {
      return;
    }

    const findFolder = (
      folder: foldersApi.Folder | null,
    ): foldersApi.Folder | null => {
      if (!folder) {
        return null;
      }
      if (folder.id === folderId) {
        return folder;
      }
      for (const item of folder.items) {
        if (item.itemType === "folder") {
          const found = findFolder(item as foldersApi.Folder);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const targetFolder =
      findFolder(this.rootFolder) ||
      findFolder(this.sharedFolder) ||
      findFolder(this.draftsFolder);

    if (targetFolder) {
      targetFolder.items.splice(order, 0, item);
      this.subject.publish();
      if (typeof item.id === "string") {
        await foldersApi.addToFolder(folderId, {
          nestedBoardId: item.id,
        });
      } else {
        await foldersApi.addToFolder(folderId, {
          nestedFolderId: item.id,
        });
      }
      const folderItemsOrder = targetFolder.items.map((item, idx) => ({
        id: item.id,
        order: idx,
      }));
      await foldersApi.reorderFolder(targetFolder.id, folderItemsOrder);
      await this.updateList();
    }
  }

  getItemIndexInFolder(
    folderId: number,
    itemId: string | number,
  ): number | null {
    const findItemIndex = (folder: foldersApi.Folder | null): number | null => {
      if (!folder) {
        return null;
      }
      if (folder.id === folderId) {
        const itemIndex = folder.items.findIndex((item) => item.id === itemId);
        // Corrected condition to check if itemIndex is found
        return itemIndex !== -1 ? itemIndex : null;
      }
      for (const item of folder.items) {
        if (item.itemType === "folder") {
          const foundIndex = findItemIndex(item as foldersApi.Folder);
          if (foundIndex !== null) {
            return foundIndex;
          }
        }
      }
      return null;
    };

    return (
      findItemIndex(this.rootFolder) ||
      findItemIndex(this.sharedFolder) ||
      findItemIndex(this.draftsFolder)
    );
  }

  async removeItemFromFolder(
    folderId: number,
    itemId: string | number,
  ): Promise<void> {
    if (!this.account.isLoggedIn) {
      return;
    }

    const findAndRemoveItem = (folder: foldersApi.Folder | null): boolean => {
      if (!folder) {
        return false;
      }
      if (folder.id === folderId) {
        const itemIndex = folder.items.findIndex((item) => item.id === itemId);
        if (itemIndex !== -1) {
          folder.items.splice(itemIndex, 1);
          return true;
        }
      }
      for (const item of folder.items) {
        if (item.itemType === "folder") {
          const found = findAndRemoveItem(item as foldersApi.Folder);
          if (found) {
            return true;
          }
        }
      }
      return false;
    };

    const removedFromRoot = findAndRemoveItem(this.rootFolder);
    const removedFromShared = removedFromRoot
      ? false
      : findAndRemoveItem(this.sharedFolder);
    const removedFromDrafts =
      removedFromRoot || removedFromShared
        ? false
        : findAndRemoveItem(this.draftsFolder);

    if (removedFromRoot || removedFromShared || removedFromDrafts) {
      this.subject.publish();
      if (typeof itemId === "string") {
        await foldersApi.deleteFolderContent(folderId, {
          nestedBoardId: itemId,
        });
      } else {
        await foldersApi.deleteFolderContent(folderId, {
          nestedFolderId: itemId,
        });
      }
      await this.updateList();
    }
  }

  async removeFolder(folderId: number): Promise<void> {
    if (!this.account.isLoggedIn) {
      return;
    }

    await foldersApi.deleteFolder(folderId);
    await this.updateList();
  }

  private async updateDetails(): Promise<void> {
    if (this.account.isLoggedIn) {
      return;
    }

    const visitedBoards = this.storage.listVisitedBoards();
    try {
      const detailsRes = await Promise.all(
        visitedBoards.map(async ({ id }) => await boardsApi.getBoard(id)),
      );
      const details = detailsRes
        .map(({ data }) => data)
        .filter((data) => data !== null);
      this.storage.setVisitedBoards(details);
    } catch {
      console.error("Can't fetch board details");
    }
    this.subject.publish();
  }

  async manageAccess(boardId: string, payload: boardsApi.ManageAccessPayload) {
    this.isLoading = true;
    this.subject.publish();

    await boardsApi.manageAccess(boardId, payload);
    this.loadBoards();
  }

  setDraggableDndItem(item: FolderItem | null) {
    if (item?.id === this.activeDndItem?.id) {
      return;
    }
    this.activeDndItem = item;
    this.subject.publish();
  }

  getDraggableDndItem() {
    return this.activeDndItem;
  }

  setOverDndItem(item: FolderItem | null) {
    if (item?.id === this.overDndItem?.id) {
      return;
    }
    this.overDndItem = item;
    this.subject.publish();
  }

  getOverDndItem() {
    return this.overDndItem;
  }

  private async updateList(): Promise<void> {
    try {
      this.isLoading = true;
      this.subject.publish();
      await this.account.refreshTokens();
      await this.loadBoards();
    } finally {
      this.isLoading = false;
      this.subject.publish();
    }
  }

  private async action<T, K>(
    authorized: () => T,
    notAuthorized: () => K,
  ): Promise<T | K> {
    let res: T | K;
    if (this.account.isLoggedIn) {
      res = await authorized();
    } else {
      res = await notAuthorized();
    }
    return res;
  }
}
