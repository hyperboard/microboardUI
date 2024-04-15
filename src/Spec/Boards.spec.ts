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
    describe("Create a board", () => {
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

        it("should create a new board with 'root' catalogId", async () => {
            const token = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            await request(server)
                .post("/api/v1/boards/")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Test Board with root catalog",
                    catalogId: "root",
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("boardId");
                    expect(response.body).toHaveProperty("boardUrl");
                });
        });

        it("should fail to create a new board with invalid catalogId", async () => {
            const token = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            await request(server)
                .post("/api/v1/boards/")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Test Board with invalid catalog",
                    catalogId: "invalid-catalog-id",
                })
                .expect(400); // Expecting a 400 Bad Request due to invalid catalogId
        });
    });

    describe("Create public board", () => {
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

    describe("Delete a board", () => {
        const userId = "user-123";

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

            const deleteResponse = await request(server)
                .delete(`/api/v1/boards/${boardId}/`)
                .set("Authorization", `Bearer ${tokenToDelete}`)
                .expect(204);
        });

        it("should delete a board with 'root' catalog ownership without owning the board", async () => {
            const tokenToCreateBoard = await createTestToken(userId, {
                owns: { catalogs: ["root"] }, // User owns 'root' catalog
            });

            let boardId;
            const createResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${tokenToCreateBoard}`)
                .send({ title: "Board to Delete With Root Catalog" })
                .expect(201);

            expect(createResponse.body).toHaveProperty("boardId");
            boardId = createResponse.body.boardId;

            const tokenToDeleteBoard = await createTestToken(userId, {
                owns: { catalogs: ["root"] }, // User can delete any board within the root catalog
            });

            await request(server)
                .delete(`/api/v1/boards/${boardId}`)
                .set("Authorization", `Bearer ${tokenToDeleteBoard}`)
                .expect(204); // Board deletion should be successful
        });
    });

    describe("Duplicate a Board", () => {
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

    describe("Rename a Board)", () => {
        const userId = "user-123";
        let token: string;
        let boardId: any;

        beforeAll(async () => {
            token = await createTestToken(userId, {
                owns: { boards: [], catalogs: ["root"] },
            });

            const createResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Board To Rename" })
                .expect(201);
            boardId = createResponse.body.boardId;

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
                .send({ newTitle: newTitle })
                .expect(403);
        });

        it("should return 404 for non-existent boardId", async () => {
            const nonExistentBoardId = "00000000-0000-0000-0000-000000000000";
            token = await createTestToken(userId, {
                owns: { boards: [nonExistentBoardId] },
            });
            const newTitle = "Renamed Board Non Existent";
            await request(server)
                .patch(`/api/v1/boards/${nonExistentBoardId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ newTitle: newTitle })
                .expect(404);
        });

        it("should rename a board with 'root' catalog ownership without owning the board", async () => {
            // Create a new board to rename later.
            const boardCreationToken = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            const createResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${boardCreationToken}`)
                .send({ title: "Board to Rename with Root Catalog" });

            expect(createResponse.body).toHaveProperty("boardId");
            const boardToRenameId = createResponse.body.boardId;

            // Token with 'root' catalog ownership to rename the board.
            const tokenWithRootCatalog = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            // Attempt to rename the board with a different token that has root catalog ownership.
            const newTitle = "Renamed Board with Root Catalog";
            await request(server)
                .patch(`/api/v1/boards/${boardToRenameId}`)
                .set("Authorization", `Bearer ${tokenWithRootCatalog}`)
                .send({ newTitle: newTitle })
                .expect(200); // Board renaming should succeed.
        });
    });

    describe("Create a Link", () => {
        const userId = "user-123";
        let boardId: any;

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
                .send({ type: "view" })
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
                owns: { boards: [] },
            });

            await request(server)
                .post(`/api/v1/boards/${boardId}/links`)
                .set("Authorization", `Bearer ${token}`)
                .send({ type: "view" })
                .expect(403); // Forbidden
        });

        it("should create a new link for the board with 'root' catalog ownership without owning the board", async () => {
            // Create a new board to create links for later.
            const boardCreationToken = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            const createResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${boardCreationToken}`)
                .send({ title: "Board to Create Links with Root Catalog" });

            expect(createResponse.body).toHaveProperty("boardId");
            const boardToCreateLinkId = createResponse.body.boardId;

            // Token with 'root' catalog ownership to create the link.
            const tokenWithRootCatalog = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            // Attempt to create a new link on the board with a token that has root catalog ownership.
            await request(server)
                .post(`/api/v1/boards/${boardToCreateLinkId}/links`)
                .set("Authorization", `Bearer ${tokenWithRootCatalog}`)
                .send({ type: "view" }) // You can change to "edit" if needed
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty("linkId");
                    expect(response.body).toHaveProperty("linkUri");
                }); // Link creation should succeed.
        });
    });

    describe("Delete a Link", () => {
        const userId = "user-123";
        let boardId: any;
        let linkId: any;
        let deletionToken: string;

        beforeAll(async () => {
            const creationToken = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            const boardCreationResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${creationToken}`)
                .send({ title: "Test Board for Link Deletion" });
            boardId = boardCreationResponse.body.boardId;

            const linkCreationToken = await createTestToken(userId, {
                owns: { boards: [boardId] },
            });
            const linkCreationResponse = await request(server)
                .post(`/api/v1/boards/${boardId}/links`)
                .set("Authorization", `Bearer ${linkCreationToken}`)
                .send({ type: "edit" }); // или type: "read"
            linkId = linkCreationResponse.body.linkId;

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

        it("should delete a link from a board with 'root' catalog ownership without owning the board", async () => {
            // Create a new board and link to be deleted later.
            const boardCreationToken = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            // Create a new board which will have a link to delete
            const createResponse = await request(server)
                .post("/api/v1/boards")
                .set("Authorization", `Bearer ${boardCreationToken}`)
                .send({ title: "Board for Link Deletion with Root Catalog" });
            expect(createResponse.body).toHaveProperty("boardId");
            const boardToDeleteLinkId = createResponse.body.boardId;

            // Create the link
            const linkCreationToken = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });
            const linkCreationResponse = await request(server)
                .post(`/api/v1/boards/${boardToDeleteLinkId}/links`)
                .set("Authorization", `Bearer ${linkCreationToken}`)
                .send({ type: "edit" });
            expect(linkCreationResponse.body).toHaveProperty("linkId");
            const linkIdToDelete = linkCreationResponse.body.linkId;

            // Token with 'root' catalog ownership to delete the link.
            const tokenWithRootCatalogToDelete = await createTestToken(userId, {
                owns: { catalogs: ["root"] },
            });

            // Attempt to delete the link with a token that has root catalog ownership.
            await request(server)
                .delete(
                    `/api/v1/boards/${boardToDeleteLinkId}/links/${linkIdToDelete}`
                )
                .set("Authorization", `Bearer ${tokenWithRootCatalogToDelete}`)
                .expect(204); // Link deletion should succeed.
        });
    });
});
