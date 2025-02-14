import { Board } from "Board";
import { BoardSnapshot } from "Board/Board";
import "Lang";
import { getRender } from "View";
import { Subject } from "../Subject";
import { Account } from "./Account";
import { BoardsList } from "./BoardsList";
import { Clipboard } from "./Clipboard";
import { Connection, createConnection } from "./Connection";
import { Controller } from "./getController";
import { getController } from "./getController";
import { Subscriptions, getSubscriptions } from "./getSubscriptions";
import { Location } from "./Location";
import { Storage } from "./Storage";
import { TestRecorder, createTester } from "./testRecorder";
import { api } from "shared/api";
import { getAuthInterceptor } from "./AuthInterceptor";
import { notify } from "View/Ui/Toast";
import i18next from "i18next";
import { SessionStorage } from "./SessionStorage";
import { apiV2 } from "shared/apiV2/base";
import { foldersApi } from "shared/apiV2";
import { getLocalRender } from "View/router";
import { wagmiConfig } from "View/ContextWrapper";
import { disconnect } from "@wagmi/core";

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
	openBoard: (id: string, accessKey?: string) => Promise<void>;
	openBoardFromFile: () => Promise<void>;
	getBoard: () => Board;
	getConnection: () => Connection;
	getLastBoardId: () => string | null;
	render: () => void;
	localRender: () => void;
	test: TestRecorder;
	getSnapshot(boardId: string): BoardSnapshot | null;
	sessionStorage: SessionStorage;
	getConnectedBoard: (boardId: string) => Board | null;
	openAndEditFile(): Promise<string | undefined>;
}

export function createApp(isHistory = true): App {
	const connection = createConnection(getBoard, getAccount, getStorage);
	const clipboard = new Clipboard();
	const location = new Location();
	const storage = new Storage();
	const sessionStorage = new SessionStorage();
	const account = new Account(storage, sessionStorage, connection);
	const boardsList = new BoardsList(storage, account);

	const test = createTester(getBoard);

	let board: Board;
	let fileHandle: FileSystemFileHandle | undefined = undefined;

	function getConnection(): Connection {
		return connection;
	}

	function getBoard(): Board {
		return board;
	}

	function getAccount(): Account {
		return account;
	}

	function getStorage(): Storage {
		return storage;
	}

	function isLoggedIn(): boolean {
		return account.isLoggedIn;
	}

	const controller = getController(getBoard, clipboard, isLoggedIn);
	const subscriptions = getSubscriptions(getBoard);

	const boards = new Map<string, Board>();
	const boardSubject = new Subject();

	const authInterceptor = getAuthInterceptor(account);
	api.interceptors.addRequestInterceptor(authInterceptor);
	apiV2.interceptors.addRequestInterceptor(authInterceptor);

	async function openBoard(id: string, accessKey?: string): Promise<void> {
		app.getBoard()?.selection.quickAddButtons.clear();
		if (id === "boards") {
			return;
		}

		let currentBoard = boards.get(id);
		if (!currentBoard) {
			currentBoard = new Board(id, accessKey);
			if (id !== "blank") {
				currentBoard.connect(connection);
			}
			boards.set(id, currentBoard);
		}
		if (id !== "blank") {
			localStorage.setItem(LAST_BOARD_KEY, id);
			localStorage.setItem(
				LAST_BOARD_KEY_QS,
				`${id}${window.location.search}`,
			);
			boardsList.visitBoard(id);
		}
		// sessionStorage.clear();
		subscriptions.setBoard(currentBoard);
		boardSubject.publish(currentBoard);
		board = currentBoard;
	}

	async function openBoardFromFile(): Promise<void> {
		app.getBoard()?.selection.quickAddButtons.clear();
		const id = "local";

		const currentBoard = new Board(
			id,
			undefined,
			saveEditingFile.bind(app),
		);
		currentBoard.connect(connection);
		subscriptions.setBoard(currentBoard);
		boardSubject.publish(currentBoard);
		currentBoard.setInterfaceType("edit");
		board = currentBoard;
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

	function getConnectedBoard(boardId: string): Board | undefined {
		return boards.get(boardId);
	}

	async function openAndEditFile(): Promise<string | undefined> {
		try {
			const [newFileHandle] = await window.showOpenFilePicker();
			fileHandle = newFileHandle;

			const file = await newFileHandle.getFile();
			const contents = await file.text();

			return contents;
		} catch (err) {
			fileHandle = undefined;
			console.error("Streaming file err:", err);
		}
		return;
	}

	async function saveEditingFile(): Promise<void> {
		if (!fileHandle) {
			return;
		}

		async function getData(): Promise<string> {
			const items = getBoard().items.getWholeHTML();
			const docCopy = document.cloneNode(true) as Document;

			const head = document.head.cloneNode(true);
			const headElement = docCopy.querySelector("head");
			if (headElement) {
				headElement.replaceWith(head);
			} else {
				docCopy.documentElement.insertBefore(head, docCopy.body);
			}

			const reactDiv = docCopy.getElementById("items");
			if (reactDiv) {
				reactDiv.innerHTML = items;
			}

			const elements = docCopy.body.querySelectorAll(
				"button, style, #sprite",
			);
			elements.forEach(element => element.remove());

			return docCopy.documentElement.outerHTML;
		}

		const serializer =
			window.location.protocol === "file:"
				? getData
				: getBoard().serializeHTML;

		const data = await serializer();
		const writable = await fileHandle.createWritable();
		await writable.write(data);
		await writable.close();
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
		openBoardFromFile,
		getBoard,
		getConnection,
		getLastBoardId,
		render,
		localRender,
		test,
		getSnapshot,
		sessionStorage,
		getConnectedBoard,
		openAndEditFile,
	};

	account.setOnInit(async () => {
		await foldersApi.initFolders();
	});

	function render(): void {
		const { render, router } = getRender(app);
		boardSubject.subscribe(() => {
			boardsList.subject.publish();
		});
		account.setOnLogin(async () => {
			await foldersApi.initFolders();
			await boardsList.claim();
			storage.softClean();
			const boardId = board?.getBoardId();
			if (boardId && boardId !== "blank") {
				await openBoard(boardId);
				router.navigate(`/boards/${boardId}${window.location.search}`);
			} else {
				router.navigate(`/${window.location.search}`);
			}
			boardsList.subject.publish();
		});
		account.setOnLogout(async () => {
			const boardId = board.getBoardId();
			storage.hardClean();
			connection.publishLogout();
			if (boardId && boardId !== "blank") {
				await openBoard(boardId);
				router.navigate(`/boards/${boardId}${window.location.search}`);
				connection.publishGetMode();
			} else {
				router.navigate(`/${window.location.search}`);
			}
			await boardsList.loadBoards();
			await disconnect(wagmiConfig);
			account.subject.publish(account.info);
		});
		account.setOnSessionExpired(() => {
			router.navigate(`/auth/sign-in${window.location.search}`);
			notify({
				body: i18next.t("auth.sessionExpired"),
				variant: "error",
			});
			Cookies.remove("first_visit");
		});

		render();
	}

	function localRender(id: string): void {
		const render = getLocalRender(app, id);

		render();
	}

	return app;
}
