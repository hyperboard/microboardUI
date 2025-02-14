import { Meta } from "./types";
import { v4 } from "uuid";

type ShapeType =
    | "RoundedRectangle"
    | "Circle"
    | "Triangle"
    | "Rhombus"
    | "SpeachBubble"
    | "Parallelogram"
    | "Star"
    | "ArrowRight"
    | "ArrowLeft"
    | "ArrowLeftRight"
    | "Pentagon"
    | "Octagon"
    | "Hexagon"
    | "PredefinedProcess"
    | "Trapezoid"
    | "Cloud"
    | "Cross"
    | "Cylinder"
    | "BracesRight"
    | "BracesLeft";

type ItemType = "Sticker" | "RichText" | "Shape" | "Connector" | "Image" | "Frame" | "Drawing";

type RichText = {
    text: string;
    fontSize?: number;
    fontColor?: string;
    fontFamily?: string;
    lineHeight?: number;
    fontHighlight?: string;
};

export type CreateOperation =
    | {
          itemType: "Sticker";
          text?: string | RichText;
          color?: string;
          position?: {
              x?: number;
              y?: number;
          };
      }
    | {
          itemType: "Shape";
          shapeType: ShapeType;
          text?: RichText;
          width?: number;
          height?: number;
          position?: {
              x?: number;
              y?: number;
          };
      }
    | {
          itemType: "RichText";
          text: string;
          position?: {
              x?: number;
              y?: number;
          };
      }
    | {
          itemType: "Connector";
          connectorType: string;
          position?: {
              x?: number;
              y?: number;
          };
          startItemId?: string;
          endItemId?: string;
      }
    | {
          itemType: "Image";
          url: string;
          width?: number;
          height?: number;
          position?: {
              x?: number;
              y?: number;
          };
      }
    | {
          itemType: "Frame";
          position?: {
              x?: number;
              y?: number;
          };
          width?: number;
          height?: number;
          items?: string[];
      }
    | {
          itemType: "Drawing";
          points: {
              x: number;
              y: number;
          }[];
          lineColor: string;
          lineWidth: number;
          lineOpacity: number;
          position?: {
              x?: number;
              y?: number;
          };
      };

interface BaseEventData {
    itemType: ItemType;
    transformation: {
        scaleX: number;
        scaleY: number;
        translateX: number;
        translateY: number;
    };
}

interface StickerData extends BaseEventData {
    backgroundColor: string;
    text?: {
        children: Array<{
            type: string;
            horisontalAlignment: string;
            children: Array<{
                text: string;
                type: string;
                fontSize: number;
                fontColor: string;
                fontFamily: string;
                lineHeight: number;
                fontHighlight: string;
            }>;
        }>;
        realSize: string;
        placeholderText: string;
    };
}

interface RichTextData extends BaseEventData {
    children: Array<{
        type: string;
        children: Array<{
            text: string;
            type: string;
            fontColor: string;
            fontFamily: string;
            fontHighlight: string;
            fontSize: number;
            lineHeight: number;
        }>;
    }>;
    insideOf: string;
    placeholderText: string;
    verticalAlignment: string;
}

interface ShapeData extends BaseEventData {
    shapeType: ShapeType;
    borderColor: string;
    borderStyle: "solid" | "dot" | "dash";
    borderWidth: number;
    borderOpacity: number;
    backgroundColor: string;
    backgroundOpacity: number;
}

interface ConnectorData extends BaseEventData {
    lineColor: string;
    lineStyle: string;
    lineWidth: number;
    startPoint?: {
        itemId: string;
        relativeX: number;
        relativeY: number;
        pointType: string;
    };
    endPoint?: {
        itemId: string;
        relativeX: number;
        relativeY: number;
        pointType: string;
    };
}

interface ImageData extends BaseEventData {
    storageLink: string;
    imageDimension?: {
        width: number;
        height: number;
    };
}

