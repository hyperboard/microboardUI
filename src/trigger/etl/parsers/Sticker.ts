import { StickyNoteItem } from "@mirohq/miro-api";
import { makeInjectedText, parseTextFromSticker } from "./RichText";
import { v4 } from "uuid";

interface StickerPayload {
    item: StickyNoteItem;
    boardId: string;
    userId: string;
    order: number;
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

export const parseSticker = (payload: StickerPayload) => {
    const { item, boardId, userId, order } = payload;
    const uuid = v4();

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
                itemType: "Sticker",
                transformation: {
                    rotate: 0,
                    scaleX: item.geometry?.width ? item.geometry?.width / 200 : 1,
                    scaleY: item.geometry?.height ? item.geometry?.height / 200 : 1,
                    translateX: (item?.position?.x || 0) - xOffset,
                    translateY: (item?.position?.y || 0) - yOffset,
                },
                backgroundColor: item?.style?.fillColor
                    ? colorsSticker[item?.style?.fillColor as keyof typeof colorsSticker] || stickerColors["Sky Blue"]
                    : stickerColors["Sky Blue"],
            },
            item: uuid,
            class: "Board",
            method: "add",
        },
    };

    if (item?.data?.content) {
        const parsedText = parseTextFromSticker(item);
        const text = makeInjectedText(parsedText, {
            colorReverse: item?.style?.fillColor === "black",
        });

        event.operation.data.text = text.text;
    }

    return event;
};
