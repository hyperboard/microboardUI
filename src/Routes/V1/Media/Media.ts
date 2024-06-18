import { minioClient } from "./MinioClient";
import * as stream from "stream";
import { Logger } from "winston";
import { MediaDAL } from "./MediaDAL";
import { BUCKET_NAME } from "./MinioClient";

/**
 * Save an image to MinIO using its hash as the ID.
 * @param id - The unique hash ID for the image.
 * @param imageBuffer - The image buffer to be saved.
 * @param logger - A winston logger instance for logging.
 */
async function saveImage(
    id: string,
    imageBuffer: Buffer,
    logger: Logger
): Promise<void> {
    const readableStream = new stream.PassThrough();
    readableStream.end(imageBuffer);

    await minioClient.putObject(BUCKET_NAME, id, readableStream);
    logger.info(`Image with ID ${id} successfully saved.`);
}

/**
 * Get an image from MinIO using its ID.
 * @param id - The unique hash ID for the image.
 * @param logger - A winston logger instance for logging.
 * @returns - The image buffer.
 */
async function getImage(id: string, logger: Logger): Promise<Buffer> {
    const dataStream = await minioClient.getObject(BUCKET_NAME, id);
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
        dataStream.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
        });

        dataStream.on("end", () => {
            logger.info(`Image with ID ${id} successfully retrieved.`);
            resolve(Buffer.concat(chunks));
        });

        dataStream.on("error", (error: any) => {
            reject(error);
        });
    });
}

/**
 * Factory function to create a MediaService instance.
 * @param logger - A winston logger instance for logging.
 * @returns - An instance of MediaService.
 */
export function createMinioMediaDAL(logger: Logger): MediaDAL {
    return {
        saveImage: (id: string, imageBuffer: Buffer) =>
            saveImage(id, imageBuffer, logger),
        getImage: (id: string) => getImage(id, logger),
    };
}
