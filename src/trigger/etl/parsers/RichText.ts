import { Connector, FrameItem, ShapeItem, StickyNoteItem, TextItem } from "@mirohq/miro-api";
import * as cheerio from "cheerio";
import { v4 } from "uuid";

function extractTextContent(html: string) {
    const $ = cheerio.load(html);
    return $.text();
}

interface TextPayload {
    item: TextItem;
    boardId: string;
    userId: string;
    order: number;
}

export const parseText = (payload: TextPayload) => {
    const { item, boardId, userId, order } = payload;
    const uuid = v4();

    const $ = cheerio.load(item.data?.content!);
    const textElement = $("*").first();

    const width = item.geometry?.width || 100;
    const height = item.geometry?.height || 100;

    const xOffset = width / 2;
    const yOffset = height / 2;

    const getStylesFromTags = (element: cheerio.Cheerio<any>) => {
        return {
            bold: element.find("strong, b").length > 0 || element.parents("strong, b").length > 0,
            italic: element.find("em, i").length > 0 || element.parents("em, i").length > 0,
            underline: element.find("u").length > 0 || element.parents("u").length > 0,
            "line-through": element.find("s, strike, del").length > 0 || element.parents("s, strike, del").length > 0,
        };
    };

    const tagStyles = getStylesFromTags(textElement);

    const cssStyles = {
        bold: textElement.css("font-weight") === "bold" || textElement.css("font-weight") === "700",
        italic: textElement.css("font-style") === "italic",
        underline: textElement.css("text-decoration")?.includes("underline") || false,
        "line-through": textElement.css("text-decoration")?.includes("line-through") || false,
    };

    const styles = {
        bold: cssStyles.bold || tagStyles.bold,
        italic: cssStyles.italic || tagStyles.italic,
        underline: cssStyles.underline || tagStyles.underline,
        "line-through": cssStyles["line-through"] || tagStyles["line-through"],
    };

    return {
        userId: userId,
        boardId: boardId,
        eventId: `${userId}:${order}`,
        operation: {
            data: {
                children: [
                    {
                        type: "paragraph",
                        children: [
                            {
                                text: $.text(),
                                type: "text",
                                fontSize: item?.style?.fontSize || 14,
                                fontColor: item?.style?.color || "#000000",
                                fontHighlight: "",
                                ...styles,
                            },
                        ],
                    },
                ],
                insideOf: "RichText",
                itemType: "RichText",
                transformation: {
                    rotate: 0,
                    scaleX: 1,
                    scaleY: 1,
                    translateX: (item?.position?.x || 0) - xOffset,
                    translateY: (item?.position?.y || 0) - yOffset,
                },
                placeholderText: "Type something",
                containerMaxWidth: item?.geometry?.width || 0,
                verticalAlignment: "center",
            },
            item: uuid,
            class: "Board",
            method: "add",
        },
    };
};

interface TextToInject {
    rawHtml: string;
    text: string;
    fontSize: number;
    fontColor: string;
    fontFamily: string;
    maxWidth: number;
    parentItem: "Connector" | "Shape" | "Frame" | "Sticker";
}

export const parseTextFromConnector = (connector: Connector): TextToInject => {
    const html = cheerio.load(connector.captions![0].content);
    const elementWithColor = html('[style*="color"]');
    const fontColor = elementWithColor.css("color");

    return {
        rawHtml: connector.captions![0].content,
        text: html.text(),
        fontSize: connector?.style?.fontSize ? +connector?.style?.fontSize : 14,
        fontColor: connector?.style?.color || fontColor || "black",
        fontFamily: "Arial",
        maxWidth: 300,
        parentItem: "Connector",
    };
};
export const parseTextFromSticker = (sticker: StickyNoteItem): TextToInject => {
    const html = cheerio.load(sticker.data?.content!);
    const elementWithColor = html('[style*="color"]');
    const fontColor = elementWithColor.css("color");
    // const fontSize ???

    return {
        rawHtml: sticker.data?.content!,
        text: html.text(),
        fontSize: 14,
        fontColor: fontColor || "black",
        fontFamily: "Arial",
        maxWidth: sticker?.geometry?.width || 300,
        parentItem: "Sticker",
    };
};
export const parseTextFromShape = (shape: ShapeItem): TextToInject => {
    const html = cheerio.load(shape.data?.content!);
    const elementWithColor = html('[style*="color"]');
    const fontColor = elementWithColor.css("color");

    return {
        rawHtml: shape.data?.content!,
        text: html.text(),
        fontSize: shape?.style?.fontSize ? +shape?.style?.fontSize : 14,
        fontColor: shape?.style?.color || fontColor || "black",
        fontFamily: shape?.style?.fontFamily || "Arial",
        maxWidth: shape?.geometry?.width || 300,
        parentItem: "Shape",
    };
};

export const parseTextFromFrame = (frame: FrameItem): TextToInject => {
    const html = cheerio.load(frame.data?.title!);

    return {
        rawHtml: frame.data?.title!,
        text: html.text(),
        fontSize: 14,
        fontColor: "black",
        fontFamily: "Arial",
        maxWidth: frame?.geometry?.width || 300,
        parentItem: "Frame",
    };
};

export const makeInjectedText = (
    data: TextToInject,
    options?: {
        colorReverse?: boolean;
    }
) => {
    const $ = cheerio.load(data.rawHtml);
    const textElement = $("*").first();

    const getStylesFromTags = (element: cheerio.Cheerio<any>) => {
        return {
            bold: element.find("strong, b").length > 0 || element.parents("strong, b").length > 0,
            italic: element.find("em, i").length > 0 || element.parents("em, i").length > 0,
            underline: element.find("u").length > 0 || element.parents("u").length > 0,
            "line-through": element.find("s, strike, del").length > 0 || element.parents("s, strike, del").length > 0,
        };
    };

    const tagStyles = getStylesFromTags(textElement);

    const cssStyles = {
        bold: textElement.css("font-weight") === "bold" || textElement.css("font-weight") === "700",
        italic: textElement.css("font-style") === "italic",
        underline: textElement.css("text-decoration")?.includes("underline") || false,
        "line-through": textElement.css("text-decoration")?.includes("line-through") || false,
    };

    const styles = {
        bold: cssStyles.bold || tagStyles.bold,
        italic: cssStyles.italic || tagStyles.italic,
        underline: cssStyles.underline || tagStyles.underline,
        "line-through": cssStyles["line-through"] || tagStyles["line-through"],
    };

    return {
        text: {
            children: [
                {
                    type: "paragraph",
                    children: [
                        {
                            text: data.text || "",
                            type: "text",
                            fontSize: data.fontSize,
                            fontColor: options?.colorReverse ? "white" : data.fontColor,
                            fontFamily: data.fontFamily,
                            lineHeight: 1.4,
                            fontHighlight: "",
                            ...styles,
                        },
                    ],
                    horisontalAlignment: data.parentItem === "Connector" ? "center" : "left",
                },
            ],
            insideOf: data.parentItem,
            itemType: "RichText",
            maxWidth: data.maxWidth,
            placeholderText: "Type anything",
            containerMaxWidth: data.maxWidth,
            verticalAlignment: "center",
        },
    };
};
