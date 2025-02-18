import { beforeAll, describe, expect, it } from "@jest/globals";
import dotenv from "dotenv";
import { addUser, getUserByEmail } from "drizzle";
import { AccessKeyType } from "drizzle/entities/boardAccessKeys";
import { DirectAccessType } from "drizzle/entities/boards";
import { getApp } from "getApp";
import http from "http";
import { BOARD_AUTHOR_KEY_HEADER } from "Routes/V1/Boards/middlewares";
import request from "supertest";
import { createToken } from "Tokens";

let server: http.Server;
let testUserId: any;

beforeAll(async () => {
    dotenv.config();
    const app = await getApp();
    server = app.server;
    testUserId = await createTestUser();
});

afterAll(() => {
    server.close();
});

async function createTestUser() {
    await addUser("test@email.com", false);
    const user = await getUserByEmail("test@email.com");
    return user.userId;
}

async function createTestToken(testUserId: string, permissions: any) {
    return createToken(testUserId, 24 * 60 * 60, "Whiteboard", "Whiteboard", "access", permissions);
}

describe("Board routes", () => {
    describe("Create a board", () => {
        it("should create a new private board", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });

            await request(server)
                .post("/api/v2/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Test Board" })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("id");
                    expect(response.body).toHaveProperty("title");
                    expect(response.body.isPublic).toEqual(false);
                });
        });

        it("should create a new public board", async () => {
            await request(server)
                .post("/api/v2/boards")
                .send({ title: "Test Board", isPublic: true })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("id");
                    expect(response.body).toHaveProperty("title");
                    expect(response.body).toHaveProperty("authorKey");
                    expect(response.body.isPublic).toEqual(true);
                    expect(response.body.directAccessType).toEqual(DirectAccessType.EDIT);
                });
        });
    });

    describe("Get board details", () => {
        let boardId: any;
        beforeAll(async () => {
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;
        });

        it("should return the details of an existing board", async () => {
            await request(server)
                .get(`/api/v2/boards/${boardId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty("id");
                    expect(response.body.id).toEqual(boardId);
                    expect(response.body).toHaveProperty("title");
                });
        });
    });

    describe("Edit board (authorized user)", () => {
        let boardId: any;
        beforeAll(async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board for Edit Test", isPublic: false })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;
        });

        it("should modify board", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            const res = await request(server)
                .patch(`/api/v2/boards/${boardId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "New Title Edit",
                    isPublic: true,
                })
                .expect(200);
            expect(res.body.title).toEqual("New Title Edit");
            expect(res.body.isPublic).toEqual(true);
        });

        it("should return 403 status code", async () => {
            await request(server)
                .patch(`/api/v2/boards/${boardId}`)
                .send({
                    title: "New Title",
                    isPublic: true,
                })
                .expect(401);
        });
    });

    describe("Edit board (unauthorized user)", () => {
        let boardId: any;
        let authorKey: any;
        beforeAll(async () => {
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            expect(createResponse.body).toHaveProperty("authorKey");
            boardId = createResponse.body.id;
            authorKey = createResponse.body.authorKey;
        });

        it("should modify board", async () => {
            const res = await request(server)
                .patch(`/api/v2/boards/${boardId}`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .send({
                    title: "New Title",
                    isPublic: true,
                })
                .expect(200);

            expect(res.body.title).toEqual("New Title");
            expect(res.body.isPublic).toEqual(true);
        });

        it("should return 403 status code", async () => {
            await request(server)
                .patch(`/api/v2/boards/${boardId}`)
                .send({
                    title: "New Title",
                    isPublic: true,
                })
                .expect(401);
        });
    });

    describe("Delete a board (authorized user)", () => {
        let boardId: any;

        beforeAll(async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;
        });

        it("should delete a board", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });
            await request(server)
                .delete(`/api/v2/boards/${boardId}/`)
                .set("Authorization", `Bearer ${token}`)
                .expect(204);
        });

        it("should not delete a board", async () => {
            await request(server).delete(`/api/v2/boards/${boardId}/`).expect(401);
        });

        it("should return 204 on successive deletes for the same board", async () => {
            const deleteToken = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            // First DELETE request
            await request(server)
                .delete(`/api/v2/boards/${boardId}`)
                .set("Authorization", `Bearer ${deleteToken}`)
                .expect(204);

            // Subsequent DELETE request (should also return 204 ensuring idempotence)
            await request(server)
                .delete(`/api/v2/boards/${boardId}`)
                .set("Authorization", `Bearer ${deleteToken}`)
                .expect(204);
        });
    });

    describe("Delete a board (unauthorized user)", () => {
        let boardId: any;
        let authorKey: any;

        beforeAll(async () => {
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            expect(createResponse.body).toHaveProperty("authorKey");
            boardId = createResponse.body.id;
            authorKey = createResponse.body.authorKey;
        });

        it("should delete a board", async () => {
            await request(server)
                .delete(`/api/v2/boards/${boardId}`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .expect(204);
        });

        it("should not delete a board", async () => {
            await request(server).delete(`/api/v2/boards/${boardId}`).expect(401);
        });
    });

    describe("Create a access key (authorized user)", () => {
        let boardId: any;
        beforeAll(async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;
        });

        it("should create a new access key", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set("Authorization", `Bearer ${token}`)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("accessKey");
                    expect(response.body.boardId).toEqual(boardId);
                    expect(response.body.keyType).toEqual(AccessKeyType.EDIT);
                });
        });

        it("should not create a new access key", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });

            await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set("Authorization", `Bearer ${token}`)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(403);
        });
    });

    describe("Create a access key (unauthorized user)", () => {
        let boardId: any;
        let authorKey: any;
        beforeAll(async () => {
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            expect(createResponse.body).toHaveProperty("authorKey");
            boardId = createResponse.body.id;
            authorKey = createResponse.body.authorKey;
        });

        it("should create a new access key", async () => {
            await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("accessKey");
                    expect(response.body.boardId).toEqual(boardId);
                    expect(response.body.keyType).toEqual(AccessKeyType.EDIT);
                });
        });

        it("should not create a new access key", async () => {
            await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(401);
        });
    });

    describe("Get access keys for board (authorized user)", () => {
        let boardId: any;
        beforeAll(async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;

            const rightsToken = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set("Authorization", `Bearer ${rightsToken}`)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("accessKey");
                    expect(response.body.boardId).toEqual(boardId);
                    expect(response.body.keyType).toEqual(AccessKeyType.EDIT);
                });
        });

        it("should get a access keys list", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            await request(server)
                .get(`/api/v2/boards/${boardId}/access-key`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveLength(1);
                });
        });

        it("should not get a access keys list", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });

            await request(server)
                .get(`/api/v2/boards/${boardId}/access-key`)
                .set("Authorization", `Bearer ${token}`)
                .expect(403);
        });
    });

    describe("Get access keys for board (unauthorized user)", () => {
        let boardId: any;
        let authorKey: any;
        beforeAll(async () => {
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;
            authorKey = createResponse.body.authorKey;

            await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("accessKey");
                    expect(response.body.boardId).toEqual(boardId);
                    expect(response.body.keyType).toEqual(AccessKeyType.EDIT);
                });
        });

        it("should get a access keys list", async () => {
            await request(server)
                .get(`/api/v2/boards/${boardId}/access-key`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveLength(1);
                });
        });

        it("should not get a access keys list", async () => {
            await request(server).get(`/api/v2/boards/${boardId}/access-key`).expect(401);
        });
    });

    describe("Get single access key for board (authorized user)", () => {
        let boardId: any;
        let accessKey: any;
        beforeAll(async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;

            const rightsToken = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            const accessKeyResponse = await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set("Authorization", `Bearer ${rightsToken}`)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(201);
            expect(accessKeyResponse.body).toHaveProperty("accessKey");
            expect(accessKeyResponse.body.boardId).toEqual(boardId);
            expect(accessKeyResponse.body.keyType).toEqual(AccessKeyType.EDIT);

            accessKey = accessKeyResponse.body.accessKey;
        });

        it("should get a access key", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            await request(server)
                .get(`/api/v2/boards/${boardId}/access-key/${accessKey}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.keyType).toEqual(AccessKeyType.EDIT);
                });
        });

        it("should not get a access key", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });

            await request(server)
                .get(`/api/v2/boards/${boardId}/access-key/${accessKey}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(403);
        });

        it("should not get a access key (invalid params)", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            await request(server)
                .get(`/api/v2/boards/${boardId}/access-key/123`)
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
        });
    });

    describe("Get single access key for board (unauthorized user)", () => {
        let boardId: any;
        let authorKey: any;
        let accessKey: any;
        beforeAll(async () => {
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;
            authorKey = createResponse.body.authorKey;

            const accessKeyResponse = await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(201);
            expect(accessKeyResponse.body).toHaveProperty("accessKey");
            expect(accessKeyResponse.body.boardId).toEqual(boardId);
            expect(accessKeyResponse.body.keyType).toEqual(AccessKeyType.EDIT);

            accessKey = accessKeyResponse.body.accessKey;
        });

        it("should get a access key", async () => {
            await request(server)
                .get(`/api/v2/boards/${boardId}/access-key/${accessKey}`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .expect(200)
                .then((response) => {
                    expect(response.body.keyType).toEqual(AccessKeyType.EDIT);
                });
        });

        it("should not get a access key", async () => {
            await request(server).get(`/api/v2/boards/${boardId}/access-key/${accessKey}`).expect(401);
        });
    });

    describe("Delete single access key for board (authorized user)", () => {
        let boardId: any;
        let accessKey: any;
        beforeAll(async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;

            const rightsToken = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            const accessKeyResponse = await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set("Authorization", `Bearer ${rightsToken}`)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(201);
            expect(accessKeyResponse.body).toHaveProperty("accessKey");
            expect(accessKeyResponse.body.boardId).toEqual(boardId);
            expect(accessKeyResponse.body.keyType).toEqual(AccessKeyType.EDIT);

            accessKey = accessKeyResponse.body.accessKey;
        });

        it("should get a access key", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            await request(server)
                .delete(`/api/v2/boards/${boardId}/access-key/${accessKey}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(204);
        });
    });

    describe("Delete single access key for board (unauthorized user)", () => {
        let boardId: any;
        let authorKey: any;
        let accessKey: any;
        beforeAll(async () => {
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;
            authorKey = createResponse.body.authorKey;

            const accessKeyResponse = await request(server)
                .post(`/api/v2/boards/${boardId}/access-key`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .send({ keyType: AccessKeyType.EDIT })
                .expect(201);
            expect(accessKeyResponse.body).toHaveProperty("accessKey");
            expect(accessKeyResponse.body.boardId).toEqual(boardId);
            expect(accessKeyResponse.body.keyType).toEqual(AccessKeyType.EDIT);

            accessKey = accessKeyResponse.body.accessKey;
        });

        it("should delete a access key", async () => {
            await request(server)
                .delete(`/api/v2/boards/${boardId}/access-key/${accessKey}`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .expect(204);
        });
    });

    describe("Manage board access (authorized user)", () => {
        let boardId: any;

        beforeAll(async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"] },
            });
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            boardId = createResponse.body.id;
        });

        it("should make board public", async () => {
            const token = await createTestToken(testUserId, {
                owns: { catalogs: ["root"], boards: [boardId] },
            });

            await request(server)
                .post(`/api/v2/boards/${boardId}/manage-access`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    isPublic: true,
                    users: [],
                })
                .expect(204);

            const getResponse = await request(server).get(`/api/v2/boards/${boardId}`);
            expect(getResponse.body.isPublic).toEqual(true);
        });

        it("should return 401 status code", async () => {
            await request(server)
                .post(`/api/v2/boards/${boardId}/manage-access`)
                .send({
                    isPublic: true,
                    users: [],
                })
                .expect(401);
        });
    });

    describe("Manage board access (unauthorized user)", () => {
        let boardId: any;
        let authorKey: any;
        beforeAll(async () => {
            // Create a new board
            const createResponse = await request(server)
                .post("/api/v2/boards")
                .send({ title: "Board for Detail Test" })
                .expect(201);
            expect(createResponse.body).toHaveProperty("id");
            expect(createResponse.body).toHaveProperty("authorKey");
            boardId = createResponse.body.id;
            authorKey = createResponse.body.authorKey;
        });

        it("should modify board", async () => {
            await request(server)
                .post(`/api/v2/boards/${boardId}/manage-access`)
                .set(BOARD_AUTHOR_KEY_HEADER, authorKey)
                .send({
                    isPublic: false,
                    users: [],
                })
                .expect(204);

            const getResponse = await request(server).get(`/api/v2/boards/${boardId}`);
            expect(getResponse.body.isPublic).toEqual(false);
        });

        it("should return 401 status code", async () => {
            await request(server)
                .post(`/api/v2/boards/${boardId}/manage-access`)
                .send({
                    isPublic: true,
                    users: [],
                })
                .expect(401);
        });
    });
});
