import { Board } from "Board";
import { Subject } from "../Subject";
import { BoardEvent } from "Board/Events/Events";
import { SyncLogSubject } from "Board/Events/SyncLog";

export type SubjectName =
	| "camera"
	| "cameraResize"
	| "selection"
	| "selectionItem"
	| "selectionItems"
	| "items"
	| "tools"
	| "events"
	| "syncLog"
	| "pointer";

export interface Subscription {
	subjects: SubjectName[];
	observer: () => void;
}

export interface Subscriptions {
	add(sub: Subscription): void;
	remove(sub: Subscription): void;
	setBoard(board: Board): void;
}

export function getSubscriptions(getBoard: () => Board): Subscriptions {
	let board = getBoard();

	const subjectsArray: [SubjectName, () => Subject<any>][] = [
		["camera", () => board.camera.subject],
		["cameraResize", () => board.camera.resizeSubject],
		["selection", () => board.selection.subject],
		["selectionItem", () => board.selection.itemSubject],
		["selectionItems", () => board.selection.itemsSubject],
		["items", () => board.items.subject],
		["tools", () => board.tools.subject],
		["events", () => board.events?.subject as Subject<BoardEvent>],
		["syncLog", () => board.events?.syncLogSubject as SyncLogSubject],
		["pointer", () => board.pointer.subject],
	];

	const subjects: Map<string, () => Subject<any>> = new Map(
		subjectsArray.filter(([, subject]) => subject !== undefined) as [
			string,
			() => Subject<any>,
		][],
	);

	const subscriptions: Subscription[] = [];
	const updateQueue: Set<() => void> = new Set();

	function decorateObserverToScheduleUpdate(
		observer: () => void,
	): () => void {
		return () => {
			if (!updateQueue.has(observer)) {
				updateQueue.add(observer);
			}
		};
	}

	function updateScheduledObservers(): void {
		for (const observer of updateQueue) {
			observer();
		}
		updateQueue.clear();
		requestAnimationFrame(updateScheduledObservers);
	}

	requestAnimationFrame(updateScheduledObservers);

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
					`Can not subscribe to subject ${name}. Does not exist`,
				);
				return;
			}
			const decoratedObserver = decorateObserverToScheduleUpdate(
				subscription.observer,
			);
			subject().subscribe(decoratedObserver);
			// subject().subscribe(subscription.observer);
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
					`Can not unsubscribe from subject ${name}. Does not exist`,
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
