import { FrameItem, ImageItem } from "@mirohq/miro-api";
import { getItemPosition } from "./shared";

interface ImagePayload {
    item: ImageItem & { dimensions?: { width: number; height: number } };
    boardId: string;
    userId: string;
    order: number;
    newItemId: string;
    parent?: FrameItem;
}

export const parseImage = (payload: ImagePayload): Array<any | null> => {
    const { item, boardId, userId, order, parent, newItemId } = payload;

    const width = item?.geometry?.width || 0;
    const height = item?.geometry?.height || 0;
    const imageDimension = {
        width,
        height,
    };

    if (item.dimensions) {
        imageDimension.width = item.dimensions?.width || 0;
        imageDimension.height = item.dimensions?.height || 0;
    }

    const pos = getItemPosition(item, parent);

    const event = {
        userId: userId,
        boardId: boardId,
        eventId: `${userId}:${order}`,
        operation: {
            data: {
                itemType: "Image",
                storageLink: item?.data?.imageUrl,
                imageDimension: {
                    width: item.dimensions?.width || item?.geometry?.width || 0,
                    height: item.dimensions?.height || item?.geometry?.height || 0,
                },
                transformation: {
                    // rotate: parseInt(`${item.geometry?.rotation}` || "0") || 0,
                    scaleX: width / imageDimension.width,
                    scaleY: height / imageDimension.height,
                    translateX: pos.x,
                    translateY: pos.y,
                    // dimension: {
                    //     width: item.dimensions?.width || item?.geometry?.width || 0,
                    //     height: item.dimensions?.height || item?.geometry?.height || 0,
                    // },
                },
            },
            item: newItemId,
            class: "Board",
            method: "add",
        },
    };

    return [event];
};
