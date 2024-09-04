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
import Cookies from "js-cookie";

const LAST_BOARD_KEY = "lastSeenBoard";

export interface App {
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
	createPublicBoard: (name?: string) => Promise<string>;
	createBoard: () => Promise<string>;
	openBoard: (id: string) => void;
	getBoard: () => Board;
	getLastBoardId: () => string | null;
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

	const controller = getController(getBoard, clipboard);
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

	async function createPublicBoard(name?: string): Promise<string> {
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
			const { boardId, linkId, linkUri, authorKey } = data;
			storage.setPublicBoard({
				boardId: linkId,
				authorKey,
				actualId: boardId,
			});
			return linkId as string;
		} catch (error) {
			console.error("Failed to create a new public board.", error);
		}
	}

	async function createBoard(): Promise<void> {
		try {
			const response = await fetch(`${getApiUrl()}/boards`, {
				method: "POST",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${Cookies.get("accessToken")}`,
				},
				redirect: "follow",
				referrerPolicy: "no-referrer",
			});
			if (!response.ok) {
				throw new Error("response not OK");
			}
			const data = await response.json();
			const { boardId, linkId, linkUri, authorKey } = data;
			storage.setPublicBoard({ boardId: linkId, authorKey });
			return linkId as string;
		} catch (error) {
			console.error("Failed to create a new public board.", error);
		}
	}

	function openBoard(id: string): void {
		app.getBoard()?.selection.quickAddButtons.clear();
		if (id === "boards") {
			return;
		}

		let currentBoard = boards.get(id);
		if (!currentBoard) {
			currentBoard = new Board(id);
			currentBoard.connect(connection);
			boards.set(id, currentBoard);
		}
		localStorage.setItem(LAST_BOARD_KEY, id);
		if (
			!storage.listPublicBoards().some(board => board.boardId === id) &&
			!storage.listSharedBoards().some(board => board.boardId === id) &&
			id !== "blank"
		) {
			storage.setPublicBoard({ boardId: id }, false);
			if (storage.isAuth) {
				storage.visitBoard({ boardId: id });
			}
		}

		subscriptions.setBoard(currentBoard);
		boardSubject.publish(currentBoard);
		board = currentBoard;
		if (app.storage.showedErrorModals[id]) {
			app.storage.showedErrorModals[id] = false;
			app.connection.wsClient.onAccessDenied(id, true);
			return;
		}
	}

	function getLastBoardId(): string | null {
		return localStorage.getItem(LAST_BOARD_KEY) || null;
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
		getLastBoardId,
		render,
		test,
		getSnapshot,
		createBoard,
	};

	function render(): void {
		getRender(app)();
	}

	return app;
}
