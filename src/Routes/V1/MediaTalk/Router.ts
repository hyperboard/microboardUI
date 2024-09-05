import express, { Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { isAllowedFormat } from "./MediaHelpers";
import { Transform, PassThrough } from "stream";
import { BarrelMediaDAL } from "./MediaDAL";
import { fileTypeFromBuffer } from "file-type";

const mega = 1024 * 1024;
const maxSizeInBytes = 5 * mega; // 5 MB

class SizeLimitStream extends Transform {
    private totalBytes: number;
    private maxSize: number;

    constructor(maxSize: number) {
        super();
        this.totalBytes = 0;
        this.maxSize = maxSize;
    }

    _transform(chunk: any, encoding: string, callback: Function) {
        this.totalBytes += chunk.length;
        if (this.totalBytes > this.maxSize) {
            callback(new Error("Stream exceeds the allowed size limit"));
        } else {
            callback(null, chunk);
        }
    }
}

export function getMediaRouter(media: BarrelMediaDAL, logger: Logger) {
    const router = express.Router();

    router.post(
        "/media",
        async (req: Request, res: Response, next: NextFunction) => {
            const id = req.headers["x-image-id"] as string;
            const format = req.headers["content-type"] || "unknown";
            const storageURL = process.env.STORAGE_URL;
            if (!storageURL) {
                logger.error(
                    `Error saving image with ID ${id}: env.STORAGE_URL is not defined`
                );
                return res.status(500).json({
                    error: `Could not upload the image to storage, env.STORAGE_URL is not defined on the server`,
                });
            }
            const src = `${storageURL}/${id}`;
            const sizeLimitStream = new SizeLimitStream(maxSizeInBytes);
            const passThroughStream = new PassThrough();

        req.pipe(sizeLimitStream)
            .on("error", (error) => {
                logger.error(`Error: ${error.message}`);
                res.status(400).json({
                    error: `Error: ${error.message}`,
                });
            })
            .pipe(passThroughStream);

        try {
            if (!isAllowedFormat(format)) {
                return res.status(415).json({
                    error: `Error: image format is not supported.`,
                });
            }
            const exists = await media.doesImageExist(id);
            if (exists) {
                return res.status(200).json({
                    message: `Image with ID ${id} already exists.`,
                    src,
                });
            }
            await media.saveImageStream(id, passThroughStream);
            res.status(200).json({
                message: `Image with ID ${id} successfully saved.`,
                src,
            });
        } catch (error) {
            logger.error(`Error saving image with ID ${id}: ${(error as Error).message}`);
            res.status(400).json({
                error: `Error: could not upload the image to storage`,
            });
            next(error);
        }
    });

    router.get("/media/:id", async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        try {
            const imageBlob = await media.getImageStream(id);
            const buffer = Buffer.from(await imageBlob.arrayBuffer());

            const type = await fileTypeFromBuffer(buffer);
            const mimeType = type?.mime || "application/octet-stream";

            const imageStream = new PassThrough();
            imageStream.end(buffer);

            res.setHeader("Content-Type", mimeType);
            imageStream.pipe(res);
            imageStream.on("error", (error) => {
                logger.error(`Stream error for image with ID ${id}: ${error.message}`);
                res.status(500).json({
                    error: `Error: could not stream the image with id ${id} from the storage`,
                });
            });
        } catch (error) {
            logger.error(`Error retrieving image with ID ${id}: ${(error as Error).message}`);
            res.status(400).json({
                error: `Error: could not get the image with id ${id} from the storage`,
            });
            next(error);
        }
    });

    return router;
}
