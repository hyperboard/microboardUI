import request from "supertest";
import http from "http";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import dotenv from "dotenv";
import { getApp } from "getApp";
import { createToken } from "Tokens";

let server: http.Server;

beforeAll(async () => {
    dotenv.config();
    server = await getApp();
});

afterAll(() => {
    server.close();
});

const sendImage = async (
    imageId: string,
    imageData: string,
    imageType: string,
    expectedCode: number,
    expectedString: string,
) => {
    const base64String = imageData;
    const mimeType = imageType;
    const binaryString = Buffer.from(base64String, "base64").toString("binary");
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: mimeType });

    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(blob.size / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, blob.size);
        const chunk = blob.slice(start, end);

        await request(server)
            .post("/api/v1/media")
            .set("Content-Type", mimeType)
            .set("X-Image-Id", imageId)
            .set("Transfer-Encoding", "chunked")
            .send(chunk)
            .expect(expectedCode)
            .then((response) => {
                expect(response.body.message).toBe(expectedString);
            });
    }
}

describe("Media routes", () => {
    const imageId = "test-image-id";
    const imageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/YPEYBkAAAAASUVORK5CYII="; // Base64 encoded 1x1 PNG pixel
    const imageType = "image/png";

    const unsupportedImageId = "unsupported-image-id";
    const unsupportedImageData = "R0lGODlhAQABAIAAAAUEBA=="; // Base64 encoded 1x1 GIF pixel
    const unsupportedImageType = "image/gif";

    const largeImageId = "large-image-id";
    const largeImageData = "iVBORw0K"+"a".repeat(5 * 1024 * 1024 + 1); // String larger than 5 MB
    const largeImageType = "image/png";

    describe("POST /media:id", () => {
        it("should save the image", async () => {
            sendImage(
                imageId,
                imageData,
                imageType,
                200,
                "Image with ID test-image-id successfully saved." || "Image with ID test-image-id already exists.",
            );
        });

        it("should return 400 for unsupported image format", async () => {
            await sendImage(
                unsupportedImageId,
                unsupportedImageData,
                unsupportedImageType,
                400,
                "Error: image format is not supported.",
            );
        });

        it("should return 400 for image larger than 5 MB", async () => {
            await sendImage(
                largeImageId,
                largeImageData,
                largeImageType,
                400,
                "Error: Stream exceeds the allowed size limit",
            );
        });
    });


    describe("GET /media/:id", () => {
        it("should retrieve the image", async () => {
            const blob = new Blob([Buffer.from(imageData, "base64")], { type: "image/png" });

            await request(server)
                .get(`/api/v1/media/${imageId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(blob);
                });
        });

        it("should return 404 for retrieving non-existent image", async () => {
            await request(server)
                .get(`/api/v1/media/non-existent-id`)
                .expect(404)
                .then((response) => {
                    expect(response.body).toEqual("Error: could not get the image with id non-existent-id from the storage");
                });

        });
    });
});