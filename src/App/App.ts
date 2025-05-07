import { Board } from "Board";
import { BoardSnapshot } from "Board/Board";
import { createEvents } from "Board/Events/Events";
import { conf } from "Board/Settings";
import { Account } from "entities/account";
import { getAuthInterceptor } from "entities/account/AuthInterceptor";
import { api, boardsApi } from "shared/api";
import { foldersApi } from "shared/apiV2";
import { apiV2 } from "shared/apiV2/base";
import "shared/Lang";
import { MemoryLogger } from "shared/Logger";
import { notify } from "shared/ui-lib/Toast";
import { v4 as uuidv4 } from "uuid";
import { Subject } from "../shared/Subject";
import { BoardsList } from "./BoardsList";
import { Clipboard } from "./Clipboard";
import { Connection, createConnection } from "./Connection";
import { Controller, getController } from "./getController";
import { Subscriptions, getSubscriptions } from "./getSubscriptions";
import { Location } from "./Location";
import { getLocalRender, getRender } from "./router";
import { SessionStorage } from "./SessionStorage";
import { Storage } from "./Storage";
import { TestRecorder, createTester } from "./testRecorder";
import { Operation } from "Board/Events";

const { i18n } = conf;

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
	localRender: (id: string) => void;
	test: TestRecorder;
	getSnapshot(boardId: string): BoardSnapshot | null;
	sessionStorage: SessionStorage;
	getConnectedBoard: (boardId: string) => Board | null;
	openAndEditFile(): Promise<string | undefined>;
	enableLogger(): void;
	disableLogger(): void;
	getLocalEditFileHandler: () => FileSystemFileHandle | undefined;
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
	// chrome handler for saving file
	let fileHandle: FileSystemFileHandle | undefined = undefined;

	function enableLogger(): void {
		MemoryLogger.enable();
	}

	function disableLogger(): void {
		MemoryLogger.downloadLogs(
			`microboard-logs-${new Date().toLocaleString()}.txt`,
		);
		MemoryLogger.disable();
	}

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

	// function isLoggedIn(): boolean {
	// 	return account.isLoggedIn;
	// }

	const controller = getController(getBoard, clipboard, account);
	const subscriptions = getSubscriptions(getBoard);

	const boards = new Map<string, Board>();
	const boardSubject = new Subject();

	const authInterceptor = getAuthInterceptor(account);
	api.interceptors.addRequestInterceptor(authInterceptor);
	apiV2.interceptors.addRequestInterceptor(authInterceptor);

	async function openBoard(id: string, accessKey?: string): Promise<void> {
		const appBoard = app.getBoard();
		window.localStorage.setItem("PrevBoardDEBUG", appBoard?.getBoardId());
		if (id === "boards" || appBoard?.getBoardId() === id) {
			return;
		}

		let currentBoard = boards.get(id);
		if (!currentBoard) {
			currentBoard = new Board(id, accessKey);
			if (id !== "blank") {
				await connection.publishAuth();
				connectBoard(currentBoard).then(() => {
					appBoard?.cleanup();
					console.log("SECOND CLEANUP", appBoard);
				});
			}
			boards.set(id, currentBoard);
		}
		if (id !== "blank") {
			localStorage.setItem(LAST_BOARD_KEY, id);
			localStorage.setItem(
				LAST_BOARD_KEY_QS,
				`${id}${window.location.search}`,
			);
			boardsList.visitBoard(id).then(() => {
				appBoard?.cleanup();
				console.log("THIRD CLEANUP", appBoard);
			});
		} else {
			localStorage.removeItem(LAST_BOARD_KEY);
		}
		sessionStorage.clear();
		subscriptions.setBoard(currentBoard);
		boardSubject.publish(currentBoard);
		board = currentBoard;
		if (!board.getName()) {
			board.setName(boardsList.getBoardInfo(id)?.title);
		}

		appBoard?.setIsOpen(false);
		const newBoard = app.getBoard();
		if (!newBoard.camera.useSavedSnapshot(newBoard.getCameraSnapshot())) {
			if (newBoard.items.listAll().length > 0) {
				const itemsMbr = newBoard.items.getMbr();
				newBoard.camera.zoomToFit(itemsMbr);
			}
		}

		const isItemsOnBoard =
			newBoard.items.listAll().length > 0 ||
			newBoard.items.listFrames().length > 0;

		if (newBoard.items.getItemsInView().length === 0 && isItemsOnBoard) {
			newBoard.camera.zoomToFit(newBoard.items.getMbr());
		}

		newBoard.setIsOpen(true);

		console.log("NEW BOARD", newBoard);
	}

	function resetOpenedBoards(): void {
		Object.values(boards).forEach(board => {
			board.disconnect();
		});
	}

	async function connectBoard(board: Board): Promise<void> {
		if (board.getBoardId() === "blank") {
			return;
		}
		const currIndex = board.getSnapshot().lastIndex;
		// temporaly disable snapshot cache
		// TODO: reenable when fixed multiple snapshots for one board
		// const snapshot = await this.getSnapshotFromCache();
		const snapshot = undefined;

		board.events = createEvents(
			board,
			connection,
			currIndex || snapshot?.lastIndex || 0,
			notify,
			account,
		);
		board.presence.addEvents(board.events);
		board.presence.setCurrentUser(
			localStorage.getItem(`currentUser`) ||
				(() => {
					const uuid = uuidv4();
					localStorage.setItem(`currentUser`, uuid);
					return uuid;
				})(),
		);
		board.selection.events = board.events;

		if (snapshot && currIndex === 0) {
			// board.deserialize(snapshot);
		}
		board.resolveConnecting();
		setTimeout(() => {
			board.items.subject.publish(board.items);
		}, 0);
		setTimeout(() => {
			board.items.subject.publish(board.items);
		}, 1000);
	}

	async function openBoardFromFile(): Promise<void> {
		app.getBoard()?.cleanup();
		const id = "local";

		const currentBoard = new Board(
			id,
			undefined,
			saveEditingFile.bind(app),
		);
		connectBoard(currentBoard);
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

	function getConnectedBoard(boardId: string): Board | null {
		return boards.get(boardId) || null;
	}

	async function getFileForLocalEdit(): Promise<File> {
		// chrome
		if ("showOpenFilePicker" in window) {
			const [newFileHandle] = await window.showOpenFilePicker();
			fileHandle = newFileHandle;
			const file = await newFileHandle.getFile();
			return file;
		}

		// others
		const file = await new Promise<File>((resolve, reject) => {
			const input = document.createElement("input");
			input.type = "file";

			input.onchange = event => {
				const selectedFile = (event.target as HTMLInputElement)
					.files?.[0];
				if (selectedFile) {
					resolve(selectedFile);
				} else {
					reject(new Error("No selected file"));
				}
			};

			input.onerror = () => {
				reject(new Error("Error while selecting file"));
			};

			input.click();
		});

		return file;
	}

	async function openAndEditFile(): Promise<string | undefined> {
		try {
			const isSnapshotInIframe =
				window.parent &&
				window.parent !== window &&
				window.parent.location.href.includes("/snapshots/");

			if (isSnapshotInIframe) {
				const snapshotId =
					window.parent.location.href.split("/snapshots/")[1];
				const snapshot = document.documentElement.outerHTML;

				const boardId = await boardsList.createBoard(
					snapshotId.split("?")[0] + " copy",
					!account.isLoggedIn,
				);
				await app.connection.connect();
				window.parent.history.pushState({}, "", `/boards/${boardId}`);
				await app.openBoard(boardId);
				const addedIds = app
					.getBoard()
					.deserializeHTMLAndEmit(snapshot);

				const promise = new Promise<void>(resolve => {
					const reloadInterval = setInterval(() => {
						const confirmedEvents = app
							.getBoard()
							.events?.getRaw().confirmedEvents;
						const flatOperations: Operation[] =
							confirmedEvents?.flatMap(ev =>
								"operations" in ev.body
									? (ev.body.operations as Operation[])
									: ev.body.operation,
							) || [];
						const confirmedAddedIds = flatOperations
							.filter(op => op.method === "add")
							.flatMap(op => op.item);
						if (confirmedAddedIds.length >= addedIds.length) {
							const set1 = new Set(addedIds);
							const set2 = new Set(confirmedAddedIds);
							for (const val of set1) {
								if (!set2.has(val)) {
									return;
								}
							}

							clearInterval(reloadInterval);
							window.parent.location.reload();
							resolve();
						}
					}, 5_000);
				});
				await promise;

				return;
			}
			const file = await getFileForLocalEdit();
			const contents = await file.text();

			return contents;
		} catch (err) {
			console.error("Streaming file err:", err);
			return undefined;
		}
	}

	async function saveEditingFile(): Promise<void> {
		if (!fileHandle) {
			return;
		}

		async function getData(): Promise<string> {
			const items = getBoard().items.getWholeHTML(conf.documentFactory);
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
				: getBoard().serializeHTML.bind(getBoard());

		const data = await serializer();
		const writable = await fileHandle.createWritable();
		await writable.write(data);
		await writable.close();
	}

	const app: App = {
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
		enableLogger,
		disableLogger,
		getLocalEditFileHandler: () => fileHandle,
	};

	account.setOnInit(async () => {
		await foldersApi.initFolders();
		await boardsList.claim();
		storage.softClean();
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
			boardsList.subject.publish();
		});
		account.setOnLogout(async () => {
			storage.hardClean();
			connection.publishLogout();
			resetOpenedBoards();
			localStorage.removeItem(LAST_BOARD_KEY);

			router.navigate(`/${window.location.search}`);
			await boardsList.loadBoards();
			// await disconnect(wagmiConfig);
			account.subject.publish(account.info);
		});
		account.setOnSessionExpired(() => {
			account.onLogout?.();
			router.navigate(`/auth/sign-in${window.location.search}`);
			notify({
				body: i18n.t("auth.sessionExpired"),
				variant: "error",
			});
		});
		render();
	}

	function localRender(id: string): void {
		const render = getLocalRender(app, id);

		render();
	}

	return app;
}
