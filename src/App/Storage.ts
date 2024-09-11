import { ConnectorLineStyle } from "Board/Items/Connector";
import { ConnectorEdge } from "Board/Items/Connector/Pointers";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { Subject } from "Subject";
import { refreshTokens } from "View/Routes/ProtectedRoute";

// TODO strictly type shared/owned/haveRights boards
export interface VisitedPublicBoard {
	boardId: string;
	name?: string;
	authorKey?: string;
	actualId?: string;
}

interface BoardWId extends VisitedPublicBoard {
	actualId: string;
}

interface BoardWKey extends VisitedPublicBoard {
	authorKey: string;
}

export type AuthorKeys = { [boardId: string]: string };

export class Storage {
	visitedPublicBoards = `${location.host}/VisitedPublicBoards`;
	sharedBoards = `${location.host}/sharedBoards`;
	subject = new Subject<void>();
	isAuth = false;
	showedErrorModals: { [boardId: string]: boolean } = {};

	setIsAuth(val: boolean): void {
		this.isAuth = val;
	}

	/* Returns ids of visited public boards stored in the local storage */
	listPublicBoards(): VisitedPublicBoard[] {
		const visitedBoards = localStorage.getItem(this.visitedPublicBoards);
		if (visitedBoards) {
			return JSON.parse(visitedBoards);
		} else {
			return [];
		}
	}

	/* Returns ids of visited shared boards stored in the local storage */
	listSharedBoards(): VisitedPublicBoard[] {
		const sharedBoards = localStorage.getItem(this.sharedBoards);
		if (sharedBoards) {
			return JSON.parse(sharedBoards);
		} else {
			return [];
		}
	}

	getLastSticker() {
		const lastSticker = sessionStorage.getItem("lastSticker");
		if (lastSticker) {
			return JSON.parse(lastSticker);
		} else {
			return null;
		}
	}

	setLastSticker(lastSticker) {
		sessionStorage.setItem("lastSticker", JSON.stringify(lastSticker));
	}

	setConnectorPointer(
		type: ConnectorPointerStyle,
		edge: ConnectorEdge,
	): void {
		sessionStorage.setItem(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
			type,
		);
	}

	getConnectorPointer(
		edge: ConnectorEdge,
	): ConnectorPointerStyle | undefined {
		const saved = sessionStorage.getItem(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
		);
		return (saved as ConnectorPointerStyle) || undefined;
	}

	setConnectorLineStyle(type: ConnectorLineStyle): void {
		sessionStorage.setItem("connectorLineStyle", type);
	}

	getConnectorLineStyle(): ConnectorLineStyle | undefined {
		const saved = sessionStorage.getItem("connectorLineStyle");
		if (saved) {
			return saved as ConnectorLineStyle;
		}

		return undefined;
	}

	/* Adds an id of a visited public board to the local storage */
	setPublicBoard(board: VisitedPublicBoard, isPublic = true): void {
		const visitedBoards = isPublic
			? this.listPublicBoards()
			: this.listSharedBoards();
		const length = visitedBoards.length;
		let boardExists = false;

		for (let i = 0; i < length; i++) {
			if (visitedBoards[i].boardId === board.boardId) {
				// If the board already exists, update its information.
				visitedBoards[i] = { ...visitedBoards[i], ...board };
				boardExists = true;
				break; // No need to continue the loop once the board is found.
			}
		}

		if (!boardExists) {
			// If the board does not exist, add it to the start of the array.
			visitedBoards.unshift(board);
		}

		// Store the updated array in the local storage.
		localStorage.setItem(
			isPublic ? this.visitedPublicBoards : this.sharedBoards,
			JSON.stringify(visitedBoards),
		);
		if (board.authorKey) {
			const authoredBoard = board as BoardWKey;
			if (this.isAuth) {
				this.claimBoard(authoredBoard);
			} else {
				localStorage.setItem(
					`authorKey_${authoredBoard.boardId}`,
					authoredBoard.authorKey,
				);
			}
		}
		this.subject.publish(); // Notify subscribers that a change has occurred.
	}

