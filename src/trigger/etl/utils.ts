import { Board, ImageItem } from "@mirohq/miro-api";
import { WidgetItem } from "@mirohq/miro-api/dist/highlevel/Item";
import { Blob } from "node:buffer";
import { Readable } from "node:stream";
import { Buffer } from "node:buffer";

const INTERNAL_SERVER_URL = process.env.INTERNAL_SERVER_URL || "http://localhost:8000";

export async function imageUrlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            Readable.from(buffer)
                .on("data", (chunk) => chunks.push(Buffer.from(chunk)))
                .on("error", (err) => reject(err))
                .on("end", () => {
                    const binary = Buffer.concat(chunks);
                    const base64 = binary.toString("base64");
                    const dataUrl = `data:${contentType};base64,${base64}`;
                    resolve(dataUrl);
                });
        });
    } catch (error: any) {
        throw new Error(`Failed to download or convert image: ${error.message || "Unhandled error"}`);
    }
}

export const uploadToTheStorage = async (hash: string, dataURL: string): Promise<string> => {
    try {
        // Extract the base64 string and mime type from the Data URL
        const [metadata, base64String] = dataURL.split(",");
        const mimeType = metadata.split(":")[1].split(";")[0];

        // Convert base64 string to binary data
        const binaryString = Buffer.from(base64String, "base64").toString("binary");
        const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
        const blob = new Blob([bytes], { type: mimeType });

        const internalStorageUrl = `${INTERNAL_SERVER_URL}/api/v1/media`;

        // Post data to the server
        const response = await fetch(internalStorageUrl, {
            method: "POST",
            headers: {
                "Content-Type": mimeType,
                "X-Image-Id": hash,
            },
            body: blob,
        });

        if (response.status !== 200) {
            throw new Error(`HTTP status: ${response.status}`);
        }

        const base = process.env.STORAGE_URL || "http://localhost:8001/api/v1/media";
        const link = `${base}/${hash}`;

        // Resolve with the response data
        // const data = await response.json();
        return link;
    } catch (error) {
        console.error("Media storage error:", error);
        throw error;
    }
};

export async function sha256(message: any): Promise<string> {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);
    // hash the message
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

interface GetAllItemsResponse {
    size: number;
    limit: number;
    total: number;
    data: WidgetItem[];
    links: {
        next: string;
        self: string;
        prev: string;
    };
    type: string;
}

export async function fetchAndProcessItems(
    boardId: string,
    accessToken: string,
    newBoardId: string,
    userId: string,
    io: any
) {
    let items: any[] = [];
    let nextLink: string | null = `https://api.miro.com/v2/boards/${boardId}/items?limit=50`;

    while (nextLink) {
        const response = await fetchItemsWithRetry(nextLink, accessToken, io);
        const processedItems = await processItems(response.data, newBoardId, userId, accessToken, io);
        items.push(...processedItems);
        nextLink = response.links.next || null;
    }

    return items;
}

export async function fetchItemsWithRetry(url: string, accessToken: string, io: any): Promise<GetAllItemsResponse> {
    while (true) {
        const rawItemsRequest = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: "Bearer " + accessToken,
            },
        });

        if (rawItemsRequest.status === 429) {
            await io.logger.warn(`Rate limit hit, waiting 10 seconds before retrying ${url}`);
            await io.wait("wait 10 seconds", 10);
            continue;
        } else if (!rawItemsRequest.ok) {
            throw new Error(`Failed to fetch items: ${rawItemsRequest.statusText}`);
        }

        return await rawItemsRequest.json();
    }
}

export async function processItems(
    items: WidgetItem[],
    newBoardId: string,
    userId: string,
    accessToken: string,
    io: any
) {
    const processedItems = [];

    for (const item of items) {
        await io.logger.debug(`Processing item ${item.id} of type ${item.type}`, { item });

        if (item.type === "image") {
            const processedImageItem = await processImageItem(item as ImageItem, accessToken, io);
            processedItems.push({
                item: processedImageItem,
                boardId: newBoardId,
                userId: userId,
            });
        } else {
            processedItems.push({
                item,
                boardId: newBoardId,
                userId: userId,
            });
        }
    }

    return processedItems;
}

export async function processImageItem(item: ImageItem, accessToken: string, io: any): Promise<ImageItem> {
    const url = item.data!.imageUrl!.split("?")[0] + "?format=original&redirect=false";

    try {
        const img = await fetchImageWithRetry(url, accessToken, io);
        const imgUrl = img?.url ?? "";
        console.log("imgUrl: ", imgUrl);
        const imgBase64 = await imageUrlToBase64(imgUrl);

        if (!imgBase64) {
            throw new Error("Failed to convert image to base64");
        }

        const src = await uploadToTheStorage(item.id, imgBase64);
        await io.logger.log(`Image uploaded ${item.id}}`, { src });

        const copiedItem: ImageItem = { ...item };
        copiedItem.data!.imageUrl! = src;
        return copiedItem;
    } catch (error) {
        console.error("Error processing image item:", error);
        throw error;
    }
}

export async function fetchImageWithRetry(url: string, accessToken: string, io: any) {
    while (true) {
        const rawImageRequest = await fetch(url, {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });

        if (rawImageRequest.status === 429) {
            await io.logger.warn(
                `Rate limit hit while fetching image, waiting 10 seconds before retrying ${url} - ${Date.now()}`
            );
            await io.wait("wait 10 seconds", 10);
            continue;
        } else if (!rawImageRequest.ok) {
            throw new Error(`Failed to fetch image: ${rawImageRequest.statusText}`);
        }

        return await rawImageRequest.json();
    }
}

export async function fetchAndProcessConnectors(
    board: Board,
    io: any,
    boardId: string,
    userId: string
): Promise<any[]> {
    const rawConnectors = board.getAllConnectors();
    const connectors = [];
    let index = 0;

    for await (const connector of rawConnectors) {
        index++;
        await io.logger.debug(`Connector fetched: ${board.id} ${index}`, { connector });
        if (connector.isSupported === false) {
            continue;
        }

        connectors.push({
            item: connector,
            boardId: boardId,
            userId: userId,
        });
    }

    return connectors;
}

export async function getSVGDimensionsFromURL(url: string): Promise<{
    width: number | null;
    height: number | null;
}> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("image/svg+xml")) {
            throw new Error("The URL did not return an SVG image");
        }

        const svgText = await response.text();

        const widthRegex = /\bwidth\s*=\s*["'](\d+(?:\.\d+)?)\w*["']/;
        const heightRegex = /\bheight\s*=\s*["'](\d+(?:\.\d+)?)\w*["']/;
        const viewBoxRegex =
            /\bviewBox\s*=\s*["'](\d+(?:\.\d+)?\s+\d+(?:\.\d+)?\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?))["']/;

        let width = svgText.match(widthRegex)?.[1];
        let height = svgText.match(heightRegex)?.[1];

        if (!width || !height) {
            const viewBoxMatch = svgText.match(viewBoxRegex);
            if (viewBoxMatch) {
                width = width || viewBoxMatch[2];
                height = height || viewBoxMatch[3];
            }
        }

        return {
            width: width ? parseFloat(width) : null,
            height: height ? parseFloat(height) : null,
        };
    } catch (error) {
        console.error("Error fetching or parsing SVG:", error);
        return { width: null, height: null };
    }
}