interface FrameData extends BaseEventData {
    shapeType: string;
    borderColor: string;
    canChangeRatio: boolean;
    borderStyle: string;
    borderWidth: number;
    borderOpacity: number;
    backgroundColor: string;
    backgroundOpacity: number;
}

function isCreateOperation(op: any): op is CreateOperation {
    return typeof op === "object" && op !== null && "itemType" in op;
}

function createBaseEvent(
    userId: number | string,
    boardId: string,
    meta: Meta,
    newItemId: string,
    itemType: ItemType,
    operation: CreateOperation
): any {
    const baseEventData: BaseEventData = {
        itemType,
        transformation: {
            scaleX: 1,
            scaleY: 1,
            translateX: operation.position?.x || 0,
            translateY: operation.position?.y || 0,
        },
    };

    return {
        userId,
        boardId,
        eventId: `${userId}:${meta.order || 0}`,
        operation: {
            item: newItemId,
            class: "Board",
            method: "add",
            data: baseEventData,
        },
    };
}

function transformTextToRichTextData(text: string | RichText) {
    if (typeof text === "string") {
        return {
            text,
            type: "text",
            fontSize: 14,
            fontColor: "black",
            fontFamily: "Arial",
            lineHeight: 1.4,
            fontHighlight: "",
        };
    }
    return {
        text: text.text,
        type: "text",
        fontSize: text.fontSize || 14,
        fontColor: text.fontColor || "black",
        fontFamily: text.fontFamily || "Arial",
        lineHeight: text.lineHeight || 1.4,
        fontHighlight: text.fontHighlight || "",
    };
}

function transformStickerOperation(baseEvent: any, operation: Extract<CreateOperation, { itemType: "Sticker" }>): any {
    const data: StickerData = {
        itemType: operation.itemType,
        transformation: baseEvent.operation.data.transformation,
        backgroundColor: operation.color || "rgb(174, 212, 250)", // Sky Blue default
    };

    if (operation.text) {
        const textData = transformTextToRichTextData(operation.text);
        data.text = {
            children: [
                {
                    type: "paragraph",
                    horisontalAlignment: "center",
                    children: [textData],
                },
            ],
            realSize: "auto",
            placeholderText: " ",
        };
    }

    return {
        ...baseEvent,
        operation: {
            ...baseEvent.operation,
            data,
        },
    };
}

function transformRichTextOperation(
    baseEvent: any,
    operation: Extract<CreateOperation, { itemType: "RichText" }>
): any {
    const data: RichTextData = {
        itemType: operation.itemType,
        transformation: baseEvent.operation.data.transformation,
        children: [
            {
                type: "paragraph",
                children: [
                    {
                        text: operation.text,
                        type: "text",
                        fontColor: "black",
                        fontFamily: "Arial",
                        fontHighlight: "",
                        fontSize: 14,
                        lineHeight: 1.4,
                    },
                ],
            },
        ],
        insideOf: "RichText",
        placeholderText: "Type something",
        verticalAlignment: "center",
    };

    return {
        ...baseEvent,
        operation: {
            ...baseEvent.operation,
            data,
        },
    };
}

function transformShapeOperation(baseEvent: any, operation: Extract<CreateOperation, { itemType: "Shape" }>): any {
    const data: ShapeData = {
        itemType: operation.itemType,
        transformation: baseEvent.operation.data.transformation,
        shapeType: operation.shapeType,
        borderColor: "#1a1a1a",
        borderStyle: "solid",
        borderWidth: 2,
        borderOpacity: 1,
        backgroundColor: "transparent",
        backgroundOpacity: 0,
    };

    if (operation.width && operation.height) {
        data.transformation = {
            ...data.transformation,
            scaleX: operation.width / 100,
            scaleY: operation.height / 100,
        };
    }

    if (operation.text) {
        const textData = transformTextToRichTextData(operation.text);
        (data as any).text = {
            children: [
                {
                    type: "paragraph",
                    horisontalAlignment: "center",
                    children: [textData],
                },
            ],
            realSize: "auto",
            placeholderText: " ",
        };
    }

    return {
        ...baseEvent,
        operation: {
            ...baseEvent.operation,
            data,
        },
    };
}

