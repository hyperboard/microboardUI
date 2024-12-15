import express, { Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { MediaDAL } from "./MediaDAL";
import { getImageFormat, isAllowedFormat } from "./MediaHelpers";
import { Transform, PassThrough } from "stream";
import { optimize } from "svgo";
import { processSvg } from "shared/lib/processSvg";
import { catchAsync } from "shared/lib/catchAsync";
import { internalError } from "shared/lib/routing";

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

export function createMediaRouter(media: MediaDAL, logger: Logger) {
    const router = express.Router();

    router.post(
        "/media",
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const id = req.headers["x-image-id"] as string;
            const format = req.headers["content-type"] || "unknown";
            const storageURL = process.env.STORAGE_URL;
            if (!storageURL) {
                logger.error(`Error saving image with ID ${id}: env.STORAGE_URL is not defined`);
                return internalError(
                    res,
                    null,
                    "Could not upload the image to storage, env.STORAGE_URL is not set on the server"
                );
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
                if (format === "image/svg+xml") {
                    const optimizedStream = await processSvg(passThroughStream);
                    await media.saveImageStream(id, optimizedStream);
                } else {
                    await media.saveImageStream(id, passThroughStream);
                }
                res.status(200).json({
                    message: `Image with ID ${id} successfully saved.`,
                    src,
                });
            } catch (error) {
                logger.error(`Error saving image with ID ${id}: ${(error as Error).message}`);
                res.status(400).json({
                    error: `Error: could not upload the image to storage`,
                });
            }
        })
    );

    router.get(
        "/media/:id",
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;

            try {
                const imageStream = await media.getImageStream(id);
                res.setHeader("Content-Type", id.endsWith(".svg") ? "image/svg+xml" : "image/png");
                imageStream.pipe(res);
                imageStream.on("error", (error) => {
                    logger.error(`Stream error for image with ID ${id}: ${error.message}`);
                    return internalError(
                        res,
                        error,
                        `Error: could not stream the image with id ${id} from the storage`
                    );
                });
            } catch (error) {
                logger.error(`Error retrieving image with ID ${id}: ${(error as Error).message}`);
                res.status(400).json({
                    error: `Error: could not get the image with id ${id} from the storage`,
                });
                next(error);
            }
        })
    );

    return router;
}
