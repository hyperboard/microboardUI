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

export type CreateOperation =
    | {
          itemType: "Sticker";
          text?: string;
          color?: string;
      }
    | {
          itemType: "RichText";
          text: string;
      }
    | {
          itemType: "Shape";
          shapeType: ShapeType;
          width?: number;
          height?: number;
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

export function transformCreateOperation(meta: Meta & { operation: CreateOperation }): any {
    const { userId, boardId, operation } = meta;
    if (!isCreateOperation(operation)) {
        throw new Error("Invalid operation");
    }

    const newItemId = v4();

    const baseEventData: BaseEventData = {
        itemType: operation.itemType,
        transformation: {
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0,
        },
    };

    const baseEvent = {
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

    const op = operation as CreateOperation;
    switch (op.itemType) {
        case "Sticker": {
            const stickerOp = operation as Extract<CreateOperation, { itemType: "Sticker" }>;
            const data: StickerData = {
                itemType: stickerOp.itemType,
                transformation: baseEvent.operation.data.transformation,
                backgroundColor: stickerOp.color || "rgb(174, 212, 250)", // Sky Blue default
            };

            if (stickerOp.text) {
                data.text = {
                    children: [
                        {
                            type: "paragraph",
                            horisontalAlignment: "center",
                            children: [
                                {
                                    text: stickerOp.text,
                                    type: "text",
                                    fontSize: 14,
                                    fontColor: "black",
                                    fontFamily: "Arial",
                                    lineHeight: 1.4,
                                    fontHighlight: "",
                                },
                            ],
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

        case "RichText": {
            const textOp = operation as Extract<CreateOperation, { itemType: "RichText" }>;
            const data: RichTextData = {
                itemType: textOp.itemType,
                transformation: baseEvent.operation.data.transformation,
                children: [
                    {
                        type: "paragraph",
                        children: [
                            {
                                text: textOp.text,
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

        case "Shape": {
            const shapeOp = operation as Extract<CreateOperation, { itemType: "Shape" }>;
            const data: ShapeData = {
                itemType: shapeOp.itemType,
                transformation: baseEvent.operation.data.transformation,
                shapeType: shapeOp.shapeType,
                borderColor: "#1a1a1a",
                borderStyle: "solid",
                borderWidth: 2,
                borderOpacity: 1,
                backgroundColor: "transparent",
                backgroundOpacity: 0,
            };

            if (shapeOp.width && shapeOp.height) {
                data.transformation = {
                    ...data.transformation,
                    scaleX: shapeOp.width / 100,
                    scaleY: shapeOp.height / 100,
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

        case "Connector": {
            const connectorOp = operation as Extract<CreateOperation, { itemType: "Connector" }>;
            const data: ConnectorData = {
                itemType: connectorOp.itemType,
                transformation: baseEvent.operation.data.transformation,
                lineColor: "#000000",
                lineStyle: connectorOp.connectorType || "curved",
                lineWidth: 1,
            };

            if (connectorOp.startItemId && connectorOp.endItemId) {
                data.startPoint = {
                    itemId: connectorOp.startItemId,
                    relativeX: connectorOp.position?.x || 50,
                    relativeY: connectorOp.position?.y || 50,
                    pointType: "Fixed",
                };
                data.endPoint = {
                    itemId: connectorOp.endItemId,
                    relativeX: connectorOp.position?.x || 50,
                    relativeY: connectorOp.position?.y || 50,
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

        case "Image": {
            const imageOp = operation as Extract<CreateOperation, { itemType: "Image" }>;
            const data: ImageData = {
                itemType: imageOp.itemType,
                transformation: baseEvent.operation.data.transformation,
                storageLink: imageOp.url,
            };

            if (imageOp.width && imageOp.height) {
                data.imageDimension = {
                    width: imageOp.width,
                    height: imageOp.height,
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

        case "Frame": {
            const frameOp = operation as Extract<CreateOperation, { itemType: "Frame" }>;
            const data: FrameData = {
                itemType: frameOp.itemType,
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

            if (frameOp.width && frameOp.height) {
                data.transformation = {
                    ...data.transformation,
                    scaleX: frameOp.width / 100,
                    scaleY: frameOp.height / 100,
                };
            }

            if (frameOp.position) {
                data.transformation = {
                    ...data.transformation,
                    translateX: frameOp.position.x || 0,
                    translateY: frameOp.position.y || 0,
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

        default:
            throw new Error(`Unsupported item type: ${operation.itemType}`);
    }
}
