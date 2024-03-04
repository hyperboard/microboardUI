import { Connection } from "Connection";
import { Wheel } from "./Wheel/Wheel";
import { getRender } from "View";
import { Clipboard } from "./Clipboard";
import { Location } from "./Location";
import { Board } from "Board";
import { Accounts } from "./Accounts";
import { Storage } from "./Storage";
import { Subject } from "../Subject";

interface Subscription {
    subjects: string[];
    observer: () => void;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';

export class App {
    private isTrackpad = true;
    private isMouse = true;
    clipboard = new Clipboard();
    location = new Location();
    storage = new Storage();
    accounts = new Accounts(this.connection);

    boards: Map<string, Board> = new Map();
    boardSubject = new Subject<Board>();

    board: Board | undefined;

    subjects: Map<string, () => Subject> = new Map([
        ["camera", () => this.board.camera.subject],
        ["selection", () => this.board.selection.subject],
        ["selectionItem", () => this.board.selection.itemSubject],
        ["selectionItems", () => this.board.selection.itemsSubject],
        ["items", () => this.board.items.subject],
        ["tools", () => this.board.tools.subject],
        ["events", () => this.board.events.subject],
        ["pointer", () => this.board.pointer.subject],
    ]);

    subscriptions: Subscription[] = [];

    constructor(private connection: Connection, private isHistory: boolean = true) { }

    findSubscription(subscription: {
        subjects: string[];
        observer: () => void;
    }): number {
        const subscriptions = this.subscriptions;
        const length = subscriptions.length;
        for (let i = 0; i < length; i++) {
            if (subscriptions[i].observer === subscription.observer) {
                return i;
            }
        }
        return -1;
    }

    subscribe(subscription: Subscription): void {
        const index = this.findSubscription(subscription);
        if (index === -1) {
            this.subscriptions.push(subscription);
        } else {
            this.subscriptions[index] = subscription;
        }
        this.activateSubscription(subscription);
    }

    activateSubscription(subscription: Subscription): void {
        for (const name of subscription.subjects) {
            const subject = this.subjects.get(name);
            if (!subject) {
                console.warn(
                    `Can not subscribe to subject ${name}. Does not exist`,
                );
                return;
            }
            subject().subscribe(subscription.observer);
        }
    }

    unsubscribe(subscription: Subscription): void {
        const index = this.findSubscription(subscription);
        if (index !== -1) {
            this.subscriptions.splice(index, 1);
        }
        this.deactivateSubscription(subscription);
    }

    deactivateSubscription(subscription: Subscription): void {
        for (const name of subscription.subjects) {
            const subject = this.subjects.get(name);
            if (!subject) {
                console.warn(
                    `Can not unsubscribe from subject ${name}. Does not exist`,
                );
                return;
            }
            subject().unsubscribe(subscription.observer);
        }
    }

    getWidth(): number {
        if (this.board) {
            return this.board.camera.window.width;
        } else {
            return window.innerWidth;
        }
    }

    getHeight(): number {
        if (this.board) {
            return this.board.camera.window.height;
        } else {
            return window.innerHeight;
        }
    }

    async openStartingBoard(): Promise<void> {
        let id = this.getStartingBoardId();
        if (!id) {
            id = await this.createPublicBoard();
        }
        this.openBoard(id);
    }

    getStartingBoardId(): string | null {
        if (this.accounts.isLoggedIn()) {
            return null;
        }

        const locationId = this.location.getCurrentBoardId();
        if (locationId) {
            this.storage.setPublicBoard({ boardId: locationId });
            return locationId;
        }
        return null;
        const visited = this.storage.listPublicBoards();
        const lastVisited = visited[visited.length - 1];
        if (lastVisited) {
            return lastVisited;
        }
        return null;
    }

    async createPublicBoard(): Promise<string> {
        const url = await this.connection.getNewPublicBoardURL();
        if (!url) {
            throw new Error("Failed to create a new public board.");
        }
        const id = this.location.getBoardId(url) ?? "";
        this.storage.setPublicBoard({ boardId: id });
        return id;
    }

    // async createPrivateBoard(owner: string): Promise<any> {
    //     const url = await this.connection.getNewPrivateBoardURL(owner);
    // }

    openBoard(id: string): void {
        let board = this.boards.get(id);
        if (!board) {
            board = new Board(id);
            board.connect(this.connection);
            this.boards.set(id, board);
        }
        for (const sub of this.subscriptions) {
            this.deactivateSubscription(sub);
        }
        this.board = board;
        for (const sub of this.subscriptions) {
            this.activateSubscription(sub);
        }

        // if(this.isHistory) {
        //     console.log('isHistory')
        //     window.history.pushState({}, "", this.location.getPathname(id));
        // }
        this.boardSubject.publish(board);
    }

    getBoard(): Board | undefined {
        return this.board;
    }

    isTrackpadZoom(): boolean {
        return this.isTrackpad;
    }

    enableTrackpadZoom(): void {
        this.isTrackpad = true;
    }

    disableTrackpadZoom(): void {
        this.isTrackpad = true;
    }

    isMouseZoom(): boolean {
        return this.isMouse;
    }

    enableMouseZoom(): void {
        this.isMouse = true;
    }

    disableMouseZoom(): void {
        this.isMouse = false;
    }

    onWheel(event: WheelEvent): void {
        const wheel = new Wheel(event);
        if (!this.board) {
            return;
        }
        if (this.isMouse && this.isTrackpad) {
            if (wheel.isProbablyMouseWheel()) {
                if (!wheel.isIgnore()) {
                    this.board.camera.zoomRelativeToPointerBy(
                        wheel.getWheelScaleMultiplier(),
                    );
                }
            } else if (wheel.isTouchpadPinch()) {
                if (!wheel.isIgnore()) {
                    this.board.camera.zoomRelativeToPointerBy(
                        wheel.getTouchpadPinchMultiplier(),
                    );
                }
            } else {
                if (!wheel.isIgnore()) {
                    const scale = this.board.camera.getScale();
                    this.board.camera.translateBy(
                        wheel.getTouchpadPanDeltaX() / scale,
                        wheel.getTouchpadPanDeltaY() / scale,
                    );
                }
            }
        } else if (this.isMouse) {
            if (!wheel.isIgnore()) {
                this.board.camera.zoomRelativeToPointerBy(
                    wheel.getWheelScaleMultiplier(),
                );
            }
        } else if (this.isTrackpad) {
            if (wheel.isTouchpadPinch()) {
                if (!wheel.isIgnore()) {
                    this.board.camera.zoomRelativeToPointerBy(
                        wheel.getTouchpadPinchMultiplier(),
                    );
                }
            } else {
                if (!wheel.isIgnore()) {
                    this.board.camera.translateBy(
                        wheel.getTouchpadPanDeltaX(),
                        wheel.getTouchpadPanDeltaY(),
                    );
                }
            }
        }
    }

    getClipboard(): Clipboard {
        return this.clipboard;
    }

    copySelectionIntoClipboard(): void {
        if (!this.board) {
            return;
        }
        this.clipboard.items = this.board.selection.copy();
    }

    cutSelectionIntoClipboard(): void {
        if (!this.board) {
            return;
        }
        this.clipboard.items = this.board.selection.cut();
    }

    pasteSelectionFromClipboard(): void {
        if (!this.board) {
            return;
        }
        if (this.clipboard.items) {
            this.board.paste(this.clipboard.items);
        }
    }

    render(): void {
        getRender(this)();
    }
}
