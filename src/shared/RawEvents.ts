import { BoardEvent } from "microboard-temp";

export interface RawEvents {
  confirmedEvents: BoardEvent[];
  eventsToSend: BoardEvent[];
  newEvents: BoardEvent[];
}
