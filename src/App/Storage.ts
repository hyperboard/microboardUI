import { Subject } from "Subject";

interface VisitedPublicBoard {
    boardId: string;
    name?: string;
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

    /* Adds an id of a visited public board to the local storage */
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

    /* Removes an id of a visited public board from the local storage */
    removePublicBoard(id: string): void {
        let visitedBoards = this.listPublicBoards();
        for (let i = 0; i < length; i++) {
            if (visitedBoards[i].boardId === id) {
                visitedBoards.splice(i, 1);
                localStorage.setItem(this.visitedPublicBoards, JSON.stringify(visitedBoards));
                this.subject.publish();
                return;
            }
        }
    }
}
