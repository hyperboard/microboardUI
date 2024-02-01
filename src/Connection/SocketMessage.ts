import { BoardEvent } from "../Board/Events/Events";

export class BoardEventSM {
	readonly type = "BoardEvent";
	constructor(public boardId: string, public event: BoardEvent) {}
}

export class BoardEventListSM {
	readonly type = "BoardEventList";
	constructor(public boardId: string, public events: BoardEvent[]) {}
}

export class SubscribeSM {
	readonly type = "Subscribe";
	constructor(public boardId: string, public index: number) {}
}

export class UnsubscribeSM {
	readonly type = "Unsubscribe";
	constructor(public boardId: string) {}
}

export type SocketMessage = BoardEventSM | BoardEventListSM | SubscribeSM | UnsubscribeSM;