function transformConnectorOperation(
    baseEvent: any,
    operation: Extract<CreateOperation, { itemType: "Connector" }>
): any {
    const data: ConnectorData = {
        itemType: operation.itemType,
        transformation: baseEvent.operation.data.transformation,
        lineColor: "#000000",
        lineStyle: operation.connectorType || "curved",
        lineWidth: 1,
    };

    if (operation.startItemId && operation.endItemId) {
        data.startPoint = {
            itemId: operation.startItemId,
            relativeX: operation.position?.x || 50,
            relativeY: operation.position?.y || 50,
            pointType: "Fixed",
        };
        data.endPoint = {
            itemId: operation.endItemId,
            relativeX: operation.position?.x || 50,
            relativeY: operation.position?.y || 50,
            pointType: "Fixed",
        };
    }

    return {
        ...baseEvent,
        operation: {
            ...baseEvent.operation,
            data,
        },
    };
}

function transformImageOperation(baseEvent: any, operation: Extract<CreateOperation, { itemType: "Image" }>): any {
    const data: ImageData = {
        itemType: operation.itemType,
        transformation: baseEvent.operation.data.transformation,
        storageLink: operation.url,
    };

    if (operation.width && operation.height) {
        data.imageDimension = {
            width: operation.width,
            height: operation.height,
        };
        data.transformation = {
            ...data.transformation,
            scaleX: 1,
            scaleY: 1,
        };
    }

    return {
        ...baseEvent,
        operation: {
            ...baseEvent.operation,
            data,
        },
    };
}

function transformFrameOperation(baseEvent: any, operation: Extract<CreateOperation, { itemType: "Frame" }>): any {
    const data: FrameData = {
        itemType: operation.itemType,
        transformation: baseEvent.operation.data.transformation,
        shapeType: "Custom",
        borderColor: "#1a1a1a",
        canChangeRatio: true,
        borderStyle: "solid",
        borderWidth: 1,
        borderOpacity: 1,
        backgroundColor: "#ffffff",
        backgroundOpacity: 1,
    };

    if (operation.width && operation.height) {
        data.transformation = {
            ...data.transformation,
            scaleX: operation.width / 100,
            scaleY: operation.height / 100,
        };
    }

    if (operation.position) {
        data.transformation = {
            ...data.transformation,
            translateX: operation.position.x || 0,
            translateY: operation.position.y || 0,
        };
    }

    return {
        ...baseEvent,
        operation: {
            ...baseEvent.operation,
            data,
        },
    };
}

function transformDrawingOperation(baseEvent: any, operation: Extract<CreateOperation, { itemType: "Drawing" }>): any {
    return {
        ...baseEvent,
        operation: {
            ...baseEvent.operation,
            data: {
                ...baseEvent.operation.data,
                points: operation.points,
                lineColor: operation.lineColor,
                lineWidth: operation.lineWidth,
                lineOpacity: operation.lineOpacity,
            },
        },
    };
}

const transformers = {
    Sticker: transformStickerOperation,
    RichText: transformRichTextOperation,
    Shape: transformShapeOperation,
    Connector: transformConnectorOperation,
    Image: transformImageOperation,
    Frame: transformFrameOperation,
    Drawing: transformDrawingOperation,
} as const;

export function transformCreateOperation(meta: Meta & { operation: CreateOperation }): any {
    const { userId, boardId, operation } = meta;
    if (!isCreateOperation(operation)) {
        throw new Error("Invalid operation");
    }

    const newItemId = v4();
    const baseEvent = createBaseEvent(userId, boardId, meta, newItemId, operation.itemType, operation);

    const transformer = transformers[operation.itemType];
    if (!transformer) {
        throw new Error(`Unsupported item type: ${operation.itemType}`);
    }

    return transformer(baseEvent, operation as any);
}
