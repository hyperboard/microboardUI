import {BoardEventBody} from "../Board/Events";
import {BoardEvent} from "../Board/Events/Events";
import winston from "winston";
import {Boards} from "./Boards";

export class EventsManager {
	readonly boardsInProcess: string[] = [];

	constructor(private boards: Boards,
				private onSaveBoardEvents: (boardId: string, event: BoardEvent[]) => void,
				private logger: winston.Logger) {
	}

	saveBodyEvents(boardId: string, eventBodyQueue: BoardEventBody[]): void {
		this.logger.info(`EventsManager.saveBodyEvents(): START boardId=${boardId} | length: ${eventBodyQueue.length}`);
		this.boardsInProcess.push(boardId);
		this.boards.getBoard(boardId).then(board => {
			if (board) {
				let eventBody: BoardEventBody | undefined;
				const savedBoardEvents: BoardEvent[] = [];
				const nextEvent: () => void = () => {
					if (eventBodyQueue.length > 0 && (eventBody = eventBodyQueue.shift())) {
						board.addEvent(eventBody.eventId, eventBody).then(boardEvent => {
							savedBoardEvents.push(boardEvent);
						}).finally(nextEvent)
					} else {
						this.finishBoard(boardId);
						this.onSaveBoardEvents(boardId, savedBoardEvents);
					}
				}
				nextEvent();
			} else {
				this.finishBoard(boardId);
			}
		}).catch(() => {
			this.finishBoard(boardId);
		});
	}

	isBoardInProcess(boardId: string): boolean {
		return this.boardsInProcess.includes(boardId);
	}

	isBoardReady(boardId: string): boolean {
		return !this.isBoardInProcess(boardId);
	}

	private finishBoard(boardId: string): void {
		this.logger.info(`EventsManager.finishBoard(): boardId=${boardId}`);
		const index = this.boardsInProcess.indexOf(boardId);
		if (index > -1) {
			this.boardsInProcess.splice(index, 1);
		}
	}
}

export class EventsQueueManager {
	private eventsQueue: EventsQueue[] = [];

	addEvent(boardId: string, eventBody: BoardEventBody): void {
		const eventsQueue = this.eventsQueue.find(eventsQueue => eventsQueue.boardId === boardId);
		if (eventsQueue) {
			eventsQueue.eventBodyQueue.push(eventBody);
		} else {
			this.eventsQueue.push({boardId, eventBodyQueue: [eventBody]});
		}
	}

	getEventsQueue(boardId: string): EventsQueue | undefined {
		return this.eventsQueue.find(eventsQueue => eventsQueue.boardId === boardId);
	}

	remove(eventsQueue: EventsQueue): void {
		this.eventsQueue.splice(this.eventsQueue.indexOf(eventsQueue), 1);
	}

	getAllQueue(): EventsQueue[] {
		return this.eventsQueue;
	}
}

export interface EventsQueue {
	boardId: string;
	eventBodyQueue: BoardEventBody[];
}
