import { db } from "../../db";
import { boardEvents } from "../../entities/boardEvents";
import { and, desc, eq, gt } from "drizzle-orm";
import {
    BoardItem,
    BoardEvent,
    BoardSnapshot,
    TextOperation,
    TransformMany,
    TextEditOperation,
    BoardSnapshotRecord,
    ShapeOperation,
    Operation,
    ConnectorOperation,
    TransformationOperation,
} from "./board";
import { boardSnapshots } from "drizzle/entities/boardSnapshots";
import { getBoardByLink } from "../board/Boards/handler";

const noop = () => {};

export async function getLatestSnapshot(boardOrLinkUUID: string): Promise<BoardSnapshotRecord | null> {
    const board = await getBoardByLink(boardOrLinkUUID);

    const boardId = board?.id;

    if (!boardId) {
        throw new Error(`Board UUID, Edit Link UUID, or View Link UUID does not exist`);
    }

    const latestSnapshot = await db
        .select({
            id: boardSnapshots.id,
            boardId: boardSnapshots.boardId,
            snapshot: boardSnapshots.snapshot,
            lastEventOrder: boardSnapshots.lastEventOrder,
            createdAt: boardSnapshots.createdAt,
        })
        .from(boardSnapshots)
        .where(eq(boardSnapshots.boardId, boardId))
        .orderBy(desc(boardSnapshots.createdAt))
        .limit(1);

    return latestSnapshot[0] as unknown as BoardSnapshotRecord | null;
}

/**
 * Gets the actualized board items by applying events after the latest snapshot
 */
export async function getActualizedBoardItems(boardOrLinkUUID: string): Promise<BoardItem[]> {
    const snapshot = await getLatestSnapshot(boardOrLinkUUID);

    if (!snapshot?.snapshot?.items) {
        return [];
    }

    const lastSnapshotEventOrder = snapshot.lastEventOrder;

    const events = await db
        .select({
            eventBody: boardEvents.eventBody,
            boardId: boardEvents.boardId,
        })
        .from(boardEvents)
        .where(and(eq(boardEvents.boardId, snapshot.boardId!), gt(boardEvents.logId, lastSnapshotEventOrder)))
        .orderBy(boardEvents.logId);

    const parsedEvents = events.map((event) => JSON.parse(event.eventBody as string) as BoardEvent);

    return applyEvents(snapshot.snapshot.items, parsedEvents);
}

/**
 * Applies a sequence of events to board items
 */
function applyEvents(items: BoardItem[], events: BoardEvent[]): BoardItem[] {
    return events.reduce(
        (currentItems, event) => {
            return applyEvent(currentItems, event);
        },
        [...items]
    );
}

/**
 * Applies a single event to board items
 */
function applyEvent(items: BoardItem[], event: BoardEvent): BoardItem[] {
    const operation = event.body?.operation;
    if (!operation) return items;

    switch (operation.class) {
        case "RichText":
            if (operation.method === "edit") {
                return applyTextOperation(items, operation as TextOperation);
            } else if (operation.method === "setMaxWidth") {
                // return applyRichTextMaxWidth(items, operation);
                noop();
            } else if (operation.method === "setFontSize") {
                // return applyRichTextFontSize(items, operation);
                noop();
            }
            return items;

        case "Shape":
            return applyShapeOperation(items, operation as ShapeOperation);

        case "Sticker":
            return applyStickerOperation(items, operation as StickerOperation);

        case "Connector":
            return applyConnectorOperation(items, operation as ConnectorOperation);

        case "Transformation":
            return applyTransformationOperation(items, operation as TransformationOperation);

        case "LinkTo":
            return applyLinkToOperation(items, operation);

        case "Board":
            switch (operation.method) {
                case "add":
                    return [...items, operation.data as BoardItem];
                case "remove":
                    return items.filter((item) => item.id !== operation.item);
                default:
                    return items;
            }

        default:
            return items;
    }
}

function applyTextOperation(items: BoardItem[], operation: TextOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }

        const updatedChildren = operation.ops.reduce((children, op) => {
            switch (op.type) {
                case "insert_text":
                    return insertText(children, op.path, op.offset, op.text);
                case "remove_text":
                    const content = children[op.path[0]]?.children[op.path[1]];
                    if (!content) return children;
                    return [
                        ...children.slice(0, op.path[0]),
                        {
                            ...children[op.path[0]],
                            children: [
                                {
                                    ...content,
                                    text:
                                        content.text.slice(0, op.offset) +
                                        content.text.slice(op.offset + op.text.length),
                                },
                            ],
                        },
                        ...children.slice(op.path[0] + 1),
                    ];
                default:
                    return children;
            }
        }, item.text?.children || []);

        return {
            ...item,
            text: {
                ...item.text,
                children: updatedChildren,
            },
        };
    });
}

function applyTransformationOperation(items: BoardItem[], operation: TransformationOperation): BoardItem[] {
    switch (operation.method) {
        // case "translateTo":
        // case "translateBy":
        // case "scaleTo":
        // case "scaleBy":
        //     return applyTranslateOperation(items, operation as TranslateOperation);
        case "transformMany":
            return applyTransformMany(items, operation as TransformMany);
        default:
            return items;
    }
}

