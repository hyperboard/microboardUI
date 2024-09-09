import { Board, Connector, FrameItem, ImageItem, ShapeItem, StickyNoteItem, TextItem } from "@mirohq/miro-api";
import { WidgetItem } from "@mirohq/miro-api/dist/highlevel/Item";
import { parseSticker } from "./Sticker";
import { parseShape } from "./Shape";
import { parseImage } from "./Image";
import { parseConnector } from "./Connector";
import { parseFrame } from "./Frame";
import { parseText } from "./RichText";
import { v4 } from "uuid";

export enum MiroBoardItemTypes {
    TEXT = "text",
    SHAPE = "shape",
    STICKER = "sticky_note",
    IMAGE = "image",
    CONNECTOR = "connector",
    FRAME = "frame",
}

interface Item {
    item: WidgetItem;
    userId: string;
    boardId: string;
}

interface BoardPayload {
    miroBoard: Board;
    userId: string;
    items: Item[];
    connectors: {
        item: Connector;
        userId: string;
        boardId: string;
    }[];
}

interface TransformedBoard {
    id: string;
    name: string;
    items: any[];
}

export const getTransformedBoard = async (payload: BoardPayload): Promise<TransformedBoard> => {
    const { items, connectors, userId, miroBoard } = payload;
    const boardUUID = v4();
    let order = 0;

    let frames: Map<string, { item: { frame: FrameItem; newItemId: string }; children: string[] }> = new Map();

    const parents = await items.reduce<Promise<any[]>>(async (accPromise, data, index) => {
        const acc = await accPromise;
        if (data?.item?.type === "frame") {
            acc.push(data.item);
        }
        return acc;
    }, Promise.resolve([]));

    const parsedItems = await items.reduce<Promise<any[]>>(async (accPromise, data, index) => {
        const acc = await accPromise;
        const itemUUID = v4();
        if (data?.item.type === "connector" && !(data.item as Connector).isSupported) {
            return acc;
        }
        if (data?.item.type === "frame") {
            frames.set(data.item.id, { item: { frame: data.item as FrameItem, newItemId: itemUUID }, children: [] });
        }
        let parent: FrameItem | undefined = undefined;
        if (data?.item?.parent) {
            parent = parents.find((p) => {
                return p.id === data?.item?.parent?.id;
            });
        }

        const events = await getParseFunction({
            item: data.item,
            newItemId: itemUUID,
            order: ++order,
            boardId: boardUUID,
            userId: userId,
            parent: parent,
        });

        const nonNullEvents = events.filter((event) => event !== null);

        if (!nonNullEvents.length) {
            return acc;
        }

        for (const event of nonNullEvents) {
            acc.push({ event, originalId: data.item.id });
        }

        if (data?.item.type !== "frame" && data?.item.parent && frames.has(data.item.parent.id)) {
            frames.get(data.item?.parent?.id)!.children.push(itemUUID);
        }

        return acc;
    }, Promise.resolve([]));

    const parsedConnectors = await connectors.reduce<Promise<any[]>>(async (accPromise, data, index) => {
        const acc = await accPromise;
        const itemUUID = v4();

        if (data?.item?.isSupported === false) {
            return acc;
        }

        const startItem = await items.find((item) => item.item.id === data.item?.startItem?.id);
        const endItem = await items.find((item) => item.item.id === data.item?.endItem?.id);
        const parsedStart = await parsedItems.find((item) => item.originalId === startItem?.item.id);
        const parsedEnd = await parsedItems.find((item) => item.originalId === endItem?.item.id);

        if (!startItem || !endItem) {
            return acc;
        }

        const events = await parseConnector({
            item: data.item,
            startItem: startItem.item,
            endItem: endItem.item,
            userId: userId,
            boardId: boardUUID,
            parsedStart,
            parsedEnd,
            order: ++order,
            newItemId: itemUUID,
        });

        const nonNullEvents = events.filter((event) => event !== null);

        if (!nonNullEvents.length) {
            return acc;
        }

        for (const event of nonNullEvents) {
            acc.push(event);
        }

        return acc;
    }, Promise.resolve([]));

    const parsedFramesChildren = Array.from(frames.entries())
        .flatMap(([_, frameData]) => {
            return frameData.children.map((childId) => {
                const newOrder = ++order;
                const event = {
                    eventId: `${userId}:${newOrder}`,
                    userId: userId,
                    boardId: boardUUID,
                    order: newOrder,
                    operation: {
                        class: "Frame",
                        method: "addChild",
                        item: [frameData.item.newItemId],
                        childId: childId,
                    },
                };

                return event;
            });
        })
        .filter(Boolean);

    const itemEvents = parsedItems.map((item) => item.event).filter((i) => i !== null);
    const connectorEvents = parsedConnectors.filter((i) => i !== null);
    const frameChildrenEvents = parsedFramesChildren.filter((i) => i !== null);

    return {
        id: miroBoard.id,
        name: miroBoard.name || "Untitled",
        items: [...itemEvents, ...connectorEvents, ...frameChildrenEvents],
    };
};

interface ItemPayload {
    item: WidgetItem;
    boardId: string;
    userId: string;
    order: number;
    newItemId: string;
    startItem?: WidgetItem;
    endItem?: WidgetItem;
    parent?: FrameItem;
}

export interface BoardEvent {
    userId: string;
    boardId: string;
    eventId: string;
    operation: Record<any, any>;
}

const getParseFunction = async (data: ItemPayload): Promise<Array<BoardEvent | null>> => {
    switch (data.item.type) {
        case MiroBoardItemTypes.SHAPE:
            return parseShape({
                ...data,
                item: data.item as ShapeItem,
            });
        case MiroBoardItemTypes.STICKER:
            return parseSticker({
                ...data,
                item: data.item as StickyNoteItem,
            });
        case MiroBoardItemTypes.IMAGE:
            return parseImage({
                ...data,
                item: data.item as ImageItem,
            });
        case MiroBoardItemTypes.TEXT:
            return parseText({
                ...data,
                item: data.item as TextItem,
            });

        case MiroBoardItemTypes.FRAME:
            return parseFrame({
                ...data,
                item: data.item as FrameItem,
            });
        default:
            console.log("item not supported");
            return [null];
    }
};
