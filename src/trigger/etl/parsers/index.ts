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

    const frames = new Map<string, { item: { frame: FrameItem; newItemId: string }; children: string[] }>();
    const parentsMap = new Map<string, FrameItem>();

    // Pre-process parents
    items.forEach((data) => {
        if (data?.item?.type === "frame") {
            parentsMap.set(data.item.id, data.item as FrameItem);
        }
    });

    // Process items
    const itemPromises = items.map(async (data, index) => {
        const itemUUID = v4();
        if (data?.item.type === "connector" && !(data.item as Connector).isSupported) {
            return null;
        }
        if (data?.item.type === "frame") {
            frames.set(data.item.id, { item: { frame: data.item as FrameItem, newItemId: itemUUID }, children: [] });
        }
        const parent = data?.item?.parent ? parentsMap.get(data?.item?.parent?.id) : undefined;

        const events = await getParseFunction({
            item: data.item,
            newItemId: itemUUID,
            order: ++order,
            boardId: boardUUID,
            userId: userId,
            parent: parent,
        });

        const nonNullEvents = events.filter((event) => event !== null);

        if (data?.item.type !== "frame" && data?.item.parent && frames.has(data.item.parent.id)) {
            frames.get(data.item?.parent?.id)!.children.push(itemUUID);
        }

        return nonNullEvents.length ? nonNullEvents.map((event) => ({ event, originalId: data.item.id })) : null;
    });

    const parsedItems = (await Promise.all(itemPromises)).filter((item) => item !== null).flat();

    // Process connectors
    const connectorPromises = connectors.map(async (data, index) => {
        if (data?.item?.isSupported === false) {
            return null;
        }

        const startItem = items.find((item) => item.item.id === data.item?.startItem?.id);
        const endItem = items.find((item) => item.item.id === data.item?.endItem?.id);
        const parsedStart = parsedItems.find((item) => item?.originalId === startItem?.item.id);
        const parsedEnd = parsedItems.find((item) => item?.originalId === endItem?.item.id);

        if (!startItem || !endItem) {
            return null;
        }

        const events = parseConnector({
            item: data.item,
            startItem: startItem.item,
            endItem: endItem.item,
            userId: userId,
            boardId: boardUUID,
            parsedStart,
            parsedEnd,
            order: ++order,
            newItemId: v4(),
        });

        return events.filter((event) => event !== null);
    });

    const parsedConnectors = (await Promise.all(connectorPromises)).filter((item) => item !== null).flat();

    // Process frame children
    const parsedFramesChildren = Array.from(frames.entries()).flatMap(([_, frameData]) =>
        frameData.children.map((childId) => ({
            eventId: `${userId}:${++order}`,
            userId: userId,
            boardId: boardUUID,
            order: order,
            operation: {
                class: "Frame",
                method: "addChild",
                item: [frameData.item.newItemId],
                childId: childId,
            },
        }))
    );

    const itemEvents = parsedItems.map((item) => item?.event);

    return {
        id: miroBoard.id,
        name: miroBoard.name || "Untitled",
        items: [...itemEvents, ...parsedConnectors, ...parsedFramesChildren],
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

const getParseFunction = (data: ItemPayload): Array<BoardEvent | null> => {
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
