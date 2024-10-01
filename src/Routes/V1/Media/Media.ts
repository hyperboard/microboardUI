import { minioClient } from "./MinioClient";
import * as stream from "stream";
import { Logger } from "winston";
import { MediaDAL } from "./MediaDAL";
import { BUCKET_NAME } from "./MinioClient";

/**
 * Save an image to MinIO using its hash as the ID.
 * @param id - The unique hash ID for the image.
 * @param imageStream - The image stream to be saved.
 * @param logger - A winston logger instance for logging.
 */
async function saveImageStream(id: string, imageStream: stream.Readable, logger: Logger): Promise<void> {
    await minioClient.putObject(BUCKET_NAME, id, imageStream);
    logger.info(`Image with ID ${id} successfully saved.`);
}

/**
 * Get an image from MinIO using its ID.
 * @param id - The unique hash ID for the image.
 * @param logger - A winston logger instance for logging.
 * @returns ReadableStream.
 */
async function getImageStream(id: string, logger: Logger): Promise<stream.Readable> {
    const dataStream = await minioClient.getObject(BUCKET_NAME, id);
    logger.info(`Stream of image with ID ${id} successfully retrieved.`);
    return dataStream;
}

/**
 * Check if an image with the given ID already exists in MinIO.
 * @param id - The unique hash ID for the image.
 * @returns - A promise that resolves to true if the image exists, false otherwise.
 */
export async function doesImageExist(id: string, logger: Logger): Promise<boolean> {
    try {
        await minioClient.statObject(BUCKET_NAME, id);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Factory function to create a MediaService instance.
 * @param logger - A winston logger instance for logging.
 * @returns - An instance of MediaService.
 */
export function createMinioMediaDAL(logger: Logger): MediaDAL {
    return {
        saveImageStream: (id: string, imageStream: stream.Readable) => saveImageStream(id, imageStream, logger),
        getImageStream: (id: string) => getImageStream(id, logger),
        doesImageExist: (id: string) => doesImageExist(id, logger),
    };
}
