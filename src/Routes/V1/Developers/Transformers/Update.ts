import { Meta } from "./types";

// Basic Operation type definition for text operations
type Operation = {
    type: string;
    path: number[];
    offset?: number;
    text?: string;
    marks?: unknown[];
};

export const LinePatterns = {
    solid: [] as number[],
    dot: [1, 2],
    dash: [10, 10],
    longDash: [20, 5],
    dotDash: [15, 3, 3, 3],
    tripleDotDash: [20, 3, 3, 3, 3, 3, 3, 3],
    looseDoubleDotDash: [12, 3, 3],
};

export type BorderStyle = keyof typeof LinePatterns;

export const Frames = {
    Custom: "Custom",
    Frame16x9: "Frame16x9",
    Frame4x3: "Frame4x3",
    A4: "A4",
    Letter: "Letter",
    Frame1x1: "Frame1x1",
} as const;

export type FrameType = keyof typeof Frames;

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

// Text style types
type TextStyle =
    | "bold"
    | "italic"
    | "oblique"
    | "underline"
    | "overline"
    | "line-through"
    | "subscript"
    | "superscript";
type BlockType =
    | "paragraph"
    | "ul_list"
    | "ol_list"
    | "list_item"
    | "code_block"
    | "heading_one"
    | "heading_two"
    | "heading_three"
    | "block-quote";
type VerticalAlignment = "top" | "center" | "bottom";
type HorisontalAlignment = "left" | "center" | "right";
type SelectionContext =
    | "SelectUnderPointer"
    | "HoverUnderPointer"
    | "EditUnderPointer"
    | "EditTextUnderPointer"
    | "SelectByRect"
    | "None";

// Shape operation types
type ShapeUpdateOperation = {
    itemType: "Shape";
    method:
        | "setBackgroundColor"
        | "setBackgroundOpacity"
        | "setBorderColor"
        | "setBorderOpacity"
        | "setBorderStyle"
        | "setBorderWidth"
        | "setShapeType";
    backgroundColor?: string;
    backgroundOpacity?: number;
    borderColor?: string;
    borderOpacity?: number;
    borderStyle?: BorderStyle;
    borderWidth?: number;
    prevBorderWidth?: number;
    shapeType?: ShapeType;
};

// RichText operation types
type RichTextBaseOperation = {
    itemType: "RichText";
    selection?: {
        anchor: { offset: number; path: number[] };
        focus: { offset: number; path: number[] };
    };
    ops?: Operation[];
};

type RichTextWholeTextOperation = RichTextBaseOperation &
    (
        | {
              method: "setBlockType";
              type: BlockType;
          }
        | {
              method: "setFontColor";
              fontColor: string;
          }
        | {
              method: "setFontStyle";
              fontStyleList: TextStyle[];
          }
        | {
              method: "setFontFamily";
              fontFamily: string;
          }
        | {
              method: "setFontSize";
              fontSize: number | "auto";
              context?: SelectionContext;
          }
        | {
              method: "setFontHighlight";
              fontHighlight: string;
          }
        | {
              method: "setHorisontalAlignment";
              horisontalAlignment: HorisontalAlignment;
          }
        | {
              method: "setVerticalAlignment";
              verticalAlignment: VerticalAlignment;
          }
        | {
              method: "setMaxWidth";
              maxWidth: number | undefined;
          }
        | {
              method: "edit";
          }
    );

type RichTextUpdateOperation = RichTextWholeTextOperation;

// Sticker operation types
type StickerUpdateOperation = {
    itemType: "Sticker";
    method: "setBackgroundColor";
    backgroundColor: string;
};

// Transformation types
interface TransformationData {
    translateX: number;
    translateY: number;
    scaleX: number;
    scaleY: number;
    rotate: number;
}

type TransformationBaseOperation = {
    itemType: "Transformation";
    timestamp?: number;
};

