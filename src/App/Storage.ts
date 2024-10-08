import type { boardsApi } from "shared/api";

export class Storage {
	createdBoards = `${location.host}/createdBoards`;
	visitedBoards = `${location.host}/visitedBoards`;

	/* Returns ids of visited public boards stored in the local storage */
	listCreatedBoards(): boardsApi.AnonymousBoard[] {
		const createdBoards = localStorage.getItem(this.createdBoards);
		if (createdBoards) {
			return JSON.parse(createdBoards);
		} else {
			return [];
		}
	}

	listVisitedBoards(): boardsApi.Board[] {
		const visitedBoards = localStorage.getItem(this.visitedBoards);
		if (visitedBoards) {
			return JSON.parse(visitedBoards);
		} else {
			return [];
		}
	}

	setCreatedBoards(boards: boardsApi.AnonymousBoard[]) {
		localStorage.setItem(this.createdBoards, JSON.stringify(boards));
	}

	setVisitedBoards(boards: boardsApi.Board[]) {
		localStorage.setItem(this.visitedBoards, JSON.stringify(boards));
	}

	private filterCreatedBoards(boardId: string) {
		const boards = this.listCreatedBoards();
		return boards.filter(b => b.id !== boardId);
	}

	private filterVisitedBoards(boardId: string) {
		const boards = this.listVisitedBoards();
		return boards.filter(b => b.id !== boardId);
	}

	addCreatedBoard(board: boardsApi.AnonymousBoard) {
		const filteredBoards = this.filterCreatedBoards(board.id);
		this.setCreatedBoards([board, ...filteredBoards]);
	}

	getCreatedBoard(boardId: string) {
		return this.listCreatedBoards().find(b => b.id === boardId);
	}

	removeCreatedBoard(boardId: string) {
		const filteredBoards = this.filterCreatedBoards(boardId);
		this.setCreatedBoards(filteredBoards);
	}

	addVisitedBoard(board: boardsApi.Board) {
		const filteredBoards = this.filterVisitedBoards(board.id);
		this.setVisitedBoards([board, ...filteredBoards]);
	}

	getVisitedBoard(boardId: string) {
		return this.listVisitedBoards().find(b => b.id === boardId);
	}

	removeVisitedBoard(boardId: string) {
		const filteredBoards = this.filterVisitedBoards(boardId);
		this.setVisitedBoards(filteredBoards);
	}

	hardClean() {
		localStorage.clear();
	}

	softClean() {
		localStorage.removeItem(this.createdBoards);
		localStorage.removeItem(this.visitedBoards);
	}

	renameCreatedBoard(boardId: string, title: string) {
		const boards = this.listCreatedBoards();
		const target = boards.find(({ id }) => id === boardId);
		if (!target) {
			return;
		}

		target.title = title;
		this.setCreatedBoards(boards);
	}
}
