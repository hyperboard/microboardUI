import "Lang";
import { getRender } from "View";
import { Clipboard } from "./Clipboard";
import { Location } from "./Location";
import { Board } from "Board";
import { Accounts } from "./Accounts";
import { Storage } from "./Storage";
import { Subject } from "../Subject";
import { getApiUrl } from "Config";
import { Connection, createConnection } from "./Connection";
import { Subscriptions, getSubscriptions } from "./getSubscriptions";
import { Controller, getController } from "./getController";
import { TestRecorder, createTester } from "./testRecorder";
import { BoardSnapshot } from "Board/Board";

pdfjsLib.GlobalWorkerOptions.workerSrc =
	"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";

interface App {
	connection: Connection;
	clipboard: Clipboard;
	location: Location;
	storage: Storage;
	controller: Controller;
	accounts: Accounts;
	boardSubject: Subject<unknown>;
	subscriptions: Subscriptions;
	openStartingBoard: () => Promise<void>;
	getStartingBoardId: () => string | null;
	createPublicBoard: () => Promise<string>;
	openBoard: (id: string) => void;
	getBoard: () => Board;
	render: () => void;
	test: TestRecorder;
	getSnapshot(boardId: string): BoardSnapshot | null;
}

export function createApp(isHistory = true): App {
	const connection = createConnection();
	const clipboard = new Clipboard();
	const location = new Location();
	const storage = new Storage();
	const accounts = new Accounts(connection);
	const test = createTester(getBoard);

	let board: Board;

	function getBoard(): Board {
		return board;
	}

	const controller = getController(getBoard);
	const subscriptions = getSubscriptions(getBoard);

	const boards = new Map();
	const boardSubject = new Subject();

	async function openStartingBoard(): Promise<void> {
		let id = getStartingBoardId();
		if (!id) {
			id = await createPublicBoard();
		}
		openBoard(id);
	}

	function getStartingBoardId(): string | null {
		if (accounts.isLoggedIn()) {
			return null;
		}

		const locationId = location.getCurrentBoardId();
		if (locationId) {
			storage.setPublicBoard({ boardId: locationId });
			return locationId;
		}
		return null;
	}

	async function createPublicBoard(): Promise<string> {
		try {
			const response = await fetch(`${getApiUrl()}/public-boards`, {
				method: "POST",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
				},
				redirect: "follow",
				referrerPolicy: "no-referrer",
			});
			if (!response.ok) {
				throw new Error("response not OK");
			}
			const data = await response.json();
			const { boardId, linkId, linkUri } = data;
			storage.setPublicBoard({ boardId: linkId, ownerId: boardId });
			return linkId as string;
		} catch (error) {
			console.error("Failed to create a new public board.", error);
		}
	}

	function openBoard(id): void {
		let currentBoard = boards.get(id);
		if (!currentBoard) {
			currentBoard = new Board(id);
			currentBoard.connect(connection);
			boards.set(id, currentBoard);
		}

		subscriptions.setBoard(currentBoard);
		boardSubject.publish(currentBoard);
		board = currentBoard;
	}

	function getSnapshot(id: string): BoardSnapshot | null {
		const board = boards.get(id);
		if (!board) {
			return null;
		}
		return board.getSnapshot();
	}

	const app = {
		connection,
		clipboard,
		location,
		storage,
		controller,
		accounts,
		boardSubject,
		subscriptions,
		openStartingBoard,
		getStartingBoardId,
		createPublicBoard,
		openBoard,
		getBoard,
		render,
		test,
		getSnapshot,
	};

	function render(): void {
		getRender(app)();
	}

	return app;
}
