import { Board } from "Board";
import { Quality, Resolution } from "./types";
import { DrawingContext } from "Board/Items/DrawingContext";
import { Camera } from "Board/Camera";
import { drawExportBackground } from "./utils";
import { Selection } from "Board/Selection";
import { CANVAS_EXPORT_BACKGROUND } from "./const";

export function exportBoardSnapshot(
    board: Board,
    quality: Quality,
    selection?: Selection,
): void {
    const boardId = board.getBoardId();
    const resolution = Resolution[quality];

    const canvas = document.createElement("canvas");

    const { width, height } = board.camera.window;
    canvas.width = Math.floor(width * window.devicePixelRatio) * resolution;
    canvas.height = Math.floor(height * window.devicePixelRatio) * resolution;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Export Board: Unable to get 2D context");
        return;
    }

    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = CANVAS_EXPORT_BACKGROUND;
    ctx.fill();

    const camera = new Camera();
    camera.matrix = board.camera.matrix.copy();
    const context = new DrawingContext(camera, ctx);

    context.setCamera(camera);
    context.ctx.setTransform(
        resolution * context.DPI, 0, 0, resolution * context.DPI, 0, 0
    );
    context.matrix.applyToContext(context.ctx);

    const { left, top, right, bottom } = camera.getMbr();
    const inView = board.items.index.getRectsEnclosedOrCrossed(left, top, right, bottom);
    for (const item of inView) {
        item.render(context);
    }

    const dataURL = context.ctx.canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `board-${boardId}.png`;
    link.click();
}
