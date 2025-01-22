import type { ErrorMsg } from "./withWebSocketApi";

export class WsError implements ErrorMsg {
    type: "Error" = "Error";

    constructor(
        public readonly message: string,
        public readonly deniedBoardId?: string,
        public readonly expectedSequence?: number | undefined,
        public readonly receivedSequence?: number | undefined
    ) {}
}
