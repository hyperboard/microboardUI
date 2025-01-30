import { Meta } from "./types";

export function transformDeleteOperation(meta: Meta): any {
    const eventBody = {
        order: meta.order,

        eventId: `${meta.userId}:${meta.order}`,
        userId: meta.userId,
        boardId: meta.boardId,
        operation: {
            class: "Board",
            method: "remove",
            item: [meta.itemId],
        },
        operations: [
            {
                class: "Board",
                method: "remove",
                item: [meta.itemId],
                actualId: `${meta.userId}:${meta.order}`,
            },
        ],
        lastKnownOrder: meta.order,
    };

    return eventBody;
}
