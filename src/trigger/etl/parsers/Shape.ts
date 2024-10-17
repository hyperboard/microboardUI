import { FrameItem, ShapeItem } from "@mirohq/miro-api";
import { makeInjectedText, parseTextFromShape } from "./RichText";
import { getItemPosition } from "./shared";

interface ShapePayload {
    item: ShapeItem;
    boardId: string;
    userId: string;
    order: number;
    newItemId: string;
    parent?: FrameItem;
}

const shapeTypes = {
    round_rectangle: "RoundedRectangle",
    circle: "Circle",
    triangle: "Triangle",
    rhombus: "Rhombus",
    wedge_round_rectangle_callout: "SpeachBubble",
    parallelogram: "Parallelogram",
    star: "Star",
    right_arrow: "ArrowRight",
    left_arrow: "ArrowLeft",
    rectangle: "Rectangle",
    left_right_arrow: "ArrowLeftRight",
    pentagon: "Pentagon",
    octagon: "Octagon",
    hexagon: "Hexagon",
    flow_chart_predefined_process: "PredefinedProcess",
    trapezoid: "Trapezoid",
    cloud: "Cloud",
    cross: "Cross",
    can: "Cylinder",
    left_brace: "BracesRight",
    right_brace: "BracesLeft",
};

const borderStyles = {
    normal: "solid",
    dotted: "dot",
    dashed: "dash",
};

export const parseShape = (payload: ShapePayload): Array<any | null> => {
    const { item, boardId, userId, order, parent, newItemId } = payload;

    const width = item.geometry?.width || 100;
    const height = item.geometry?.height || 100;

    const pos = getItemPosition(item, parent);

    const fillStyle = {
        color: item?.style?.fillColor || "#ffffff",
        opacity: item?.style?.fillOpacity ? Number(item?.style?.fillOpacity) : 1.0,
    };

    const event: any = {
        userId: userId,
        boardId: boardId,
        eventId: `${userId}:${order}`,
        operation: {
            data: {
                itemType: "Shape",
                shapeType: item?.data?.shape ? shapeTypes[item?.data?.shape as keyof typeof shapeTypes] : "Rectangle",
                borderColor: item?.style?.borderColor || "#1a1a1a",
                borderStyle: item?.style?.borderStyle
                    ? borderStyles[item?.style?.borderStyle as keyof typeof borderStyles]
                    : "solid",
                borderWidth: item?.style?.borderWidth || 2,
                borderOpacity: parseFloat(item?.style?.borderOpacity || "1") || 1,
                transformation: {
                    // rotate: parseInt(`${item.geometry?.rotation}` || "0") || 0,
                    scaleX: width / 100,
                    scaleY: height / 100,
                    translateX: pos.x,
                    translateY: pos.y,
                    // dimension: {
                    //     width: width,
                    //     height: height,
                    // },
                },
                backgroundColor: fillStyle.color === "#ffffff" ? "transparent" : fillStyle.color,
                backgroundOpacity: fillStyle.color === "#ffffff" ? 0 : fillStyle.opacity,
            },
            item: newItemId,
            class: "Board",
            method: "add",
        },
    };

    if (item?.data?.content?.length) {
        const parsedText = parseTextFromShape(item);
        const textBlock = { ...makeInjectedText(parsedText) };
        event.operation.data.text = textBlock.event.text;
    }

    return [event];
};
