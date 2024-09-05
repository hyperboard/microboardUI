import { ImageItem } from "@mirohq/miro-api";
import { v4 } from "uuid";

interface ImagePayload {
    item: ImageItem;
    boardId: string;
    userId: string;
    order: number;
}

export const parseImage = (payload: ImagePayload) => {
    const { item, boardId, userId, order } = payload;
    const uuid = v4();

    const width = item.geometry?.width || 100;
    const height = item.geometry?.height || 100;

    const xOffset = width / 2;
    const yOffset = height / 2;

    return {
        userId: userId,
        boardId: boardId,
        eventId: `${userId}:${order}`,
        operation: {
            data: {
                itemType: "Image",
                storageLink: item?.data?.imageUrl,
                imageDimension: {
                    width: item?.geometry?.width || 0,
                    height: item?.geometry?.height || 0,
                },
                transformation: {
                    rotate: 0,
                    scaleX: 0,
                    scaleY: 0,
                    translateX: (item?.position?.x || 0) - xOffset,
                    translateY: (item?.position?.y || 0) - yOffset,
                },
            },
            item: uuid,
            class: "Board",
            method: "add",
        },
    };
};
