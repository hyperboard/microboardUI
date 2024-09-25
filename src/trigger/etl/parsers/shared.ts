import { FrameItem, ImageItem, ShapeItem, StickyNoteItem, TextItem } from "@mirohq/miro-api";

export const INITIAL_GEOMETRY = {
    sticky_note: {
        square: {
            width: 200,
            height: 200,
        },
        rectangle: {
            width: 230,
            height: 200,
        },
    },
    shape: {
        width: 100,
        height: 100,
    },
    frame: {
        width: 100,
        height: 100,
    },
};

export const getItemPosition = (item: ShapeItem | StickyNoteItem | ImageItem | TextItem, parent?: FrameItem) => {
    const width = item.geometry?.width || 100;
    const height = item.geometry?.height || 100;

    const xOffset = width / 2;
    const yOffset = height / 2;

    const pos = {
        x: (item?.position?.x || 0) - xOffset,
        y: (item?.position?.y || 0) - yOffset,
    };

    if (parent) {
        const frameWidth = parent.geometry?.width || 100;
        const frameHeight = parent.geometry?.height || 100;
        const frameX = (parent?.position?.x || 0) - frameWidth / 2;
        const frameY = (parent?.position?.y || 0) - frameHeight / 2;

        const x = item.position?.x || 0;
        const y = item.position?.y || 0;

        pos.x = x - width / 2 + frameX;
        pos.y = y - height / 2 + frameY;
    }

    return pos;
};
