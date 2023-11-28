import { SocketMessage } from "../SocketMessage";
import { Publisher } from "./Publisher";
import { asyncPost } from "../HttpUtils";

export class HttpPublisher implements Publisher {
	readonly queue: MessageContainer[] = [];

	constructor() {
		setInterval(this.publishAsync, 50);
	}

	publish = (boardId: string, message: SocketMessage): void => {
		this.queue.push({ boardId, message });
	};

	publishAsync = async (): Promise<void> => {
		let container;

		if (this.queue.length && (container = this.queue.shift())) {
			const boardId = container.boardId;
			const message = container.message;
			await asyncPost(`/boards/${boardId}/events`, message);
		}
	};

	/* 	private onBadResponse = (response: Response): void => {
		if (!response.ok) {
			throw new Error("response not OK");
		}
	};

	private onError = (error: Error): void => {
		console.error("POST Events Network response error", error);
	}; */
}

interface MessageContainer {
	boardId: string;
	message: SocketMessage;
}
