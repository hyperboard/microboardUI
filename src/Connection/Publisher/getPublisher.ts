import { HttpPublisher } from "./HttpPublisher";
import { MockPublisher } from "./Publisher.mock";
import { Publisher } from "./Publisher";
import { WebsocketPublisher } from "./WebsocketPublisher";

export function getWebsocketOrHttpPublisher(): Publisher {
	if (window.useHTTPSubscription) {
		return new HttpPublisher();
	} else {
		return new WebsocketPublisher();
	}
}

export function getMockPublisher(): Publisher {
	return new MockPublisher();
}
