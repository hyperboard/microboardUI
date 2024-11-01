import { Board } from "Board";
import { BoardSnapshot } from "Board/Board";
import "Lang";
import { getRender } from "View";
import { Subject } from "../Subject";
import { Account } from "./Account";
import { BoardsList } from "./BoardsList";
import { Clipboard } from "./Clipboard";
import { Connection, createConnection } from "./Connection";
import { Controller, getController } from "./getController";
import { Subscriptions, getSubscriptions } from "./getSubscriptions";
import { Location } from "./Location";
import { Storage } from "./Storage";
import { TestRecorder, createTester } from "./testRecorder";
import { api } from "shared/api";
import { getAuthInterceptor } from "./AuthInterceptor";
import { notify } from "View/Ui/Toast";
import i18next from "i18next";
import { SessionStorage } from "./SessionStorage";

export const LAST_BOARD_KEY = "lastSeenBoard";
export const LAST_BOARD_KEY_QS = LAST_BOARD_KEY.concat("Wqs");

export interface App {
	connection: Connection;
	clipboard: Clipboard;
	location: Location;
	storage: Storage;
	controller: Controller;
	account: Account;
	boardsList: BoardsList;
	boardSubject: Subject<unknown>;
	subscriptions: Subscriptions;
	openBoard: (id: string) => Promise<void>;
	getBoard: () => Board;
	getLastBoardId: () => string | null;
	render: () => void;
	test: TestRecorder;
	getSnapshot(boardId: string): BoardSnapshot | null;
	sessionStorage: SessionStorage;
}

export function createApp(isHistory = true): App {
	const connection = createConnection(getBoard);
	const clipboard = new Clipboard();
	const location = new Location();
	const storage = new Storage();
	const account = new Account(storage, connection);
	const boardsList = new BoardsList(storage, account);
	const sessionStorage = new SessionStorage();

	const test = createTester(getBoard);

	let board: Board;

	function getBoard(): Board {
		return board;
	}

	const controller = getController(getBoard, clipboard);
	const subscriptions = getSubscriptions(getBoard);

	const boards = new Map();
	const boardSubject = new Subject();

	api.interceptors.addRequestInterceptor(getAuthInterceptor(account));

	async function openBoard(id: string): Promise<void> {
		app.getBoard()?.selection.quickAddButtons.clear();
		if (id === "boards") {
			return;
		}

		if (account.isLoggedIn) {
			await account.refreshTokens();
			if (account.accessToken) {
				connection.publishAuth(account.accessToken);
			}
		}
		let currentBoard = boards.get(id);
		if (!currentBoard) {
			currentBoard = new Board(id);
			currentBoard.connect(connection);
			boards.set(id, currentBoard);
		}
		if (id !== "blank") {
			localStorage.setItem(LAST_BOARD_KEY, id);
			localStorage.setItem(
				LAST_BOARD_KEY_QS,
				`${id}${window.location.search}`,
			);
		}
		if (
			!boardsList.publicBoards.some(b => b.id === id) &&
			!boardsList.sharedBoards.some(b => b.id === id) &&
			id !== "blank"
		) {
			boardsList.visitBoard(id);
		}
		sessionStorage.clear();
		subscriptions.setBoard(currentBoard);
		boardSubject.publish(currentBoard);
		board = currentBoard;
		if (boardsList.showedErrorModals[id]) {
			boardsList.showedErrorModals[id] = false;
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
		account,
		boardsList,
		boardSubject,
		subscriptions,
		openBoard,
		getBoard,
		getLastBoardId,
		render,
		test,
		getSnapshot,
		sessionStorage,
	};

	function render(): void {
		const { render, router } = getRender(app);
		boardSubject.subscribe(() => {
			boardsList.subject.publish();
		});
		account.setOnLogout(async () => {
			const boardId = board.getBoardId();
			storage.hardClean();
			if (boardId && boardId !== "blank") {
				await openBoard(boardId);
				router.navigate(`/boards/${boardId}`);
			} else {
				router.navigate(`/`);
			}
			await boardsList.loadBoards();
			account.subject.publish(account.info);
		});
		account.setOnSessionExpired(() => {
			router.navigate("/auth/sign-in");
			notify({
				body: i18next.t("auth.sessionExpired"),
				variant: "error",
			});
		});
		render();
	}

	return app;
}
