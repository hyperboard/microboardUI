import { Connector, FrameItem, ShapeItem, StickyNoteItem, TextItem } from "@mirohq/miro-api";
import * as cheerio from "cheerio";
import { getItemPosition } from "./shared";

interface TextPayload {
    item: TextItem;
    boardId: string;
    userId: string;
    order: number;
    newItemId: string;
    parent?: FrameItem;
}

interface TextStyle {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    "line-through": boolean;
    fontColor: string;
    fontSize: number;
}

interface TextSegment {
    text: string;
    style: TextStyle;
}

const getStylesFromElement = (
    $: cheerio.Root,
    element: cheerio.Element,
    defaultStyle?: Partial<TextStyle>
): TextStyle => {
    const $element = $(element);
    return {
        bold:
            $element.is("strong, b") ||
            $element.parents("strong, b").length > 0 ||
            $element.css("font-weight") === "bold" ||
            $element.css("font-weight") === "700",
        italic: $element.is("em, i") || $element.parents("em, i").length > 0 || $element.css("font-style") === "italic",
        underline:
            $element.is("u") ||
            $element.parents("u").length > 0 ||
            $element.css("text-decoration")?.includes("underline") ||
            false,
        "line-through":
            $element.is("s, strike, del") ||
            $element.parents("s, strike, del").length > 0 ||
            $element.css("text-decoration")?.includes("line-through") ||
            false,
        fontColor: $element.css("color") || defaultStyle?.fontColor || "#000000",
        fontSize: parseInt($element.css("font-size") || "") || defaultStyle?.fontSize || 14,
    };
};

const parseTextRecursive = (
    $: cheerio.Root,
    element: cheerio.Element,
    defaultStyle?: Partial<TextStyle>
): TextSegment[] => {
    const segments: TextSegment[] = [];
    const $element = $(element);

    if ($element.contents().length === 0) {
        return [];
    }

    $element.contents().each((_, child) => {
        if (child.type === "text") {
            segments.push({
                text: $(child).text(),
                style: getStylesFromElement($, child.parent, defaultStyle),
            });
        } else if (child.type === "tag") {
            segments.push(...parseTextRecursive($, child, defaultStyle));
        }
    });

    return segments;
};

export const parseText = async (payload: TextPayload) => {
    const { item, boardId, userId, order, newItemId, parent } = payload;

    const $ = cheerio.load(item.data?.content!);

    const width = item.geometry?.width || 100;
    const height = item.geometry?.height || 100;

    const xOffset = width / 2;
    const yOffset = height / 2;

    const pos = await getItemPosition(item, parent);

    const getStylesFromElement = (element: any): TextStyle => {
        const $element = $(element);
        return {
            bold:
                $element.is("strong, b") ||
                $element.parents("strong, b").length > 0 ||
                $element.css("font-weight") === "bold" ||
                $element.css("font-weight") === "700",
            italic:
                $element.is("em, i") || $element.parents("em, i").length > 0 || $element.css("font-style") === "italic",
            underline:
                $element.is("u") ||
                $element.parents("u").length > 0 ||
                $element.css("text-decoration")?.includes("underline") ||
                false,
            "line-through":
                $element.is("s, strike, del") ||
                $element.parents("s, strike, del").length > 0 ||
                $element.css("text-decoration")?.includes("line-through") ||
                false,
            fontColor: $element.css("color") || item?.style?.color || "#000000",
            fontSize: parseInt($element.css("font-size") || "") || parseInt(item?.style?.fontSize || "") || 14,
        };
    };

    const parseTextRecursive = (element: cheerio.Element): TextSegment[] => {
        const segments: TextSegment[] = [];
        const $element = $(element);

        if ($element.contents().length === 0) {
            return [];
        }

        $element.contents().each((_, child) => {
            if (child.type === "text") {
                segments.push({
                    text: $(child).text(),
                    style: getStylesFromElement(child.parent),
                });
            } else if (child.type === "tag") {
                segments.push(...parseTextRecursive(child));
            }
        });

        return segments;
    };

    const textSegments = parseTextRecursive($("p").get(0));

    return {
        userId: userId,
        boardId: boardId,
        eventId: `${userId}:${order}`,
        operation: {
            data: {
                children: [
                    {
                        type: "paragraph",
                        children: textSegments.map((segment) => ({
                            text: segment.text,
                            type: "text",
                            fontSize: segment.style.fontSize,
                            fontColor: segment.style.fontColor,
                            fontHighlight: "",
                            ...segment.style,
                        })),
                    },
                ],
                insideOf: "RichText",
                itemType: "RichText",
                transformation: {
                    rotate: 0,
                    scaleX: 1,
                    scaleY: 1,
                    translateX: pos.x,
                    translateY: pos.y,
                },
                placeholderText: "Type something",
                containerMaxWidth: item?.geometry?.width || 0,
                verticalAlignment: "center",
            },
            item: newItemId,
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
