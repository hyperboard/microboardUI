import { Database } from "../Database";
import winston from "winston";

class BoardEvent {
    constructor(public order: number = 0, public body: BoardEventBody) { }
}

interface BoardEventBody {
    eventId: string;
    userId: number;
    boardId: string;
    operation: any;
}

export class Board {
    constructor(
        public id: number = 0,
        public uuid: string = "00000000-0000-0000-0000-000000000000",
        private database: Database,
        private logger: winston.Logger,
    ) { }

    async addEvent(
        eventId: string,
        eventBody: BoardEventBody,
    ): Promise<BoardEvent> {
        const result = await this.database.query<{ order: number }>(
            "select addevent($1, $2, $3) as order",
            [this.id, eventId, eventBody],
        );
        this.logger.info(
            `added event, board:${this.id}, eventId=${eventId}, order=${result.rows[0].order}, ${JSON.stringify(
                eventBody,
            )}`,
        );
        const order = result.rows[0].order;
        return new BoardEvent(order, eventBody);
    }

    async listEvents(offset: number): Promise<BoardEvent[]> {
        try {
            const table = await this.database.query<BoardEvent>(
                "select logid as order, eventbody as body from listevents($1, $2)",
                [this.uuid, offset],
            );
            return table.rows;
        } catch (error) {
            this.logger.error(
                `listing events, board:${this.id
                }, offset:${offset} ${JSON.stringify(error)}`,
            );
            return [];
        }
    }
}
