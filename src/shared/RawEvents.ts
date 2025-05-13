import { BoardEvent } from "Board/Events/Events";

export interface RawEvents {
	confirmedEvents: BoardEvent[];
	eventsToSend: BoardEvent[];
	newEvents: BoardEvent[];
}
