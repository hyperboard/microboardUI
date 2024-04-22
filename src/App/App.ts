import "Lang";
import { getRender } from "View";
import { Clipboard } from "./Clipboard";
import { Location } from "./Location";
import { Board } from "Board";
import { Accounts } from "./Accounts";
import { Storage } from "./Storage";
import { Subject } from "../Subject";
import { getApiUrl } from "Config";
import { Connection } from "./Connection";
import { getSubscriptions } from "./getSubscriptions";
import { getController } from "./getController";

pdfjsLib.GlobalWorkerOptions.workerSrc =
	"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";

export function createApp(isHistory = true) {
	const connection = new Connection();
	const clipboard = new Clipboard();
	const location = new Location();
	const storage = new Storage();
	const accounts = new Accounts(connection);

	let board = undefined;

	function getBoard() {
		return board;
	}

	const controller = getController(getBoard);
	const subscriptions = getSubscriptions(getBoard);

	const boards = new Map();
	const boardSubject = new Subject();

	async function openStartingBoard() {
		let id = getStartingBoardId();
		if (!id) {
			id = await createPublicBoard();
		}
		openBoard(id);
	}

	function getStartingBoardId() {
		if (accounts.isLoggedIn()) {
			return null;
		}

		const locationId = location.getCurrentBoardId();
		if (locationId) {
			storage.setPublicBoard({ boardId: locationId });
			return locationId;
		}
		return null;
		const visited = storage.listPublicBoards();
		const lastVisited = visited[visited.length - 1];
		if (lastVisited) {
			return lastVisited;
		}
		return null;
	}

	async function createPublicBoard() {
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
			return linkId;
		} catch (error) {
			console.error("Failed to create a new public board.", error);
		}
	}

	function openBoard(id) {
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

	const app = {
		connection,
		clipboard,
		location,
		storage,
		controller,
		accounts,
		boards,
		boardSubject,
		board,
		subscriptions,
		openStartingBoard,
		getStartingBoardId,
		createPublicBoard,
		openBoard,
		getBoard,
		render,
	};

	function render() {
		getRender(app)();
	}

	return app;
}

export type App = ReturnType<typeof createApp>;
