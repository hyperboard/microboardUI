import request from "supertest";
import { getExpressApp } from "./getExpressApp";

describe("request.agent(app)", () => {
	const appPromise = getExpressApp();

	it("Gets a hello", async () => {
		const agent = request.agent(await appPromise);
		const response = await agent.get("/");
		expect(response.statusCode).toBe(200);
	});

	it("Gets a new board", async () => {
		const agent = request.agent(await appPromise);
		const response = await agent.get("/boards/1");
		expect(response.body.board).toBe("/boards/1");
	});

	it("Gets an existing board", async () => {
		const agent = request.agent(await appPromise);
		const response = await agent.get("/boards/1");
		expect(response.body.board).toBe("/boards/1");
	});

	it("Posts an event", async () => {
		const agent = request.agent(await appPromise);
		const getBoard = await agent.get("/boards/1");
		expect(getBoard.body.board).toBe("/boards/1");
		await agent.post("/boards/1").send({ id: "1:1", body: { one: "one" } });
		await agent.post("/boards/1").send({ id: "1:2", body: { two: "two" } });
		const getEvents = await agent.get("/boards/1");
		expect(getEvents.body.events[0]).toMatchObject({
			order: 1,
			id: "1:1",
			body: { one: "one" },
		});
		expect(getEvents.body.events[1]).toMatchObject({
			order: 2,
			id: "1:2",
			body: { two: "two" },
		});
	});
});