	async fetchBoards(): Promise<void> {
		const res = await fetch(getApiUrl("/boards"), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
		});
		const { author, canEdit, canView, shared } = await res.json();
		localStorage.setItem(
			this.visitedPublicBoards,
			JSON.stringify(
				author.map(board => ({
					boardId: board.link,
					actualId: board.boardId,
				})),
			),
		);
		// TODO replace with shared, haveRights
		localStorage.setItem(
			this.sharedBoards,
			JSON.stringify([
				...canEdit.map(board => ({
					boardId: board.link,
					actualId: board.boardId,
				})),
				...canView.map(board => ({
					boardId: board.link,
					actualId: board.boardId,
				})),
				...shared.map(boardId => ({ boardId })),
			]),
		);
		this.subject.publish();
	}

	claimBoard(board: BoardWKey): void {
		fetch(getApiUrl("/boards/claim"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
			body: JSON.stringify({
				authorKeys: [board.authorKey],
			}),
		}).then(response => {
			if (!response.ok) {
				console.error(
					"Could not claim board, saving key to localStorge",
				);
				localStorage.setItem(
					`authorKey_${board.boardId}`,
					board.authorKey,
				);
			} else {
				refreshTokens(Cookies.get("refreshToken") || "");
			}
		});
	}

	visitBoard(board: VisitedPublicBoard): void {
		fetch(getApiUrl("/boards/claim"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
			body: JSON.stringify({
				visited: [board.boardId],
			}),
		}).then(response => {
			if (!response.ok) {
				console.error("Could set board visited");
			}
		});
	}

	claimBoards(): void {
		const keys = this.getAuthorKeys();
		const visitedBoards = this.listPublicBoards().concat(
			this.listSharedBoards(),
		);
		const authorKeys = Object.values(keys);
		const authoredBoardIds = Object.keys(keys);
		const notAuthored = visitedBoards
			.filter(board => !authoredBoardIds.includes(board.boardId))
			.map(board => board.boardId);

		if (authorKeys.length > 0 || notAuthored.length > 0) {
			fetch(getApiUrl("/boards/claim"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${Cookies.get("accessToken")}`,
				},
				body: JSON.stringify({
					authorKeys,
					visited: notAuthored,
				}),
			}).then(response => {
				if (response.ok) {
					this.cleanAuthorKeys();
					this.fetchBoards();
				} else {
					console.error("Could not claim boards");
				}
			});
		}
	}

	/**
	@type AuthorKeys = { [boardId: string]: string }
		*/
	getAuthorKeys(): AuthorKeys {
		return (Array.from({ length: localStorage.length }) as string[]).reduce(
			(acc, _, i) => {
				const key = localStorage.key(i);
				if (key && key.startsWith("authorKey_")) {
					const boardId = key.split("_")[1];
					acc[boardId] = localStorage.getItem(key) as string;
				}
				return acc;
			},
			{} as AuthorKeys,
		);
	}

	cleanAuthorKeys(): void {
		const authorKeys = (
			Array.from({ length: localStorage.length }) as string[]
		)
			.map((_, i) => localStorage.key(i))
			.filter(key => key && key.startsWith("authorKey_"));

		authorKeys.forEach(key => localStorage.removeItem(key || ""));

		const visitedBoards = this.listPublicBoards().map(board => {
			if (board.authorKey) {
				board.authorKey = undefined;
			}
			return board;
		});

		localStorage.setItem(
			this.visitedPublicBoards,
			JSON.stringify(visitedBoards),
		);

		this.subject.publish();
	}

	private cleanVisitedBoards(): void {
		localStorage.removeItem(this.visitedPublicBoards);
		this.subject.publish();
	}

	private cleanSharedBoards(): void {
		localStorage.removeItem(this.sharedBoards);
		this.subject.publish();
	}

	clean(): void {
		this.cleanSharedBoards();
		this.cleanVisitedBoards();
		this.cleanAuthorKeys();
	}

	private deleteBoard(board: BoardWId): Promise<boolean> {
		return fetch(getApiUrl(`/boards/${board.actualId}`), {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
		}).then(response => {
			if (response.ok) {
				this.removePublicBoard(board.boardId);
				return true;
			} else {
				console.error("Could not delete board");
				return false;
			}
		});
	}

	private deleteBoardUnauthed(board: BoardWId & BoardWKey): Promise<boolean> {
		return fetch(
			getApiUrl(`/boards/${board.actualId}/${board.authorKey}`),
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			},
		).then(response => {
			if (response.ok) {
				this.removePublicBoard(board.boardId);
				return true;
			} else {
				console.error("Could not delete board");
				return false;
			}
		});
	}

	private unvisitBoard(board: VisitedPublicBoard): Promise<boolean> {
		return fetch(getApiUrl(`/boards/${board.boardId}/visited`), {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
		}).then(response => {
			if (response.ok) {
				return this.removeSharedBoard(board.boardId);
			} else if (response.status === 404) {
				console.warn(
					`status 404, did not find record about visiting ${board.boardId} link, removing shared link locally`,
				);
				return this.removeSharedBoard(board.boardId);
			} else {
				console.error("Could not delete shared board");
				return false;
			}
		});
	}

	removeBoard(id: string): Promise<boolean> {
		const publicBoard = this.listPublicBoards().find(
			board => board.boardId === id && board.actualId,
		);
		const sharedBoard = this.listSharedBoards().find(
			board => board.boardId === id && !board.actualId,
		); // no id === no rules
		const boardType = publicBoard
			? "public"
			: sharedBoard
			? "shared"
			: null;
		if (!boardType) {
			throw new Error(`unknown board id ${id}`);
		}

		const board = publicBoard ? publicBoard : sharedBoard;

		const boardActions = {
			true: {
				public: (board: BoardWId) => this.deleteBoard(board),
				shared: (board: VisitedPublicBoard) => this.unvisitBoard(board),
			},
			false: {
				public: (board: BoardWId & BoardWKey) =>
					this.deleteBoardUnauthed(board),
				shared: (board: VisitedPublicBoard) =>
					Promise.resolve(this.removeSharedBoard(board.boardId)),
			},
		};

		return boardActions[this.isAuth.toString()][boardType](board);
	}

	/* Removes an id of a visited public board from the local storage */
	removePublicBoard(id: string): void {
		const visitedBoards = this.listPublicBoards();
		const length = visitedBoards.length;
		for (let i = 0; i < length; i++) {
			if (visitedBoards[i].boardId === id) {
				if (visitedBoards[i].authorKey) {
					localStorage.removeItem(`authorKey_${id}`);
				}
				visitedBoards.splice(i, 1);
				localStorage.setItem(
					this.visitedPublicBoards,
					JSON.stringify(visitedBoards),
				);
				this.subject.publish();
				return;
			}
		}
	}

	/* Removes an id of a visited shared board from the local storage */
	removeSharedBoard(id: string): boolean {
		return this.listSharedBoards().some((board, index, array) => {
			if (board.boardId === id) {
				array.splice(index, 1);
				localStorage.setItem(this.sharedBoards, JSON.stringify(array));
				this.subject.publish();
				return true;
			}
			return false;
		});
	}

	reorderPublicBoard(draggedBoardId: string, targetBoardId: string): void {
		const visitedBoards = this.listPublicBoards();
		const draggedBoardIndex = visitedBoards.findIndex(
			board => board.boardId === draggedBoardId,
		);
		const targetBoardIndex = visitedBoards.findIndex(
			board => board.boardId === targetBoardId,
		);

		if (draggedBoardIndex < 0 || targetBoardIndex < 0) {
			return; // One of the boards wasn't found
		}

		// Remove the dragged board from its current position
		const [draggedBoard] = visitedBoards.splice(draggedBoardIndex, 1);
		// Insert it just before the target board's index
		visitedBoards.splice(targetBoardIndex, 0, draggedBoard);

		localStorage.setItem(
			this.visitedPublicBoards,
			JSON.stringify(visitedBoards),
		);
		this.subject.publish();
	}

	getPublicBoard(id: string) {
		return this.listPublicBoards().find(({ boardId }) => boardId === id);
	}

	getSharedBoard(id: string) {
		return this.listSharedBoards().find(({ boardId }) => boardId === id);
	}

	getBoard(id: string) {
		const publicBoard = this.getPublicBoard(id);

		if (publicBoard) {
			return publicBoard;
		}

		const sharedBoard = this.getSharedBoard(id);
		return sharedBoard;
	}

	renameBoard(id: string, name: string) {
		const publicBoard = this.getPublicBoard(id);

		if (!publicBoard) {
			return;
		}

		if (publicBoard) {
			this.setPublicBoard({ ...publicBoard, name });
		}

		fetch(getApiUrl(`/boards/${id}`), {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
			body: JSON.stringify({
				newTitle: name,
			}),
		})
			.then(res => {
				if (!res.ok) {
					throw new Error("Unauthorized");
				}
			})
			.catch(err => {
				console.error(err);
			})
			.finally(() => {
				this.subject.publish();
			});
	}
}
