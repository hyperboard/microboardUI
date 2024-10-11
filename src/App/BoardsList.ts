import i18next from "i18next";
import { boardsApi } from "shared/api";
import { Subject } from "Subject";
import { Account } from "./Account";
import { Storage } from "./Storage";

export class BoardsList {
	subject = new Subject<void>();
	sharedBoards: boardsApi.Board[] = [];
	publicBoards: boardsApi.Board[] = [];
	showedErrorModals: { [boardId: string]: boolean } = {};

	constructor(
		private readonly storage: Storage,
		private readonly account: Account,
	) {
		account.setOnLogin(async () => {
			await this.claim();
			this.storage.softClean();
			this.subject.publish();
		});
	}

	async createBoard(name?: string, isPublic = true) {
		return await this.action(
			async () => {
				const { data } = await boardsApi.createBoard(name, isPublic);
				if (!data) {
					throw new Error("Board creation error");
				}
				await this.updateList();
				return data.id;
			},
			async () => {
				const { data } = await boardsApi.createBoardUnAuthed(name);
				if (!data) {
					throw new Error("Board creation error");
				}
				this.storage.addCreatedBoard(data);
				await this.updateList();
				return data.id;
			},
		);
	}

	getBoardInfo(id: string | null) {
		if (!id) {
			return;
		}
		const sharedBoard = this.sharedBoards.find(board => board.id === id);
		const publicBoard = this.publicBoards.find(board => board.id === id);

		return sharedBoard || publicBoard;
	}

	async loadBoards() {
		if (this.account.isLoggedIn) {
			const { data } = await boardsApi.getBoards();
			this.publicBoards = data?.author ?? [];
			this.sharedBoards = data?.shared ?? [];
			this.subject.publish();
		} else {
			this.publicBoards = this.storage.listCreatedBoards();
			this.sharedBoards = this.storage.listVisitedBoards();
			await this.updateDetails();
			this.subject.publish();
		}
	}

	async visitBoard(id: string) {
		return await this.action(
			async () => {
				await boardsApi.claim({ visited: [id] });
				await this.updateList();
			},
			async () => {
				if (
					this.storage.getVisitedBoard(id) ||
					this.storage.getCreatedBoard(id)
				) {
					return;
				}
				const { data } = await boardsApi.getBoardDetails(id);
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
			await boardsApi.claim({
				authorKeys: publicBoards.map(({ authorKey }) => authorKey),
				visited: sharedBoards.map(({ id }) => id),
			});
		} catch {
			console.error("Error claiming boards");
		}
		await this.account.refreshTokens();
		await this.updateList();
	}

	async rename(boardId: string, name: string) {
		if (name === i18next.t("board.untitled")) {
			return;
		}
		const publicBoard = this.publicBoards.find(b => b.id === boardId);
		const sharedBoard = this.sharedBoards.find(b => b.id === boardId);

		if (publicBoard) {
			publicBoard.title = name;
		}

		if (sharedBoard) {
			sharedBoard.title = name;
		}
		this.subject.publish();

		await this.action(
			async () => {
				await boardsApi.renameBoard(boardId, name);
				await this.updateList();
			},
			async () => {
				const board = this.storage.getCreatedBoard(boardId);
				if (!board) {
					return;
				}

				await boardsApi.renameBoardUnauthed(
					board.id,
					board.authorKey,
					name,
				);
				this.storage.renameCreatedBoard(board.id, name);
				await this.updateList();
			},
		);
	}

	async remove(boardId: string) {
		await this.action(
			async () => {
				const sharedBoard = this.sharedBoards.find(
					({ id }) => id === boardId,
				);
				if (sharedBoard) {
					await boardsApi.unvisitBoard(sharedBoard.id);
				} else {
					await boardsApi.deleteBoard(boardId);
				}
				await this.updateList();
			},
			async () => {
				const createdBoard = this.storage.getCreatedBoard(boardId);
				if (createdBoard) {
					try {
						await boardsApi.deleteBoardUnauthed(
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

	private async updateDetails() {
		if (this.account.isLoggedIn) {
			return;
		}

		const visitedBoards = this.storage.listVisitedBoards();
		try {
			const detailsRes = await Promise.all(
				visitedBoards.map(
					async ({ id }) => await boardsApi.getBoardDetails(id),
				),
			);
			const details = detailsRes
				.map(({ data }) => data)
				.filter(data => data !== null) as boardsApi.Board[];
			this.storage.setVisitedBoards(details);
		} catch {
			console.error("Can't fetch board details");
		}
		this.subject.publish();
	}

	private async updateList() {
		await this.loadBoards();
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
