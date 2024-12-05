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
	) {
		account.setOnLogin(async () => {
			await foldersApi.initFolders();
			await this.claim();
			this.storage.softClean();
			this.subject.publish();
		});
	}

	getSharedFolder() {
		return this.sharedFolder;
	}

	getRootFolder() {
		return this.rootFolder;
	}

	async createFolder(title?: string, parentFolder?: number) {
		if (!this.account.isLoggedIn) {
			return;
		}

		await foldersApi.createFolder({ parentFolder, title });
		await this.loadBoards();
	}

	async createBoard(
		name?: string,
		isPublic = false,
		parentFolder?: number,
	): Promise<string> {
		return await this.action(
			async () => {
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

	async loadBoards() {
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
				items: this.storage.listCreatedBoards().map(b => ({
					...b,
					itemType: "board",
					title: b.title || t("board.untitled"),
				})),
				title: t("sidePanel.folders.publicDrafts"),
				type: foldersApi.FolderType.DRAFTS,
			};
			this.sharedFolder = {
				id: -2,
				items: this.storage.listVisitedBoards().map(b => ({
					...b,
					itemType: "board" as const,
					title: b.title || t("board.untitled"),
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
	) {
		if (!this.account.isLoggedIn) {
			return;
		}
		this.isLoading = true;

		await boardsApiV2.editBoard(boardId, {
			isPublic,
			directAccessType: mode,
		});
		await this.updateList();
	}

	private updateEmptyTitles(folder: foldersApi.Folder | null) {
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

	async visitBoard(id: string) {
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

	async claim() {
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

	async rename(boardId: string, name: string) {
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

	async renameFolder(folderId: number, name: string) {
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
	async removeBoard(boardId: string) {
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

	async removeBoardFromFolder(folderId: number, boardId: string) {
		if (!this.account.isLoggedIn) {
			return;
		}

		await foldersApi.deleteFolderContent(folderId, {
			nestedBoardId: boardId,
		});
		await this.updateList();
	}

	async removeFolder(folderId: number) {
		if (!this.account.isLoggedIn) {
			return;
		}

		await foldersApi.deleteFolder(folderId);
		await this.updateList();
	}

	private async updateDetails() {
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

	private async updateList() {
		this.isLoading = true;
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
