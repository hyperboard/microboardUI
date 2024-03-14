import { Board } from "Board";
import { Subject } from "../Subject";

export interface Subscription {
    subjects: string[];
    observer: () => void;
}

export interface Subscriptions {
    add(sub: Subscription): void;
    remove(sub: Subscription): void;
    setBoard(board: Board): void;
}

export function getSubscriptions(getBoard: () => Board): Subscriptions {
    let board = getBoard();

    const subjects: Map<string, () => Subject<any>> = new Map([
        ["camera", () => board.camera.subject],
        ["selection", () => board.selection.subject],
        ["selectionItem", () => board.selection.itemSubject],
        ["selectionItems", () => board.selection.itemsSubject],
        ["items", () => board.items.subject],
        ["tools", () => board.tools.subject],
        ["events", () => board.events.subject],
        ["pointer", () => board.pointer.subject],
    ]);

    const subscriptions: Subscription[] = [];

    function findSubscription(subscription: {
        subjects: string[];
        observer: () => void;
    }): number {
        const length = subscriptions.length;
        for (let i = 0; i < length; i++) {
            if (subscriptions[i].observer === subscription.observer) {
                return i;
            }
        }
        return -1;
    }

    function subscribe(subscription: Subscription): void {
        const index = findSubscription(subscription);
        if (index === -1) {
            subscriptions.push(subscription);
        } else {
            subscriptions[index] = subscription;
        }
        activateSubscription(subscription);
    }

    function activateSubscription(subscription: Subscription): void {
        for (const name of subscription.subjects) {
            const subject = subjects.get(name);
            if (!subject) {
                console.warn(
                    `Can not subscribe to subject ${name}. Does not exist`
                );
                return;
            }
            subject().subscribe(subscription.observer);
        }
    }

    function unsubscribe(subscription: Subscription): void {
        const index = findSubscription(subscription);
        if (index !== -1) {
            subscriptions.splice(index, 1);
        }
        deactivateSubscription(subscription);
    }

    function deactivateSubscription(subscription: Subscription): void {
        for (const name of subscription.subjects) {
            const subject = subjects.get(name);
            if (!subject) {
                console.warn(
                    `Can not unsubscribe from subject ${name}. Does not exist`
                );
                return;
            }
            subject().unsubscribe(subscription.observer);
        }
    }

    function setBoard(newBoard: Board): void {
        for (const sub of subscriptions) {
            deactivateSubscription(sub);
        }
        board = newBoard;
        for (const sub of subscriptions) {
            activateSubscription(sub);
        }
    }

    return {
        add: subscribe,
        remove: unsubscribe,
        setBoard,
    };

}
