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

describe("Media routes", () => {
    describe("POST /media", () => {
        const imageId = "test-image-id";

        const imageData =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/YPEYBkAAAAASUVORK5CYII="; // Base64 encoded 1x1 PNG pixel

        it("should save the image", async () => {
            await request(server)
                .post("/api/v1/media")
                .send({ id: imageId, imageBuffer: imageData })
                .expect(200)
                .then((response) => {
                    expect(response.body.message).toBe(
                        "Image with ID test-image-id successfully saved."
                    );
                });
        });

        it("should retrieve the image", async () => {
            await request(server)
                .get(`/api/v1/media/${imageId}`)
                .expect(200)
                .then((response) => {
                    // Compare as a buffer
                    expect(response.body).toEqual(
                        Buffer.from(imageData, "base64")
                    );
                });
        });
    });
});
