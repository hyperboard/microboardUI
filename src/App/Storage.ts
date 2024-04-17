import { Subject } from "Subject";

interface VisitedPublicBoard {
	boardId: string;
	name?: string;
	ownerId?: string;
}

export class Storage {
	visitedPublicBoards = `${location.host}/VisitedPublicBoards`;
	subject = new Subject<void>();

	/* Returns ids of visited public boards stored in the local storage */
	listPublicBoards(): VisitedPublicBoard[] {
		const visitedBoards = localStorage.getItem(this.visitedPublicBoards);
		if (visitedBoards) {
			return JSON.parse(visitedBoards);
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
	setPublicBoard(board: VisitedPublicBoard): void {
		const visitedBoards = this.listPublicBoards();
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
			this.visitedPublicBoards,
			JSON.stringify(visitedBoards),
		);
		this.subject.publish(); // Notify subscribers that a change has occurred.
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
