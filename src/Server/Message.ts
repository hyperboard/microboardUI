export class BoardEventSM {
    readonly type = "BoardEvent";
    constructor(public boardId: string, public event: any) { }
}

export class BoardEventListSM {
    readonly type = "BoardEventList";
    constructor(public boardId: string, public events: any[]) { }
}

export class SubscribeSM {
    readonly type = "Subscribe";
    constructor(public boardId: string, public index: number) { }
}

export class UnsubscribeSM {
    readonly type = "Unsubscribe";
    constructor(public boardId: string) { }
}

export type SocketMessage = BoardEventSM | BoardEventListSM | SubscribeSM | UnsubscribeSM;