type TransformationUpdateOperation = TransformationBaseOperation &
    (
        | {
              method: "translateTo" | "translateBy";
              x: number;
              y: number;
          }
        | {
              method: "scaleTo" | "scaleBy";
              x: number;
              y: number;
          }
        | {
              method: "rotateTo" | "rotateBy";
              degree: number;
          }
        | {
              method: "scaleToRelativeTo" | "scaleByRelativeTo";
              x: number;
              y: number;
              point: { x: number; y: number };
          }
        | {
              method: "scaleByTranslateBy";
              translate: { x: number; y: number };
              scale: { x: number; y: number };
          }
        | {
              method: "deserialize";
              data: TransformationData;
          }
        | {
              method: "locked";
              locked: boolean;
          }
        | {
              method: "unlocked";
              locked: boolean;
          }
        | {
              method: "transformMany";
              items: {
                  [key: string]: {
                      method: "scaleByTranslateBy" | "scaleTo" | "scaleBy" | "translateTo" | "translateBy";
                      translate?: { x: number; y: number };
                      scale?: { x: number; y: number };
                      x?: number;
                      y?: number;
                  };
              };
          }
    );

// Drawing operation types
type DrawingBaseOperation = {
    itemType: "Drawing";
    method: "setStrokeColor" | "setStrokeWidth" | "setStrokeOpacity" | "setStrokeStyle";
};

type DrawingUpdateOperation = DrawingBaseOperation &
    (
        | {
              method: "setStrokeColor";
              color: string;
          }
        | {
              method: "setStrokeWidth";
              width: number;
              prevWidth: number;
          }
        | {
              method: "setStrokeOpacity";
              opacity: number;
          }
        | {
              method: "setStrokeStyle";
              style: BorderStyle;
          }
    );

// Frame operation types
type FrameBaseOperation = {
    itemType: "Frame";
    method: "setBackgroundColor" | "setCanChangeRatio" | "setFrameType" | "addChild" | "removeChild";
};

type FrameUpdateOperation = FrameBaseOperation &
    (
        | {
              method: "setBackgroundColor";
              backgroundColor: string;
          }
        | {
              method: "setCanChangeRatio";
              canChangeRatio: boolean;
          }
        | {
              method: "setFrameType";
              shapeType: FrameType;
              prevShapeType: FrameType;
          }
        | {
              method: "addChild";
              childId: string;
          }
        | {
              method: "removeChild";
              childId: string;
          }
    );

export type UpdateOperation =
    | ShapeUpdateOperation
    | RichTextUpdateOperation
    | StickerUpdateOperation
    | TransformationUpdateOperation
    | DrawingUpdateOperation
    | FrameUpdateOperation;

