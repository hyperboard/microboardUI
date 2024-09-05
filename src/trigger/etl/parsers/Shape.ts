import { ShapeItem } from "@mirohq/miro-api";
import { v4 } from "uuid";
import { makeInjectedText, parseTextFromShape } from "./RichText";

interface ShapePayload {
    item: ShapeItem;
    boardId: string;
    userId: string;
    order: number;
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

export const parseShape = (payload: ShapePayload) => {
    const { item, boardId, userId, order } = payload;
    const uuid = v4();

    const fillStyle = {
        color: item?.style?.fillColor || "#ffffff",
        opacity: item?.style?.fillOpacity ? Number(item?.style?.fillOpacity) : 1.0,
    };

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
                itemType: "Shape",
                shapeType: item?.data?.shape ? shapeTypes[item?.data?.shape as keyof typeof shapeTypes] : "Rectangle",
                borderColor: item?.style?.borderColor || "#1a1a1a",
                borderStyle: item?.style?.borderStyle
                    ? borderStyles[item?.style?.borderStyle as keyof typeof borderStyles]
                    : "solid",
                borderWidth: item?.style?.borderWidth || 2,
                borderOpacity: item?.style?.borderOpacity || 1,
                transformation: {
                    rotate: 0,
                    scaleX: width / 100,
                    scaleY: height / 100,
                    translateX: (item?.position?.x || 0) - xOffset,
                    translateY: (item?.position?.y || 0) - yOffset,
                },
                backgroundColor: fillStyle.color === "#ffffff" ? "transparent" : fillStyle.color,
                backgroundOpacity: fillStyle.color === "#ffffff" ? 0 : fillStyle.opacity,
            },
            item: uuid,
            class: "Board",
            method: "add",
        },
    };

    if (item?.data?.content?.length) {
        const parsedText = parseTextFromShape(item);
        const textBlock = makeInjectedText(parsedText);
        event.operation.data.text = textBlock.text;
    }

    return event;
};
