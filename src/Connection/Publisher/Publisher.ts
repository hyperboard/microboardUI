import { SocketMessage } from "../SocketMessage";

export interface Publisher {
	publish: (boardId: string, message: SocketMessage) => void;
}
