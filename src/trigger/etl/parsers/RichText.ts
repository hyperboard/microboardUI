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
    fontHighlight?: string;
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

const getStylesFromSingleElement = (element: any, $: cheerio.Root, item: any): TextStyle => {
    const $element = $(element);
    const styles: any = {
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
        fontColor: $element.css("color") || item?.style?.color || "#000000",
        fontSize: parseInt($element.css("font-size") || "") || parseInt(item?.style?.fontSize || "") || 14,
        fontHighlight: $element.css("background-color") || null,
    };
    const fontHighlight = $element.css("background-color") || null;
    if (fontHighlight) {
        styles.fontHighlight = fontHighlight;
    }
    return styles;
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
            const styles = { ...getStylesFromElement($, child.parent, defaultStyle) };
            const hasHighlight = Boolean(styles.fontHighlight);
            const parsedColor = styles.fontColor;
            const finalColor = parsedColor === "#ffffff" && !hasHighlight ? "#1a1a1a" : parsedColor;
            styles.fontColor = finalColor;
            segments.push({
                text: $(child).text(),
                style: styles,
            });
        } else if (child.type === "tag") {
            segments.push(...parseTextRecursive($, child, defaultStyle));
        }
    });

    return segments;
};

export const parseText = (payload: TextPayload): Array<any | null> => {
    const { item, boardId, userId, order, newItemId, parent } = payload;

    const $ = cheerio.load(item.data?.content! || "<p></p>");

    const width = item.geometry?.width || 100;
    const height = item.geometry?.height || 100;

    const xOffset = width / 2;
    const yOffset = height / 2;

    const getStylesFromElement = (element: any): TextStyle => {
        const $element = $(element);
        const fontColor = $element.css("color") || item?.style?.color || "#000000";
        const styles: any = {
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
            fontColor,
            fontSize: parseInt($element.css("font-size") || "") || parseInt(item?.style?.fontSize || "") || 14,
            fontHighlight: $element.css("background-color") || null,
        };
        const fontHighlight = $element.css("background-color") || null;
        if (fontHighlight && fontHighlight !== "transparent") {
            styles.fontHighlight = fontHighlight;
        }

        if (
            (!fontHighlight || fontHighlight === "transparent") &&
            (fontColor === "#ffffff" || fontColor === "rgb(255,255,255)" || fontColor === "white")
        ) {
            styles.fontColor = "#1a1a1a";
        }
        return styles;
    };

    const parseOrderedOrUnorderedList = (element: cheerio.Element): TextSegment[] => {
        const segments: TextSegment[] = [];
        const $element = $(element);

        $element.find("li").each((_, li) => {
            const $li = $(li);
            const liText = $li.text();
            segments.push({
                text: liText + "\n",
                style: {
                    ...getStylesFromElement(li),
                },
            });
        });

        return segments;
    };

    const parseTextRecursive = (element: cheerio.Element): TextSegment[] => {
        const segments: TextSegment[] = [];
        const $element = $(element);

        if ($element.contents().length === 0) {
            return [];
        }

        try {
            $element.contents().each((_, child) => {
                if (child.type === "text") {
                    const lines = $(child).text().split("\n");
                    lines.forEach((line, index) => {
                        const lineParts = line.split("<br/>");
                        lineParts.forEach((linePart, partIndex) => {
                            if (linePart.trim() !== "") {
                                segments.push({
                                    text: linePart,
                                    style: getStylesFromElement(child.parent),
                                });
                            }
                            if (partIndex < lineParts.length - 1) {
                                segments.push({
                                    text: "\n",
                                    style: getStylesFromElement(child.parent),
                                });
                            }
                        });
                    });
                } else if ((child.type = "tag")) {
                    const tagName = $(child).prop("tagName").toLowerCase();
                    if (tagName === "ol" || tagName === "ul") {
                        const parsedListElements = parseOrderedOrUnorderedList(child);
                        segments.push(...parsedListElements);
                    } else {
                        segments.push(...parseTextRecursive(child));
                    }
                }
            });
        } catch (e) {
            console.error("Failed to parse text segments: ", e);
        }

        return segments;
    };

    const textSegments: TextSegment[] = [];

    $("p, ol, ul").each((_, element) => {
        const $element = $(element);
        const tagName = $element.prop("tagName").toLowerCase();

        if (tagName === "p") {
            textSegments.push(...parseTextRecursive(element));
        } else if (tagName === "ol" || tagName === "ul") {
            textSegments.push(...parseOrderedOrUnorderedList(element));
        }
    });

    let rowCount = 1;
    let longestLineLength = 0;
    let currentLineLength = 0;

    textSegments.forEach((segment) => {
        if (segment.text.includes("\n") || segment.text === "\n") {
            rowCount++;
            longestLineLength = Math.max(longestLineLength, currentLineLength);
            currentLineLength = 0;
        } else {
            currentLineLength += segment.text.length;
        }
    });

    // const rowCount = textSegments.filter((segment) => segment.text.includes("\n") || segment.text === "\n").length + 1;
    const fontSize = textSegments[0]?.style?.fontSize || 14;
    const calculatedHeight = rowCount * fontSize;

    longestLineLength = Math.max(longestLineLength, currentLineLength);
    const averageCharWidth = fontSize * 0.6; // Assuming average character width is 60% of font size (It's not, find better solution)
    const calculatedWidth = longestLineLength * averageCharWidth;

    const copiedItem = { ...item };

    if (!copiedItem.geometry) {
        copiedItem.geometry = {};
    }

    copiedItem.geometry!.height = calculatedHeight;
    if (item.style?.textAlign === "center") {
        copiedItem.geometry!.width = calculatedWidth;
    }

    const pos = getItemPosition(copiedItem, parent);

    const event = {
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
                            fontHighlight: "",
                            ...segment.style,
                        })),
                    },
                ],
                insideOf: "RichText",
                itemType: "RichText",
                transformation: {
                    rotate: parseInt(`${item.geometry?.rotation}` || "0") || 0,
                    scaleX: 1,
                    scaleY: 1,
                    translateX: pos.x,
                    translateY: pos.y,
                    dimension: {
                        width: item.geometry?.width || 0,
                        height: item.geometry?.height || 0,
                    },
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

    return [event];
};