function applyTransformMany(items: BoardItem[], operation: TransformMany): BoardItem[] {
    return items.map((item) => {
        const transform = operation.items?.[item.id];
        if (transform) {
            return {
                ...item,
                transformation: {
                    ...item.transformation,
                    ...(transform.translate && {
                        translateX: transform.translate.x,
                        translateY: transform.translate.y,
                    }),
                    ...(transform.scale && {
                        scaleX: transform.scale.x,
                        scaleY: transform.scale.y,
                    }),
                },
            };
        }
        return item;
    });
}

/**
 * Inserts text at the specified position in rich text content
 */
function insertText(children: any[], path: number[], offset: number, text: string): any[] {
    const [blockIndex, ...restPath] = path;
    const block = children[blockIndex];

    if (!block) return children;

    if (restPath.length === 0) {
        const content = block.children[0];
        return [
            ...children.slice(0, blockIndex),
            {
                ...block,
                children: [
                    {
                        ...content,
                        text: content.text.slice(0, offset) + text + content.text.slice(offset),
                    },
                ],
            },
            ...children.slice(blockIndex + 1),
        ];
    }

    return children;
}

function applyShapeOperation(items: BoardItem[], operation: ShapeOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }

        switch (operation.method) {
            case "setBackgroundColor":
                return {
                    ...item,
                    backgroundColor: operation.backgroundColor,
                };
            case "setBackgroundOpacity":
                return {
                    ...item,
                    backgroundOpacity: operation.backgroundOpacity,
                };
            case "setBorderColor":
                return {
                    ...item,
                    borderColor: operation.borderColor,
                };
            case "setBorderOpacity":
                return {
                    ...item,
                    borderOpacity: operation.borderOpacity,
                };
            case "setBorderStyle":
                return {
                    ...item,
                    borderStyle: operation.borderStyle,
                };
            case "setBorderWidth":
                return {
                    ...item,
                    borderWidth: operation.borderWidth,
                };
            case "setShapeType":
                return {
                    ...item,
                    shapeType: operation.shapeType,
                };
            default:
                return item;
        }
    });
}

type StickerOperation = any; // TODO: add ShapeOperation type
function applyStickerOperation(items: BoardItem[], operation: StickerOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }
        switch (operation.method) {
            case "setBackgroundColor":
                return {
                    ...item,
                    backgroundColor: operation.backgroundColor,
                };
            default:
                return item;
        }
    });
}

function applyConnectorOperation(items: BoardItem[], operation: ConnectorOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }

        switch (operation.method) {
            case "setStartPoint":
                return {
                    ...item,
                    startPoint: operation.startPointData,
                };
            case "setEndPoint":
                return {
                    ...item,
                    endPoint: operation.endPointData,
                };
            case "setStartPointerStyle":
                return {
                    ...item,
                    startPointerStyle: operation.startPointerStyle,
                };
            case "setEndPointerStyle":
                return {
                    ...item,
                    endPointerStyle: operation.endPointerStyle,
                };
            case "setLineStyle":
                return {
                    ...item,
                    lineStyle: operation.lineStyle,
                };
            case "setBorderStyle":
                return {
                    ...item,
                    borderStyle: operation.borderStyle,
                };
            case "setLineColor":
                return {
                    ...item,
                    lineColor: operation.lineColor,
                };
            case "setLineWidth":
                return {
                    ...item,
                    lineWidth: operation.lineWidth,
                };
            // case "switchPointers":
            //     return {
            //         ...item,
            //         startPointerStyle: item.endPointerStyle,
            //         endPointerStyle: item.startPointerStyle,
            //     };
            default:
                return item;
        }
    });
}

type DrawingOperation = any; // TODO: add ShapeOperation type
function applyDrawingOperation(items: BoardItem[], operation: DrawingOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }
        return {
            ...item,
            ...operation.data,
        };
    });
}

type FrameOperation = any; // TODO: add ShapeOperation type
function applyFrameOperation(items: BoardItem[], operation: FrameOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }
        return {
            ...item,
            ...operation.data,
        };
    });
}

type ImageOperation = any; // TODO: add ShapeOperation type
function applyImageOperation(items: BoardItem[], operation: ImageOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }
        return {
            ...item,
            ...operation.data,
        };
    });
}

type GroupOperation = any; // TODO: add ShapeOperation type
function applyGroupOperation(items: BoardItem[], operation: GroupOperation): BoardItem[] {
    const groupedItems = items.filter((item) => operation.items.includes(item.id));
    const ungroupedItems = items.filter((item) => !operation.items.includes(item.id));

    return [
        ...ungroupedItems,
        {
            id: operation.groupId,
            type: "group",
            items: groupedItems,
            ...operation.data,
        },
    ];
}

type UngroupOperation = any; // TODO: add ShapeOperation type
function applyUngroupOperation(items: BoardItem[], operation: UngroupOperation): BoardItem[] {
    const group = items.find((item) => item.id === operation.groupId);
    if (!group) return items;

    const otherItems = items.filter((item) => item.id !== operation.groupId);
    return [...otherItems, ...group.items];
}

type LinkToOperation = any; // TODO: add ShapeOperation type
function applyLinkToOperation(items: BoardItem[], operation: LinkToOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }
        return {
            ...item,
            linkTo: operation.data,
        };
    });
}

type CommentOperation = any; // TODO: add ShapeOperation type
function applyCommentOperation(items: BoardItem[], operation: CommentOperation): BoardItem[] {
    const itemIds = Array.isArray(operation.item) ? operation.item : [operation.item];

    return items.map((item) => {
        if (!itemIds.includes(item.id)) {
            return item;
        }
        return {
            ...item,
            comments: [...(item.comments || []), operation.data],
        };
    });
}
