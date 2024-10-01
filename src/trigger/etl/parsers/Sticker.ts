import { FrameItem, StickyNoteItem } from "@mirohq/miro-api";
import { makeInjectedText, parseTextFromSticker } from "./RichText";
import { getItemPosition } from "./shared";

interface StickerPayload {
    item: StickyNoteItem;
    boardId: string;
    userId: string;
    order: number;
    newItemId: string;
    parent?: FrameItem;
}

export const stickerColors = {
    "Sky Blue": "rgb(174, 212, 250)",
    "Pale Yellow": "rgb(252, 245, 174)",
    "Sage Green": "rgb(175, 214, 167)",
    Lavender: "rgb(233, 191, 233)",
    "Aqua Cyan": "rgb(171, 221, 221)",
    "Pastel Red": "rgb(246, 168, 168)",
    "Light Gray": "rgb(230, 230, 230)",
    "Black Black": "rgb(20, 21, 26)",
} as { [color: string]: string };

const colorsSticker = {
    dark_blue: stickerColors["Sky Blue"],
    blue: stickerColors["Sky Blue"],
    light_blue: stickerColors["Sky Blue"],
    red: stickerColors["Pastel Red"],
    orange: stickerColors["Pastel Red"],
    violet: stickerColors["Pastel Red"],
    pink: stickerColors["Pastel Red"],
    light_pink: stickerColors["Lavender"],
    cyan: stickerColors["Aqua Cyan"],
    dark_green: stickerColors["Sage Green"],
    green: stickerColors["Sage Green"],
    light_green: stickerColors["Sage Green"],
    yellow: stickerColors["Pale Yellow"],
    light_yellow: stickerColors["Pale Yellow"],
    gray: stickerColors["Light Gray"],
    black: stickerColors["Black Black"],
};

export const parseSticker = (payload: StickerPayload): Array<any | null> => {
    const { item, boardId, userId, order, parent, newItemId } = payload;

    const pos = getItemPosition(item, parent);

    const event: any = {
        userId: userId,
        boardId: boardId,
        eventId: `${userId}:${order}`,
        operation: {
            data: {
                itemType: "Sticker",
                transformation: {
                    rotate: 0,
                    scaleX: item.geometry?.width ? item.geometry?.width / 200 : 1,
                    scaleY: item.geometry?.height ? item.geometry?.height / 200 : 1,
                    translateX: pos.x,
                    translateY: pos.y,
                },
                backgroundColor: item?.style?.fillColor
                    ? colorsSticker[item?.style?.fillColor as keyof typeof colorsSticker] || stickerColors["Sky Blue"]
                    : stickerColors["Sky Blue"],
            },
            item: newItemId,
            class: "Board",
            method: "add",
        },
    };

    let insertEvent = null;
    if (item?.data?.content) {
        const parsedText = parseTextFromSticker(item);
        const text = makeInjectedText(parsedText, {
            colorReverse: item?.style?.fillColor === "black",
        });

        event.operation.data.text = { ...text.event.text, realSize: "auto" };

        insertEvent = {
            type: "BoardEvent",
            boardId: boardId,
            event: {
                order: 0,
                body: {
                    eventId: `${userId}:${order}`,
                    userId: 1725879524889,
                    boardId: boardId,
                    operation: {
                        class: "RichText",
                        method: "edit",
                        item: [newItemId],
                        selection: {
                            anchor: {
                                path: [0, 0],
                                offset: 124,
                            },
                            focus: {
                                path: [0, 0],
                                offset: 124,
                            },
                        },
                        ops: [
                            {
                                type: "insert_node",
                                path: [0],
                                node: {
                                    type: "paragraph",
                                    children: [
                                        {
                                            text: parsedText.text,
                                            type: "text",
                                            fontSize: 14,
                                            fontColor: "black",
                                            fontFamily: "Arial",
                                            lineHeight: 1.4,
                                            fontHighlight: "",
                                            ...text.styles,
                                        },
                                    ],
                                    horisontalAlignment: "center",
                                },
                            },
                        ],
                    },
                },
            },
        };
    }

    return [event];
};
