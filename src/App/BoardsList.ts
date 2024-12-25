import i18next, { t } from "i18next";
import { boardsApiV2, foldersApi } from "shared/apiV2";
import { Subject } from "Subject";
import { Account } from "./Account";
import { Storage } from "./Storage";

export class BoardsList {
	subject = new Subject<void>();
	private sharedFolder: foldersApi.Folder | null = null;
	private rootFolder: foldersApi.Folder | null = null;
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
				console.log("create authed");
				const { data } = await boardsApiV2.createBoard({
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
				console.log("create unauthed");
				const { data } = await boardsApiV2.createBoard({
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

		return searchFolder(this.rootFolder) || searchFolder(this.sharedFolder);
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
			this.findPathToBoard(boardId, this.sharedFolder)
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
			this.findPathToFolder(folderId, this.sharedFolder)
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

		return searchFolder(this.rootFolder) || searchFolder(this.sharedFolder);
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
			searchFolderByType(this.sharedFolder)
		);
	}

	async loadBoards(): Promise<void> {
		this.isLoading = true;
		if (this.account.isLoggedIn) {
			const { data: rootFolder } = await foldersApi.getRootFolder();
			const { data: sharedFolder } = await foldersApi.getRootFolder(
				foldersApi.FolderType.VISITED,
			);
			if (!rootFolder) {
				throw new Error("Failed to load folders");
			}
			if (!sharedFolder) {
				throw new Error("Failed to load folders");
			}
			this.rootFolder = rootFolder;
			this.sharedFolder = sharedFolder;
			this.updateEmptyTitles(this.rootFolder);
			this.updateEmptyTitles(this.sharedFolder);
			this.rootFolder.title = t("sidePanel.folders.myBoards");
			this.sharedFolder.title = t("sidePanel.folders.sharedBoards");

			const publicDrafts = this.getFolderByType(
				foldersApi.FolderType.DRAFTS,
			);
			if (!publicDrafts) {
				throw new Error("Failed to load folders");
			}
			publicDrafts.title = t("sidePanel.folders.publicDrafts");
			this.isLoading = false;
			this.subject.publish();
		} else {
			this.rootFolder = {
				id: -1,
				items: this.storage.listCreatedBoards().map(board => ({
					...board,
					itemType: "board",
					title: board.title || t("board.untitled"),
				})),
				title: t("sidePanel.folders.publicDrafts"),
				type: foldersApi.FolderType.DRAFTS,
			};
			this.sharedFolder = {
				id: -2,
				items: this.storage.listVisitedBoards().map(board => ({
					...board,
					itemType: "board" as const,
					title: board.title || t("board.untitled"),
				})),
				title: t("sidePanel.folders.sharedBoards"),
				type: foldersApi.FolderType.VISITED,
			};
			await this.updateDetails();
			this.isLoading = false;
			this.subject.publish();
		}
	}

	async updatePrivacySettings(
		boardId: string,
		isPublic: boolean,
		mode: boardsApiV2.DirectAccessType,
	): Promise<void> {
		if (!this.account.isLoggedIn) {
			return;
		}
		this.isLoading = true;
		this.subject.publish();

		await boardsApiV2.editBoard(boardId, {
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
				item.title = t("board.untitled");
			}
			if (item.itemType === "folder") {
				this.updateEmptyTitles(item as foldersApi.Folder);
			}
		}
	}

	async visitBoard(id: string): Promise<Promise<void>> {
		return await this.action(
			async () => {
				await boardsApiV2.claimBoards({ visited: [id] });
				await this.updateList();
			},
			async () => {
				if (
					this.storage.getVisitedBoard(id) ||
					this.storage.getCreatedBoard(id)
				) {
					return;
				}
				const { data } = await boardsApiV2.getBoard(id);
				if (data) {
					this.storage.addVisitedBoard(data);
					await this.updateList();
				} else {
					throw new Error("Cannot get board data");
				}
			},
		);
	}

	async claim(): Promise<void> {
		const publicBoards = this.storage.listCreatedBoards();
		const sharedBoards = this.storage.listVisitedBoards();
		if (publicBoards.length === 0 && sharedBoards.length === 0) {
			return;
		}
		try {
			await boardsApiV2.claimBoards({
				authorKeys: publicBoards
					.map(({ authorKey }) => authorKey)
					.filter(ak => ak !== null),
				visited: sharedBoards.map(({ id }) => id),
			});
		} catch {
			console.error("Error claiming boards");
		}
		await this.updateList();
	}

	async rename(boardId: string, name: string): Promise<void> {
		if (name === i18next.t("board.untitled")) {
			return;
		}

		const board = this.getBoardInfo(boardId);
		if (!board) {
			return;
		}

		board.title = name || t("board.untitled");

		this.subject.publish();

		await this.action(
			async () => {
				await boardsApiV2.editBoard(boardId, { title: name });
				await this.updateList();
			},
			async () => {
				await boardsApiV2.editBoard(
					boardId,
					{ title: name },
					board.authorKey,
				);
				this.storage.renameCreatedBoard(board.id, name);
				await this.updateList();
			},
		);
	}

	async renameFolder(folderId: number, name: string): Promise<void> {
		if (!this.account.isLoggedIn) {
			return;
		}

		if (name === i18next.t("board.untitled")) {
			return;
		}

		const folder = this.getFolder(folderId);

		if (!folder) {
			return;
		}

		folder.title = name || t("board.untitled");

		this.subject.publish();

		await foldersApi.editFolder(folderId, {
			title: name,
		});

		await this.updateList();
	}

	async removeBoard(boardId: string): Promise<void> {
		await this.action(
			async () => {
				await boardsApiV2.deleteBoard(boardId);
				await this.updateList();
			},
			async () => {
				const createdBoard = this.storage.getCreatedBoard(boardId);
				if (createdBoard) {
					try {
						await boardsApiV2.deleteBoard(
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
			findFolder(this.rootFolder) || findFolder(this.sharedFolder);

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
		const findItemIndex = (
			folder: foldersApi.Folder | null,
		): number | null => {
			if (!folder) {
				return null;
			}
			if (folder.id === folderId) {
				const itemIndex = folder.items.findIndex(
					item => item.id === itemId,
				);
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
			findItemIndex(this.rootFolder) || findItemIndex(this.sharedFolder)
		);
	}

	async removeItemFromFolder(
		folderId: number,
		itemId: string | number,
	): Promise<void> {
		if (!this.account.isLoggedIn) {
			return;
		}

		const findAndRemoveItem = (
			folder: foldersApi.Folder | null,
		): boolean => {
			if (!folder) {
				return false;
			}
			if (folder.id === folderId) {
				const itemIndex = folder.items.findIndex(
					item => item.id === itemId,
				);
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

		if (removedFromRoot || removedFromShared) {
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
				visitedBoards.map(
					async ({ id }) => await boardsApiV2.getBoard(id),
				),
			);
			const details = detailsRes
				.map(({ data }) => data)
				.filter(data => data !== null);
			this.storage.setVisitedBoards(details);
		} catch {
			console.error("Can't fetch board details");
		}
		this.subject.publish();
	}

	async manageAccess(
		boardId: string,
		payload: boardsApiV2.ManageAccessPayload,
	) {
		this.isLoading = true;
		this.subject.publish();

		await boardsApiV2.manageAccess(boardId, payload);
		this.loadBoards();
	}

	private async updateList(): Promise<void> {
		this.isLoading = true;
		this.subject.publish();
		await this.account.refreshTokens();
		await this.loadBoards();
		this.isLoading = false;
		this.subject.publish();
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
