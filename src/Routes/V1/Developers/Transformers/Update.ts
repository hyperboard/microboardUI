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
    method: string;
    item: string[];
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
              method: "locked" | "unlocked";
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

function createBaseOperation(operation: UpdateOperation, meta: Meta) {
    return {
        order: meta.order,
        eventId: `${meta.userId}:${meta.order}`,
        userId: meta.userId,
        boardId: meta.boardId,
        operations: [
            {
                class: operation.itemType,
                item: [meta.itemId],
                method: operation.method,
                actualId: `${meta.userId}:${meta.order}`,
            },
        ],
        lastKnownOrder: meta.order,
    };
}

function transformShapeOperation(operation: ShapeUpdateOperation, meta: Meta) {
    const baseOp = createBaseOperation(operation, meta);
    const specificOperation = {
        ...baseOp.operations[0],
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

    return { ...baseOp, operation: specificOperation, operations: [specificOperation] };
}

function transformRichTextOperation(operation: RichTextUpdateOperation, meta: Meta) {
    const baseOp = createBaseOperation(operation, meta);
    let specificOperation = {
        ...baseOp.operations[0],
        ...(operation.selection && { selection: operation.selection }),
        ...(operation.ops && { ops: operation.ops }),
    };

    const methodHandlers: Record<
        RichTextWholeTextOperation["method"],
        (op: RichTextWholeTextOperation) => Record<string, any>
    > = {
        setBlockType: (op) => ({ type: (op as any).type }),
        setFontColor: (op) => ({ fontColor: (op as any).fontColor }),
        setFontStyle: (op) => ({ fontStyleList: (op as any).fontStyleList }),
        setFontFamily: (op) => ({ fontFamily: (op as any).fontFamily }),
        setFontSize: (op) => {
            const sizeOp = op as Extract<RichTextWholeTextOperation, { method: "setFontSize" }>;
            return {
                fontSize: sizeOp.fontSize,
                ...(sizeOp.context && { context: sizeOp.context }),
            };
        },
        setFontHighlight: (op) => ({ fontHighlight: (op as any).fontHighlight }),
        setHorisontalAlignment: (op) => ({ horisontalAlignment: (op as any).horisontalAlignment }),
        setVerticalAlignment: (op) => ({ verticalAlignment: (op as any).verticalAlignment }),
        setMaxWidth: (op) => ({ maxWidth: (op as any).maxWidth }),
        edit: () => ({}),
    };

    const handler = methodHandlers[operation.method];
    if (handler) {
        specificOperation = { ...specificOperation, ...handler(operation) };
    }

    return { ...baseOp, operation: specificOperation, operations: [specificOperation] };
}

function transformStickerOperation(operation: StickerUpdateOperation, meta: Meta) {
    const baseOp = createBaseOperation(operation, meta);
    const specificOperation = {
        ...baseOp.operations[0],
        backgroundColor: operation.backgroundColor,
    };

    return { ...baseOp, operation: specificOperation, operations: [specificOperation] };
}

function transformTransformationOperation(operation: TransformationUpdateOperation, meta: Meta) {
    const baseOp = createBaseOperation(operation, meta);
    const specificOperation = {
        ...baseOp.operations[0],
        ...(operation.method === "translateTo" || operation.method === "translateBy"
            ? { x: operation.x, y: operation.y }
            : {}),
        ...(operation.method === "scaleTo" || operation.method === "scaleBy" ? { x: operation.x, y: operation.y } : {}),
        ...(operation.method === "rotateTo" || operation.method === "rotateBy" ? { degree: operation.degree } : {}),
        ...(operation.method === "scaleToRelativeTo" || operation.method === "scaleByRelativeTo"
            ? { x: operation.x, y: operation.y, point: operation.point }
            : {}),
        ...(operation.method === "scaleByTranslateBy"
            ? { translate: operation.translate, scale: operation.scale }
            : {}),
        ...(operation.method === "deserialize" ? { data: operation.data } : {}),
        ...(operation.method === "locked" || operation.method === "unlocked" ? { locked: operation.locked } : {}),
        ...(operation.method === "transformMany" ? { items: operation.items } : {}),
    };

    return { ...baseOp, operation: specificOperation, operations: [specificOperation] };
}

function transformDrawingOperation(operation: DrawingUpdateOperation, meta: Meta) {
    const baseOp = createBaseOperation(operation, meta);
    const specificOperation = {
        ...baseOp.operations[0],
        ...(operation.method === "setStrokeColor" && { color: operation.color }),
        ...(operation.method === "setStrokeWidth" && {
            width: operation.width,
            prevWidth: operation.prevWidth,
        }),
        ...(operation.method === "setStrokeOpacity" && { opacity: operation.opacity }),
        ...(operation.method === "setStrokeStyle" && { style: operation.style }),
    };

    return { ...baseOp, operation: specificOperation, operations: [specificOperation] };
}

function transformFrameOperation(operation: FrameUpdateOperation, meta: Meta) {
    const baseOp = createBaseOperation(operation, meta);
    const specificOperation = {
        ...baseOp.operations[0],
        ...(operation.method === "setBackgroundColor" && { backgroundColor: operation.backgroundColor }),
        ...(operation.method === "setCanChangeRatio" && { canChangeRatio: operation.canChangeRatio }),
        ...(operation.method === "setFrameType" && {
            shapeType: operation.shapeType,
            prevShapeType: operation.prevShapeType,
        }),
        ...(operation.method === "addChild" && { childId: operation.childId }),
        ...(operation.method === "removeChild" && { childId: operation.childId }),
    };

    return { ...baseOp, operation: specificOperation, operations: [specificOperation] };
}

const transformers = {
    Shape: transformShapeOperation,
    RichText: transformRichTextOperation,
    Sticker: transformStickerOperation,
    Transformation: transformTransformationOperation,
    Drawing: transformDrawingOperation,
    Frame: transformFrameOperation,
} as const;

function createTransformationOperation(
    itemId: string,
    position: { x?: number; y?: number } | undefined,
    scale?: { x?: number; y?: number }
): TransformationUpdateOperation | null {
    if (!position && !scale) return null;

    if (position && !scale) {
        return {
            itemType: "Transformation",
            method: "translateTo",
            x: position.x ?? 0,
            y: position.y ?? 0,
            item: [itemId],
        };
    }

    const operation: TransformationUpdateOperation = {
        itemType: "Transformation",
        method: "scaleByTranslateBy",
        translate: {
            x: position?.x ?? 0,
            y: position?.y ?? 0,
        },
        scale: {
            x: scale?.x ?? 1,
            y: scale?.y ?? 1,
        },
        item: [itemId],
    };

    return operation;
}

export function transformUpdateOperation(operation: UpdateOperation, meta: Meta): any {
    const transformer = transformers[operation.itemType];
    if (!transformer) {
        throw new Error(`Unsupported item type: ${operation.itemType}`);
    }

    const mainOperation = transformer(operation as any, meta);

    // Handle position/transformation if present in the operation
    const position = (operation as any).position;
    const scale = (operation as any).scale;
    const transformOperation = createTransformationOperation(meta.itemId, position, scale);

    if (transformOperation) {
        const transformResult = transformTransformationOperation(transformOperation, meta);
        return {
            ...mainOperation,
            operations: [...mainOperation.operations, transformResult.operations[0]],
        };
    }

    return mainOperation;
}
