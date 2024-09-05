import * as stream from "stream";
import { Logger } from "winston";
import { BarrelMediaDAL } from "./MediaDAL";

const storageBaseUrl = process.env.STORAGE_BASE_URL || "undefined";
const containerName = process.env.CONTAINER_NAME || "undefined";
const blobPath = `${storageBaseUrl}/api/Blob/${containerName}`;
const filePath = `${storageBaseUrl}/api/File/${containerName}`;
function getAuthHeaders() {
    return {
        "x-api-key": process.env.API_KEY || "",
    };
}

/**
 * Save an image to Barrel using its id.
 * @param id - The unique id for the image.
 * @param imageStream - The image stream to be saved.
 * @param logger - A winston logger instance for logging.
 */
async function saveImageStream(id: string, imageStream: stream.Readable, logger: Logger): Promise<void> {
    const url = `${blobPath}`;
    const headers = getAuthHeaders();
    const formData = new FormData();

    const chunks: Uint8Array[] = [];
    for await (const chunk of imageStream) {
        chunks.push(chunk);
    }
    const blob = new Blob(chunks);

    formData.append(id, blob, id);

    await fetch(url, {
        method: "POST",
        headers: {
            ...headers,
            contentType: "multipart/form-data",
        },
        body: formData,
    });
    logger.info(`Image with id ${id} successfully saved.`);
}

/**
 * Get an image from Barrel using its id.
 * @param id - The unique id for the image.
 * @param logger - A winston logger instance for logging.
 * @returns Blob.
 */
async function getImageStream(id: string, logger: Logger): Promise<Blob> {
    const url = `${blobPath}/${id}`;
    const headers = getAuthHeaders();
    const res = await fetch(url, {
        method: "GET",
        headers,
    });

    if (!res.ok) {
        logger.error(`Failed to retrieve image with id ${id}. Status: ${res.status}`);
        throw new Error(`Failed to retrieve image with id ${id}. Status: ${res.status}`);
    }

    logger.info(`Blob of image with id ${id} successfully retrieved.`);
    return await res.blob();
}

/**
 * Check if an image with the given id already exists in the container.
 * @param id - The unique id for the image.
 * @param logger - A winston logger instance for logging.
 * @returns - A promise that resolves to true if the image exists, false otherwise.
 */
export async function doesImageExist(id: string, logger: Logger): Promise<boolean> {
    const url = `${filePath}/${id}`;
    const headers = getAuthHeaders();
    try {
        const res = await fetch(url, {
            method: "GET",
            headers,
        });

        if (res.status === 200) {
            logger.info(`File with id ${id} exists.`);
            return true;
        } else if (res.status === 404) {
            logger.info(`File with id ${id} does not exist.`);
            return false;
        } else {
            throw new Error(`Failed to check file existence with id ${id}. Status: ${res.status}`);
        }
    } catch (error) {
        logger.error(`Error occurred while checking file existence with id ${id}: ${error}`);
        return false;
    }
}

/**
 * Factory function to create a MediaService instance.
 * @param logger - A winston logger instance for logging.
 * @returns - An instance of MediaService.
 */
export function createBarrelMediaDAL(logger: Logger): BarrelMediaDAL {
    return {
        saveImageStream: (id: string, imageStream: stream.Readable) => saveImageStream(id, imageStream, logger),
        getImageStream: (id: string) => getImageStream(id, logger),
        doesImageExist: (id: string) => doesImageExist(id, logger),
    };
}
