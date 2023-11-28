import { Board } from "Board";
import { getApiUrl } from "Config";
import { Subject } from "Subject";
import { Connection } from "Connection";

export class Account {
    boards: Board[] = [];

    constructor(private id: string, private connection: Connection) { }

    getId(): string {
        return this.id;
    }

    fetchBoards(): void {
        fetch(getApiUrl("/accounts/" + this.id), {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Failed to fetch boards");
                }
            })
            .then(data => {
                this.boards = [];
                for (const board of data.boards) {
                    this.boards.push(new Board(board.id));
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    getBoard(id: string): Board | undefined {
        for (const board of this.boards) {
            if (board.getBoardId() === id) {
                return board;
            }
        }
        return undefined;
    }

    openBoard(id: string): void {
        const board = this.getBoard(id);
        if (board) {
            board.connect(this.connection);
        } else {
            console.error(`Open Board: Board with id ${id} not found`);
        }
    }

    closeBoard(id: string): void {
        const board = this.getBoard(id);
        if (board) {
            board.disconnect();
        } else {
            console.error(`Close Board: Board with id ${id} not found`);
        }
    }

    close(): void {
        for (const board of this.boards) {
            board.disconnect();
        }
    }
}

export class Accounts {
    list: Account[] = [];
    subject = new Subject();

    constructor(private connection: Connection) { }

    open(id: string): void {
        const account = new Account(id, this.connection);
        this.list.push(account);
        this.subject.publish(id);
    }

    close(id: string): void {
        const index = this.list.findIndex(account => account.getId() === id);
        if (index === -1) {
            return;
        }
        const account = this.list[index];
        account.close();
        this.list.splice(index, 1);

        this.subject.publish(id);
    }

    isLoggedIn(): boolean {
        return this.list.length !== 0;
    }
}