export function transformUpdateOperation(operation: UpdateOperation, meta: Meta): any {
    const baseOperation = {
        class: operation.itemType,
        item: [meta.itemId],
    };

    let specificOperation;

    switch (operation.itemType) {
        case "Shape":
            specificOperation = {
                ...baseOperation,
                method: operation.method,
                ...(operation.backgroundColor !== undefined && { backgroundColor: operation.backgroundColor }),
                ...(operation.backgroundOpacity !== undefined && { backgroundOpacity: operation.backgroundOpacity }),
                ...(operation.borderColor !== undefined && { borderColor: operation.borderColor }),
                ...(operation.borderOpacity !== undefined && { borderOpacity: operation.borderOpacity }),
                ...(operation.borderStyle !== undefined && { borderStyle: operation.borderStyle }),
                ...(operation.borderWidth !== undefined && {
                    borderWidth: operation.borderWidth,
                    prevBorderWidth: operation.prevBorderWidth,
                }),
                ...(operation.shapeType !== undefined && { shapeType: operation.shapeType }),
            };
            break;
        case "RichText": {
            // Create base operation with common fields
            specificOperation = {
                ...baseOperation,
                method: operation.method,
                ...(operation.selection && { selection: operation.selection }),
                ...(operation.ops && { ops: operation.ops }),
            };

            // Add method-specific properties
            switch (operation.method) {
                case "setBlockType":
                    specificOperation = {
                        ...specificOperation,
                        type: operation.type,
                    };
                    break;
                case "setFontColor":
                    specificOperation = {
                        ...specificOperation,
                        fontColor: operation.fontColor,
                    };
                    break;
                case "setFontStyle":
                    specificOperation = {
                        ...specificOperation,
                        fontStyleList: operation.fontStyleList,
                    };
                    break;
                case "setFontFamily":
                    specificOperation = {
                        ...specificOperation,
                        fontFamily: operation.fontFamily,
                    };
                    break;
                case "setFontSize":
                    specificOperation = {
                        ...specificOperation,
                        fontSize: operation.fontSize,
                        ...(operation.context && { context: operation.context }),
                    };
                    break;
                case "setFontHighlight":
                    specificOperation = {
                        ...specificOperation,
                        fontHighlight: operation.fontHighlight,
                    };
                    break;
                case "setHorisontalAlignment":
                    specificOperation = {
                        ...specificOperation,
                        horisontalAlignment: operation.horisontalAlignment,
                    };
                    break;
                case "setVerticalAlignment":
                    specificOperation = {
                        ...specificOperation,
                        verticalAlignment: operation.verticalAlignment,
                    };
                    break;
                case "setMaxWidth":
                    specificOperation = {
                        ...specificOperation,
                        maxWidth: operation.maxWidth,
                    };
                    break;
                case "edit":
                    // No additional properties needed for edit
                    break;
            }
            break;
        }
        case "Sticker":
            specificOperation = {
                ...baseOperation,
                method: operation.method,
                backgroundColor: operation.backgroundColor,
            };
            break;
        case "Transformation":
            specificOperation = {
                ...baseOperation,
                method: operation.method,
                ...(operation.timestamp && { timestamp: operation.timestamp }),
                ...(operation.method === "translateTo" || operation.method === "translateBy"
                    ? { x: operation.x, y: operation.y }
                    : {}),
                ...(operation.method === "scaleTo" || operation.method === "scaleBy"
                    ? { x: operation.x, y: operation.y }
                    : {}),
                ...(operation.method === "rotateTo" || operation.method === "rotateBy"
                    ? { degree: operation.degree }
                    : {}),
                ...(operation.method === "scaleToRelativeTo" || operation.method === "scaleByRelativeTo"
                    ? { x: operation.x, y: operation.y, point: operation.point }
                    : {}),
                ...(operation.method === "scaleByTranslateBy"
                    ? { translate: operation.translate, scale: operation.scale }
                    : {}),
                ...(operation.method === "deserialize" ? { data: operation.data } : {}),
                ...(operation.method === "locked" || operation.method === "unlocked"
                    ? { locked: operation.locked }
                    : {}),
                ...(operation.method === "transformMany" ? { items: operation.items } : {}),
            };
            break;
        case "Drawing":
            specificOperation = {
                ...baseOperation,
                method: operation.method,
                ...(operation.method === "setStrokeColor" && { color: operation.color }),
                ...(operation.method === "setStrokeWidth" && {
                    width: operation.width,
                    prevWidth: operation.prevWidth,
                }),
                ...(operation.method === "setStrokeOpacity" && { opacity: operation.opacity }),
                ...(operation.method === "setStrokeStyle" && { style: operation.style }),
            };
            break;
        case "Frame":
            specificOperation = {
                ...baseOperation,
                method: operation.method,
                ...(operation.method === "setBackgroundColor" && { backgroundColor: operation.backgroundColor }),
                ...(operation.method === "setCanChangeRatio" && { canChangeRatio: operation.canChangeRatio }),
                ...(operation.method === "setFrameType" && {
                    shapeType: operation.shapeType,
                    prevShapeType: operation.prevShapeType,
                }),
                ...(operation.method === "addChild" && { childId: operation.childId }),
                ...(operation.method === "removeChild" && { childId: operation.childId }),
            };
            break;
        default:
            throw new Error(`Unsupported item type: ${(operation as any).itemType}`);
    }

    const eventBody = {
        order: meta.order,

        eventId: `${meta.userId}:${meta.order}`,
        userId: meta.userId,
        boardId: meta.boardId,
        operation: specificOperation,
        operations: [
            {
                ...specificOperation,
                actualId: `${meta.userId}:${meta.order}`,
            },
        ],
        lastKnownOrder: meta.order,
    };

    return eventBody;
}