interface TextToInject {
    rawHtml: string;
    text: string;
    fontSize: number;
    fontColor: string;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    parentItem: "Connector" | "Shape" | "Frame" | "Sticker";
    realSize?: string;
}

export const parseTextFromConnector = (connector: Connector): TextToInject => {
    const $ = cheerio.load(connector.captions![0].content);
    const element = $("*").first();

    const styles = { ...getStylesFromSingleElement(element, $, connector) };
    const hasHighlight = Boolean(styles.fontHighlight);
    const parsedColor = styles.fontColor;
    const finalColor =
        parsedColor === "#ffffff" && !hasHighlight ? "#1a1a1a" : connector?.style?.color || parsedColor || "black";
    styles.fontColor = finalColor;

    return {
        rawHtml: connector.captions![0].content,
        text: element.text(),
        maxHeight: 100,
        fontSize: connector?.style?.fontSize ? +connector?.style?.fontSize : 14,
        fontColor: finalColor,
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

    const maxHeight = sticker?.geometry?.height || 300;

    return {
        rawHtml: sticker.data?.content!,
        text: html.text(),
        maxHeight: maxHeight,
        fontSize: 14,
        fontColor: fontColor || "black",
        fontFamily: "Arial",
        maxWidth: sticker?.geometry?.width || 300,
        parentItem: "Sticker",
        realSize: "auto",
    };
};
export const parseTextFromShape = (shape: ShapeItem): TextToInject => {
    const $ = cheerio.load(shape.data?.content!);
    const elementWithColor = $('[style*="color"]');
    const element = $("*").first();

    const fillStyle = shape?.style?.fillColor || "#ffffff";

    const styles = { ...getStylesFromSingleElement(element, $, shape) };
    const parsedColor = styles.fontColor;
    const finalColor =
        (parsedColor === "#ffffff" || parsedColor === "white" || parsedColor === "rgb(255, 255, 255)") &&
        fillStyle === "#ffffff"
            ? "#1a1a1a"
            : shape?.style?.color || parsedColor || "black";
    styles.fontColor = finalColor;

    return {
        rawHtml: shape.data?.content!,
        text: element.text(),
        maxHeight: shape?.geometry?.height || 300,
        fontSize: shape?.style?.fontSize ? +shape?.style?.fontSize : 14,
        fontColor: finalColor,
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

    const getStylesFromTags = (element: cheerio.Cheerio) => {
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
        event: {
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
                        horisontalAlignment:
                            data.parentItem === "Connector" || data.parentItem === "Shape" ? "center" : "left",
                    },
                ],
                insideOf: data.parentItem,
                itemType: "RichText",
                maxWidth: data.maxWidth,
                maxHeight: data.maxHeight,
                placeholderText: " ",
                containerMaxWidth: data.maxWidth,
                // verticalAlignment: "center",
            },
        },
        styles,
    };
};
