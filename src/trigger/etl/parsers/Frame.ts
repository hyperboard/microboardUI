import { FrameItem } from "@mirohq/miro-api";

interface FramePayload {
    item: FrameItem;
    boardId: string;
    userId: string;
    order: number;
    newItemId: string;
}

const frameTypes = {
    custom: "Custom",
    a4: "A4",
    letter: "Letter",
    ratio_16x9: "Frame16x9",
    ratio_4x3: "Frame4x3",
    ratio_1x1: "Frame1x1",
    phone: "Custom",
    tablet: "Custom",
    desktop: "Custom",
};

export const parseFrame = (payload: FramePayload): Array<any | null> => {
    const { item, boardId, userId, order, newItemId } = payload;

    const width = item.geometry?.width || 100;
    const height = item.geometry?.height || 100;

    const xOffset = width / 2;
    const yOffset = height / 2;

    const event: any = {
        userId: userId,
        boardId: boardId,
        eventId: `${userId}:${order}`,
        operation: {
            data: {
                itemType: "Frame",
                shapeType: frameTypes[item?.data?.format as keyof typeof frameTypes] || "Custom",
                borderColor: "#1a1a1a",
                canChangeRatio: true,
                borderStyle: "solid",
                borderWidth: 1,
                borderOpacity: 1,
                transformation: {
                    rotate: parseInt(`${item.geometry?.rotation}` || "0") || 0,
                    scaleX: item.geometry?.width ? item.geometry.width / 100 : 1,
                    scaleY: item.geometry?.height ? item.geometry.height / 100 : 1,
                    translateX: (item?.position?.x || 0) - xOffset,
                    translateY: (item?.position?.y || 0) - yOffset,
                    dimension: {
                        width: width,
                        height: height,
                    },
                },
                backgroundColor: item?.style?.fillColor || "#ffffff",
                backgroundOpacity: 1,
            },
            item: newItemId,
            class: "Board",
            method: "add",
        },
    };

    if (item.data?.title) {
        event.operation.data.text = {
            children: [
                {
                    type: "paragraph",
                    horisontalAlignment: "left",
                    children: [
                        {
                            fontColor: "rgb(107, 110, 120)",
                            fontFamily: "Arial",
                            fontHighlight: "",
                            fontSize: 14,
                            lineHeight: 1.4,
                            text: item.data.title,
                            type: "text",
                        },
                    ],
                },
            ],
            insideOf: "RichText",
            itemType: "RichText",
            placeholderText: `Frame`,
            realSize: 14,
            verticalAlignment: "center",
        };
    }

    return [event];
};
