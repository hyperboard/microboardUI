import { Connector } from "@mirohq/miro-api";
import { WidgetItem } from "@mirohq/miro-api/dist/highlevel/Item";
import { makeInjectedText, parseTextFromConnector } from "./RichText";
import { v4 } from "uuid";

interface ConnectorPayload {
    item: Connector;
    startItem?: WidgetItem;
    endItem?: WidgetItem;
    userId: string;
    boardId: string;
    order: number;
    parsedStart: any;
    parsedEnd: any;
}

const connectorTypes = {
    straight: "straight",
    curved: "curved",
    elbowed: "curved",
};

export const parseConnector = (payload: ConnectorPayload) => {
    const { item, startItem, endItem, userId, boardId, order, parsedStart, parsedEnd } = payload;
    const uuid = v4();
    // position in percentage
    const endPos = {
        x: item.endItem?.position?.x ? parseInt(item.endItem?.position?.x) : 0,
        y: item.endItem?.position?.y ? parseInt(item.endItem?.position?.y) : 0,
    };
    const startPos = {
        x: item.startItem?.position?.x ? parseInt(item.startItem?.position?.x) : 0,
        y: item.startItem?.position?.y ? parseInt(item.startItem?.position?.y) : 0,
    };

    // Calculate actual start and end points
    const calculatePoint = (pos: { x: number; y: number }, wItem?: WidgetItem) => {
        if (!wItem) return { x: 0, y: 0 };
        const width = wItem.geometry!.width!;
        const height = wItem.geometry!.height!;

        // Calculate the offset to move from center to top-left
        const xOffset = width / 2;
        const yOffset = height / 2;

        // Calculate the position relative to the top-left corner
        const x = wItem.position!.x! - xOffset + (pos.x / 100) * width;
        const y = wItem.position!.y! - yOffset + (pos.y / 100) * height;

        return { x, y };
    };

    const startPoint = calculatePoint(startPos, startItem);
    const endPoint = calculatePoint(endPos, endItem);

    const event: any = {
        userId: userId,
        boardId: boardId,
        eventId: `${userId}:${order}`,
        operation: {
            data: {
                endPoint: {
                    itemId: parsedEnd.event.operation.item,
                    relativeX: endPos.x,
                    relativeY: endPos.y,
                    pointType: "Fixed",
                },
                startPoint: {
                    itemId: parsedStart.event.operation.item,
                    relativeX: startPos.x,
                    relativeY: startPos.y,
                    pointType: "Fixed",
                },
                itemType: "Connector",
                lineColor: item?.style?.color || "#000000",
                lineStyle: item?.shape ? connectorTypes[item?.shape as keyof typeof connectorTypes] : "curved",
                lineWidth: item?.style?.strokeWidth ? Number(item?.style?.strokeWidth) : 1,

                transformation: {
                    rotate: 0,
                    scaleX: 1,
                    scaleY: 1,
                    translateX: startPoint.x,
                    translateY: startPoint.y,
                },
            },
            item: uuid,
            class: "Board",
            method: "add",
        },
    };

    if (item?.captions?.length) {
        const parsedText = parseTextFromConnector(item);
        const textBlock = makeInjectedText(parsedText);
        event.operation.data.text = textBlock.text;
    }

    return event;
};
