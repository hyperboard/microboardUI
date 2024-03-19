import supertest from "supertest";
import fs from "fs";
import path from "path";
import { getApp } from "getApp";
import jwt from "jsonwebtoken";
import { AccessToken } from "Interface";

const privateKeyPath = process.env.TEST_PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(path.resolve(privateKeyPath), "utf8");

const app = getApp();
const request = supertest(app);

const createTestUserToken = (permissions: Record<string, string[]>): string => {
    const claims: AccessToken = {
        sub: "test-user-id", // subject should be a test user id
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // token expiry 1 hour from now
        iat: Math.floor(Date.now() / 1000), // issued at current time
        jti: "test-jwt-id", // unique identifier for this token
        aud: "test-audience", // intended audience for the token
        iss: "test-issuer", // issuer of the token
        ...permissions,
    };

    return jwt.sign(claims, privateKey, { algorithm: "RS256" });
};

describe("POST /boards", () => {
    it("should create a new board", async () => {
        const token = createTestUserToken({ "any-board-id": ["create"] });

        const response = await request
            .post("/boards")
            .set("Authorization", token)
            .send({ title: "Test Board" })
            .expect(201);

        expect(response.body).toHaveProperty("boardId");
        expect(response.body).toHaveProperty("boardUrl");
        expect(response.body.boardUrl).toEqual(
            `/boards/${response.body.boardId}`
        );
    });

    it("should return 401 Unauthorized without token", async () => {
        const response = await request
            .post("/boards")
            .send({ title: "Test Board" })
            .expect(401);

        expect(response.body).toEqual({ message: "Unauthorized" });
    });

    it("should return 400 Bad Request with invalid title", async () => {
        const token = createTestUserToken({ "any-board-id": ["create"] });

        const response = await request
            .post("/boards")
            .set("Authorization", token)
            .send({ title: 123 }) // invalid title type
            .expect(400);

        expect(response.body).toHaveProperty("errors");
    });
});
