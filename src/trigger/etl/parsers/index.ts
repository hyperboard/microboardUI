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

export const getTransformedBoard = (payload: BoardPayload): TransformedBoard => {
    const { miroBoard, items, connectors, userId } = payload;
    const uuid = v4();

    const parsedItems = items.reduce<any[]>((acc, data, index) => {
        if (data?.item.type === "connector" && !(data.item as Connector).isSupported) {
            return acc;
        }

        const event = getParseFunction({
            item: data.item,
            miroBoard,
            order: index + 1,
            boardId: uuid,
            userId: userId,
        });

        if (!event) {
            return acc;
        }

        acc.push({ event, originalId: data.item.id });

        return acc;
    }, []);

    const parsedConnectors = connectors.reduce<any[]>((acc, data, index) => {
        if (data?.item?.isSupported === false) {
            return acc;
        }
        const startItem = items.find((item) => item.item.id === data.item?.startItem?.id);
        const endItem = items.find((item) => item.item.id === data.item?.endItem?.id);
        const parsedStart = parsedItems.find((item) => item.originalId === startItem?.item.id);
        const parsedEnd = parsedItems.find((item) => item.originalId === endItem?.item.id);
        if (!startItem || !endItem) {
            return acc;
        }
        const event = parseConnector({
            item: data.item,
            startItem: startItem.item,
            endItem: endItem.item,
            userId: userId,
            boardId: uuid,
            parsedStart,
            parsedEnd,
            order: parsedItems.length + index + 1,
        });

        acc.push(event);
        return acc;
    }, []);

    return {
        id: miroBoard.id,
        name: miroBoard.name || "Untitled",
        items: [...parsedItems.map((item) => item.event), ...parsedConnectors],
    };
};

interface ItemPayload {
    item: WidgetItem;
    miroBoard: Board;
    boardId: string;
    userId: string;
    order: number;
    startItem?: WidgetItem;
    endItem?: WidgetItem;
}

const getParseFunction = (data: ItemPayload) => {
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
    }
};
