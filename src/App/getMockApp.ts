import { Connection } from "Connection";
import { MockPublisher } from "Connection/Publisher";
import { getMockSubscription } from "Connection/Subscription";
import { App } from "./App";

export function getMockApp(): App {
	const publisher = new MockPublisher();

	const connection = new Connection(
		"http://localhost:8080",
		() => publisher,
		getMockSubscription(publisher),
	);

	return new App(connection);
}
