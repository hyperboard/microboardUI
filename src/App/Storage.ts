import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { Subject } from "Subject";

interface VisitedPublicBoard {
	boardId: string;
	name?: string;
	authorKey?: string;
}

export type AuthorKeys = { [boardId: string]: string };

export class Storage {
	visitedPublicBoards = `${location.host}/VisitedPublicBoards`;
	sharedBoards = `${location.host}/sharedBoards`;
	subject = new Subject<void>();
	isAuth = false;

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

	/* Adds an id of a visited public board to the local storage
    setPublicBoard(board: VisitedPublicBoard): void {
        let visitedBoards = this.listPublicBoards();
        const length = visitedBoards.length;
        for (let i = 0; i < length; i++) {
            if (visitedBoards[i].boardId === board.boardId) {
                visitedBoards[i] = { ...visitedBoards[i], ...board };
                localStorage.setItem(this.visitedPublicBoards, JSON.stringify(visitedBoards));
                this.subject.publish();
                return;
            }
        }
        visitedBoards.push(board);
        localStorage.setItem(this.visitedPublicBoards, JSON.stringify(visitedBoards));
        this.subject.publish();
    }
    */

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
			const authoredBoard = board as VisitedPublicBoard & {
				authorKey: string;
			};
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
			JSON.stringify(author.map(boardId => ({ boardId }))),
		);
		localStorage.setItem(
			this.sharedBoards,
			JSON.stringify([
				...canEdit.map(boardId => ({ boardId })),
				...canView.map(boardId => ({ boardId })),
				...shared.map(boardId => ({ boardId })),
			]),
		);
		this.subject.publish();
	}

	claimBoard(board: VisitedPublicBoard & { authorKey: string }): void {
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
	 *
	 * @type AuthorKeys = { [boardId: string]: string }
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

	/* Removes an id of a visited public board from the local storage */
	removePublicBoard(id: string): void {
		const visitedBoards = this.listPublicBoards();
		const length = visitedBoards.length;
		for (let i = 0; i < length; i++) {
			if (visitedBoards[i].boardId === id) {
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
}
