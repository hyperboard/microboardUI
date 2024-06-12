import express, { Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { MediaDAL } from "./MediaDAL";

export function createMediaRouter(media: MediaDAL, logger: Logger) {
    const router = express.Router();

    router.post(
        "/media",
        async (req: Request, res: Response, next: NextFunction) => {
            const { id, imageBuffer } = req.body;

            try {
                await media.saveImage(id, Buffer.from(imageBuffer, "base64"));
                res.status(200).json({
                    message: `Image with ID ${id} successfully saved.`,
                });
            } catch (error) {
                logger.error(
                    `Error saving image with ID ${id}: ${
                        (error as Error).message
                    }`
                );
                next(error);
            }
        }
    );

    router.get(
        "/media/:id",
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;

            try {
                const imageBuffer = await media.getImage(id);
                res.status(200).send(imageBuffer);
            } catch (error) {
                logger.error(
                    `Error retrieving image with ID ${id}: ${
                        (error as Error).message
                    }`
                );
                next(error);
            }
        }
    );

    return router;
}
