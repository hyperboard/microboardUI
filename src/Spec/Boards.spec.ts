import request from "supertest";
import http from "http";
import { beforeAll, afterEach, describe, it, expect } from "@jest/globals";
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

// Сокращение для создания токена для заданного пользователя и роли
async function createTestToken(userId: string, permissions: any) {
    return createToken(
        permissions,
        userId,
        24 * 60 * 60,
        "Whiteboard",
        "Whiteboard"
    );
}

describe("Board routes", () => {
    const userId = "user-123";

    it("should create a new board", async () => {
        const token = await createTestToken(userId, {
            owns: { catalogs: ["root"] },
        });

        await request(server)
            .post("/api/v1/boards/")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Test Board" })
            .expect(201)
            .then((response) => {
                expect(response.body).toHaveProperty("boardId");
                expect(response.body).toHaveProperty("boardUrl");
            });
    });

    it("should fail to create a new board without a token", async () => {
        await request(server)
            .post("/api/v1/boards")
            .send({ title: "Test Board" })
            .expect(401);
    });

    describe("Public board routes", () => {
        it("should create a new public board", async () => {
            await request(server)
                .post("/api/v1/public-boards")
                .send({ title: "Public Test Board" })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("boardId");
                    expect(response.body).toHaveProperty("linkId");
                    expect(response.body).toHaveProperty("linkUri");
                    expect(response.body.linkUri).toContain(
                        response.body.linkId
                    );
                });
        });
    });

    it("should delete a board", async () => {
        const tokenToCreate = await createTestToken(userId, {
            owns: { catalogs: ["root"] },
        });
        let boardId;
        const createResponce = await request(server)
            .post("/api/v1/boards")
            .set("Authorization", `Bearer ${tokenToCreate}`)
            .send({ title: "Test Board" })
            .expect(201);

        expect(createResponce.body).toHaveProperty("boardId");
        expect(createResponce.body).toHaveProperty("boardUrl");
        boardId = createResponce.body.boardId;

        const tokenToDelete = await createTestToken(userId, {
            owns: { boards: [boardId] },
        });

        const deleteResponce = await request(server)
            .delete(`/api/v1/boards/${boardId}/`)
            .set("Authorization", `Bearer ${tokenToDelete}`)
            .expect(204);
    });

    describe("Duplicate Board", () => {
        const userId = "user-123";

        it("should duplicate a board", async () => {
            const tokenToCreate = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            const createResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${tokenToCreate}`)
                .send({ title: "Board to Duplicate" })
                .expect(201);

            expect(createResponse.body).toHaveProperty("boardId");
            const originalBoardId = createResponse.body.boardId;

            const tokenToDuplicate = await createTestToken(userId, {
                owns: { boards: [originalBoardId] },
            });

            const duplicateResponse = await request(server)
                .post(`/api/v1/boards/${originalBoardId}/duplicate`)
                .set("Authorization", `Bearer ${tokenToDuplicate}`)
                .expect(200);

            expect(duplicateResponse.body).toHaveProperty("newBoardId");

            expect(duplicateResponse.body.newBoardId).not.toEqual(
                originalBoardId
            );
        });
    });

    describe("PATCH /boards/:boardId (Renaming a board)", () => {
        const userId = "user-123";
        let token: string;
        let boardId: any;

        beforeAll(async () => {
            // Token with permissions to create and subsequently rename a board
            token = await createTestToken(userId, {
                owns: { boards: [], catalogs: ["root"] },
            });

            // Create a new board to be renamed
            const createResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board To Rename" })
                .expect(201);
            boardId = createResponse.body.boardId;

            // Add owns permissions for the created boardId
            token = await createTestToken(userId, {
                owns: { boards: [boardId] },
            });
        });

        it("should rename an existing board", async () => {
            const newTitle = "Renamed Board";
            await request(server)
                .patch(`/api/v1/boards/${boardId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ newTitle: newTitle })
                .expect(200);
        });

        it("should not rename a board with an invalid boardId", async () => {
            const newTitle = "Renamed Board Invalid ID";
            await request(server)
                .patch(`/api/v1/boards/invalid-board-id`)
                .set("Authorization", `Bearer ${token}`)
                .send({ newTitle: newTitle })
                .expect(400);
        });

        it("should not rename a board without the required permissions", async () => {
            const tokenWithoutPermission = await createTestToken(userId, {
                owns: { boards: [] },
            });

            const newTitle = "Renamed Board No Permission";
            await request(server)
                .patch(`/api/v1/boards/${boardId}`)
                .set("Authorization", `Bearer ${tokenWithoutPermission}`)
                .expect(403);
        });

        it("should return 404 for non-existent boardId", async () => {
            const nonExistentBoardId = "00000000-0000-0000-0000-000000000000";
            const newTitle = "Renamed Board Non Existent";
            await request(server)
                .patch(`/api/v1/boards/${nonExistentBoardId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ newTitle: newTitle })
                .expect(404); // Assuming API returns a 404 for non-existent resource
        });
    });

    describe("POST /boards/:boardId/links", () => {
        let boardId: any;

        // Создание доски перед тестированием создания ссылки
        beforeAll(async () => {
            const token = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board for Links" })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("boardId");
                    boardId = response.body.boardId;
                });
        });

        it("should create a new read link for the board", async () => {
            const token = await createTestToken(userId, {
                owns: { boards: [boardId] },
            });

            await request(server)
                .post(`/api/v1/boards/${boardId}/links`)
                .set("Authorization", `Bearer ${token}`)
                .send({ type: "read" })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("linkId");
                    expect(response.body).toHaveProperty("linkUri");
                });
        });

        it("should create a new edit link for the board", async () => {
            const token = await createTestToken(userId, {
                owns: { boards: [boardId] },
            });

            await request(server)
                .post(`/api/v1/boards/${boardId}/links`)
                .set("Authorization", `Bearer ${token}`)
                .send({ type: "edit" })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("linkId");
                    expect(response.body).toHaveProperty("linkUri");
                });
        });

        it("should fail to create a new link without proper permissions", async () => {
            const token = await createTestToken(userId, {
                owns: { boards: [] }, // пользователь не владеет доской
            });

            await request(server)
                .post(`/api/v1/boards/${boardId}/links`)
                .set("Authorization", `Bearer ${token}`)
                .send({ type: "read" })
                .expect(403); // Forbidden
        });
    });

    describe("Link deletion", () => {
        const userId = "user-123";
        let boardId: any;
        let linkId: any;
        let deletionToken: string;

        beforeAll(async () => {
            // Создание токена для создания доски
            const creationToken = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            // Создание доски
            const boardCreationResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${creationToken}`)
                .send({ title: "Test Board for Link Deletion" });
            boardId = boardCreationResponse.body.boardId;

            // Создание ссылки
            const linkCreationToken = await createTestToken(userId, {
                owns: { boards: [boardId] },
            });
            const linkCreationResponse = await request(server)
                .post(`/api/v1/boards/${boardId}/links`)
                .set("Authorization", `Bearer ${linkCreationToken}`)
                .send({ type: "edit" }); // или type: "read"
            linkId = linkCreationResponse.body.linkId;

            // Создание токена для удаления ссылки
            deletionToken = await createTestToken(userId, {
                owns: { boards: [boardId] },
            });
        });

        it("should delete a link from a board", async () => {
            await request(server)
                .delete(`/api/v1/boards/${boardId}/links/${linkId}`)
                .set("Authorization", `Bearer ${deletionToken}`)
                .expect(204);
        });
    });
});
