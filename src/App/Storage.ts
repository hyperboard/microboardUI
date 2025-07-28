import type { boardsApi } from "shared/api";
import { v4 } from "uuid";

export class Storage {
  createdBoards = `${location.host}/createdBoards`;
  visitedBoards = `${location.host}/visitedBoards`;

  /* Returns ids of visited public boards stored in the local storage */
  listCreatedBoards(): boardsApi.Board[] {
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

  setCreatedBoards(boards: boardsApi.Board[]): void {
    localStorage.setItem(this.createdBoards, JSON.stringify(boards));
  }

  setVisitedBoards(boards: boardsApi.Board[]): void {
    localStorage.setItem(this.visitedBoards, JSON.stringify(boards));
  }

  private filterCreatedBoards(boardId: string): boardsApi.Board[] {
    const boards = this.listCreatedBoards();
    return boards.filter((board) => board.id !== boardId);
  }

  private filterVisitedBoards(boardId: string): boardsApi.Board[] {
    const boards = this.listVisitedBoards();
    return boards.filter((board) => board.id !== boardId);
  }

  addCreatedBoard(board: boardsApi.Board): void {
    const filteredBoards = this.filterCreatedBoards(board.id);
    this.setCreatedBoards([board, ...filteredBoards]);
  }

  getCreatedBoard(boardId: string): boardsApi.Board | undefined {
    return this.listCreatedBoards().find((board) => board.id === boardId);
  }

  removeCreatedBoard(boardId: string): void {
    const filteredBoards = this.filterCreatedBoards(boardId);
    this.setCreatedBoards(filteredBoards);
  }

  addVisitedBoard(board: boardsApi.Board): void {
    const filteredBoards = this.filterVisitedBoards(board.id);
    this.setVisitedBoards([board, ...filteredBoards]);
  }

  getVisitedBoard(boardId: string): boardsApi.Board | undefined {
    return this.listVisitedBoards().find((board) => board.id === boardId);
  }

  removeVisitedBoard(boardId: string): void {
    const filteredBoards = this.filterVisitedBoards(boardId);
    this.setVisitedBoards(filteredBoards);
  }

  hardClean(): void {
    localStorage.clear();
  }

  softClean(): void {
    localStorage.removeItem(this.createdBoards);
    localStorage.removeItem(this.visitedBoards);
  }

  renameCreatedBoard(boardId: string, title: string): void {
    const boards = this.listCreatedBoards();
    const target = boards.find(({ id }) => id === boardId);
    if (!target) {
      return;
    }

    target.title = title;
    this.setCreatedBoards(boards);
  }

  setUser(): string {
    const uuid = v4();
    localStorage.setItem(`currentUser`, uuid);
    return uuid;
  }

  setUserId(id: string): void {
    localStorage.setItem(`userId`, id);
  }

  clearUserId(): void {
    localStorage.removeItem(`userId`);
  }

  getUserId(): string | null {
    return localStorage.getItem(`userId`);
  }

  getUser(): string | null {
    return localStorage.getItem(`currentUser`);
  }

  setUserColor(color: string): void {
    localStorage.setItem(`userColor`, color);
  }

  getUserColor(): string | null {
    return localStorage.getItem(`userColor`);
  }
}
