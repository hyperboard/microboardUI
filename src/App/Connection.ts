import { Board } from "Board/Board";
import { SyncBoardEvent, SyncEvent } from "Board/Events/Events";
import {
	PresenceEventMsg,
	PresenceEventType,
	UserJoinMsg,
} from "Board/Presence/Events";
import { conf } from "Board/Settings";
import { getApiUrl } from "Config";
import type { Account } from "entities/account";
import toast from "react-hot-toast";
import { Subject } from "shared/Subject";
import { notify } from "shared/ui-lib/Toast";
import { getWebsocketUrl } from "../Config";
import { Storage } from "./Storage";
import { VERSION } from "version";
const { i18n } = conf;

const SECOND = 1000;
const WS_RECONNECT_TIMEOUT = 5 * SECOND;
const WS_PING_INTERVAL = 10 * SECOND;
const SUBSCRIBE_TIMEOUT = 4 * SECOND;

const createPromiseWithResolvers = <T>(): {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (error: unknown) => void;
} => {
	let resolve!: (value: T) => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

type PromiseWithResolvers<T> = ReturnType<typeof createPromiseWithResolvers<T>>;

export interface AuthMsg {
	type: "Auth";
	jwt: string;
}

export interface LogoutMsg {
	type: "Logout";
}

export interface InvalidateRightsMsg {
	type: "InvalidateRights";
	boardId: string;
	byUser: boolean;
}

export interface GetModeMsg {
	type: "GetMode";
	boardId: string;
}

export interface BoardEventMsg {
	type: "BoardEvent";
	boardId: string;
	event: SyncEvent;
	sequenceNumber: number;
}

export interface ConfirmationMsg {
	type: "Confirmation";
	boardId: string;
	sequenceNumber: number;
	order: number;
}

export interface BoardEventListMsg {
	type: "BoardEventList";
	boardId: string;
	events: SyncBoardEvent[];
}

export interface SubscribeMsg {
	type: "Subscribe";
	boardId: string;
	userId: string;
	index: number;
	accessKey?: string;
}

export interface SubscribeConfirmationMsg {
	type: "SubscribeConfirmation";
	boardId: string;
	initialSequenceNumber: number;
}

export interface UnsubscribeMsg {
	type: "Unsubscribe";
	boardId: string;
}

export interface ErrorMsg {
	type: "Error";
	message: string;
	deniedBoardId?: string;
	expectedSequence?: number;
	receivedSequence?: number;
}

export interface VersionCheckMsg {
	type: "VersionCheck";
	version: string;
}

export interface SnapshotRequestMsg {
	type: "CreateSnapshotRequest";
	boardId: string;
}

export interface SnapshotResponseMsg {
	type: "BoardSnapshot";
	boardId: string;
	// snapshot: BoardSnapshot;
	snapshot: string;
	lastEventOrder: number;
}

export type ViewMode = "view" | "edit" | "loading";

export interface ModeMsg {
	type: "Mode";
	boardId: string;
	mode: ViewMode;
}

export interface AuthConfirmationMsg {
	type: "AuthConfirmation";
}

export interface PingMsg {
	type: "ping";
}

export interface BoardAccessDeniedMsg {
	type: "BoardAccessDenied";
	boardId: string;
}

export interface BoardSubscriptionCompletedMsg {
	type: "BoardSubscriptionCompleted";
	boardId: string;
	mode: "view" | "edit";
	// snapshot: BoardSnapshot | null;
	snapshot: string | null;
	lastSnapshotEventOrder: number;
	eventsSinceLastSnapshot: SyncBoardEvent[];
	initialSequenceNumber: number;
}

export interface AiChatMsg<T = AiChatEventType> {
	type: "AiChat";
	boardId: string;
	event: T;
}

export type AiChatEventType =
	| UserRequest
	| ChatChunk
	| StopGeneration
	| GenerateImageRequest
	| GenerateImageResponse
	| GenerateAudioRequest;

export type OpenAIModels =
	| "gpt-3.5-turbo"
	| "gpt-4"
	| "gpt-4o"
	| "GPT-4o"
	| "gpt-4o-mini"
	| "GPT-4o mini"
	| "gpt-4-32k"
	| "gpt-3.5-turbo-0613"
	| "gpt-4-0613"
	| "gpt-3.5-turbo-16k"
	| "gpt-4-16k"
	| "o1-mini"
	| "o1"
	| ImageModels
	| CustomModels
	| TextToSpeechModels;

type ImageModels =
	| "dall-e-2"
	| "dall-e-3"
	| "midjourney"
	| "flux-schnell"
	| "flux-pro"
	| "recraft";

type TextToSpeechModels = "tts-1-hd";

type CustomModels =
	| "deepseek-chat"
	| "deepseek-reasoner"
	| "sonar-deep-research";

export interface UserRequest {
	method: "UserRequest";
	context: number[]; // chat message context
	boardContext: string[];
	boardContextIds?: string[]; // just for frontend
	idea: string;
	model?: OpenAIModels; // default gpt-4-turbo-preview
	images?: string[]; // only with 4o and later. Image link or base64. Better use: `data:{type};base64,${base64}`
	updatedFrom?: number; // "user" message id
	itemId: string;
	requestItemId: string;
	action?: TextAction;
	userId: number;
	contextRequest?: {
		messageId: string;
		range?: number;
	};
}

export interface GenerateImageRequest {
	method: "GenerateImage";
	prompt: string;
	itemId: string;
	userId: number;
	options:
		| {
				model: "dall-e-2";
				size: "256x256" | "512x512" | "1024x1024";
		  }
		| {
				model: "dall-e-3";
				size: "1024x1024" | "1792x1024" | "1024x1792";
				quality: "standard" | "hd";
		  }
		| {
				model: "midjourney";
		  }
		| {
				model: "flux-schnell" | "flux-pro";
				aspect_ratio: string; // "1:1"
		  };
}

export interface GenerateImageResponse {
	method: "GenerateImage";
	status: "generating" | "completed" | "error";
	message?: string;
	base64: string | null;
	imageUrl: string | null;
	itemId: string;
	isExternalApiError?: boolean;
}

export interface GenerateAudioRequest {
	method: "GenerateAudio";
	text: string;
	model: "tts-1-hd";
	userId: number;
}

export interface GenerateAudioResponse {
	method: "GenerateAudio";
	status: "generating" | "completed" | "error";
	message?: string;
	base64: string | null;
	audioUrl: string | null;
	isExternalApiError?: boolean;
}

export type TTextAction =
	| "adjust_text_length"
	| "adjust_reading_level"
	| "adjust_emojis";
export interface TextAction {
	action: TTextAction;
	level: number;
}
export interface StopGeneration {
	method: "StopGeneration";
	itemId: string;
}

export interface ChatChunk {
	method: "ChatChunk";
	chatId: number;
	type: "chunk" | "done" | "end" | "error";
	itemId: string;
	content?: string;
	error?: string;
	isExternalApiError?: boolean;
}

export type EventsMsg =
	| ModeMsg
	| BoardEventMsg
	| BoardEventListMsg
	| SnapshotRequestMsg
	| SnapshotResponseMsg
	| SubscribeConfirmationMsg
	| ConfirmationMsg
	| BoardSubscriptionCompletedMsg
	| UserJoinMsg
	| PresenceEventMsg
	| AiChatMsg;

export type SocketMsg =
	| EventsMsg
	| AuthMsg
	| AuthConfirmationMsg
	| LogoutMsg
	| GetModeMsg
	| InvalidateRightsMsg
	| UserJoinMsg
	| SubscribeMsg
	| UnsubscribeMsg
	| VersionCheckMsg
	| ErrorMsg
	| ModeMsg
	| PingMsg
	| AiChatMsg
	| BoardAccessDeniedMsg;

export interface Connection {
	connectionId: number;
	userId: number;
	connect(): Promise<void>;
	subscribe(board: Board): void;
	unsubscribe(board: Board): void;
	publishBoardEvent(
		boardId: string,
		event: SyncEvent,
		sequenceNumber: number,
	): void;
	publishPresenceEvent(boardId: string, event: PresenceEventType): void;
	publishAuth(): Promise<void>;
	publishLogout(): void;
	publishGetMode(): void;
	// publishSnapshot(boardId: string, snapshot: BoardSnapshot): void;
	publishSnapshot(boardId: string, snapshot: string, lastIndex: number): void;
	wsClient: WsClient;
	onMessage?: (msg: SocketMsg) => void;
	onAccessDenied: (boardId: string, forceUpdate?: boolean) => void;
	notifyAboutLostConnection: () => void;
	dismissNotificationAboutLostConnection: () => void;
}

type Subscription = {
	board: Board;
	publish: (message: EventsMsg) => void;
	subscribe: () => void;
	unsubscribe: () => void;
};

export function createConnection(
	getCurrentBoard: () => Board,
	getAccount: () => Account,
	getStorage: () => Storage,
): Connection {
	const subscriptions = new Map<string, Subscription>();

	let tokenPromise: PromiseWithResolvers<void> | null = null;
	const isAuthPublishing: { flag: boolean } = { flag: false };

	const onConnectionLost = (): void => {
		postDisconnectedMsg();
	};

	const onErorr = (error: unknown): void => {
		const err = error as Error;
		console.error("Error Establishing Connection:", err);
		onConnectionLost();
		window.parent.postMessage(
			{
				pattern: "MicroboardError",
				payload: JSON.stringify({
					error: err.message,
				}),
			},
			"*",
		);
	};

	const setConnectionErrorTimeout = (): void => {
		setTimeout(onConnectionLost, WS_PING_INTERVAL + 1);
	};

	const subscribeTimeouts = new Map<
		string,
		{ timeout: NodeJS.Timeout; time: number }
	>();

	function clearConnectionError(): void {
		window.removeEventListener(
			"beforeunload",
			warnAboutDataLossBeforeUnload,
		);
		window.addEventListener("beforeunload", publishSnapshotBeforeUnload);
	}

	let onAccessDenied = (boardId: string): void => {
		console.error("Not implemented. Access denied to board:", boardId);
	};

	const invalidateToken = async (alwaysSend = false) => {
		const account = getAccount();
		if (account.isLoggedIn && account.tokenData?.exp) {
			const currentTime = Math.floor(Date.now() / 1000);
			const tokenExpiryTime = account.tokenData.exp;
			const bufferTime = 10;

			if (currentTime >= tokenExpiryTime - bufferTime || alwaysSend) {
				await publishAuth();
			}
		}
	};

	async function onMessage(msg: SocketMsg): Promise<void> {
		// await invalidateToken();
		if (msg.type === "VersionCheck") {
			if (VERSION !== msg.version) {
				console.log("VERSION WARY, RELOADING...");
				console.log("Current version: ", VERSION);
				console.log("Server version: ", msg.version);
				window.location.reload();
			}

			return;
		}
		const account = getAccount();

		const board = getCurrentBoard();
		switch (msg.type) {
			case "AiChat":
			case "SubscribeConfirmation":
			case "Confirmation":
			case "BoardEvent":
			case "BoardEventList":
			case "BoardSnapshot":
			case "CreateSnapshotRequest":
			case "BoardSubscriptionCompleted":
			case "UserJoin":
			case "Mode":
			case "PresenceEvent":
				clearConnectionError();
				const subscribeTimeout = subscribeTimeouts.get(msg.boardId);
				if (subscribeTimeout) {
					clearTimeout(subscribeTimeout.timeout);
					subscribeTimeouts.delete(msg.boardId);
				}
				const subscription = subscriptions.get(msg.boardId);
				if (!subscription) {
					console.warn(
						`Debug: No subscription found for boardId ${msg.boardId}`,
					);
					return;
				}
				subscription.publish(msg);
				break;
			case "Subscribe":
			case "Unsubscribe":
			case "Error":
			case "ping":
				board.presence.ping();
				break;
			case "AuthConfirmation":
				tokenPromise?.resolve();
				tokenPromise = null;
				isAuthPublishing.flag = false;
				publishGetMode();
				break;
			case "InvalidateRights":
				if (account.isLoggedIn) {
					await publishAuth();
				} else {
					publishGetMode();
				}
				break;
			case "BoardAccessDenied":
				onAccessDenied(msg.boardId);
				window.parent.postMessage(
					{
						pattern: "access-denied",
						payload: msg.boardId,
					},
					"*",
				);
				break;
			default:
				console.warn("Debug: Received unknown message type:", msg.type);
		}
	}
	const ws = createWsClient(
		onMessage,
		setConnectionErrorTimeout,
		onErorr,
		getCurrentBoard,
		invalidateToken,
	);

	async function connect(): Promise<void> {
		if (getCurrentBoard()?.getBoardId().includes("local")) {
			return;
		}

		try {
			postConnectingMsg();
			const response = await fetch(`${getApiUrl()}/connection`, {
				method: "GET",
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
			postConnectedMsg();
			const data = await response.json();
			connectionId = data.connection;
		} catch (error) {
			onErorr(error);
		}
	}

	async function subscribe(board: Board): Promise<void> {
		await invalidateToken();
		const boardId = board.getBoardId();
		const subject = subscriptions.get(boardId);
		if (subject) {
			return;
		}

		async function onSocketOpen(): Promise<void> {
			await invalidateToken(true);
			await sendSubscribeMsg();
		}

		async function sendSubscribeMsg(): Promise<void> {
			let subscribeTimeout = subscribeTimeouts.get(boardId);
			if (!subscribeTimeout) {
				subscribeTimeout = {
					timeout: setTimeout(
						() => sendSubscribeMsg,
						SUBSCRIBE_TIMEOUT,
					),
					time: SUBSCRIBE_TIMEOUT,
				};
			} else {
				clearTimeout(subscribeTimeout.timeout);
				subscribeTimeout.time *= 2;
				subscribeTimeout.timeout = setTimeout(
					sendSubscribeMsg,
					subscribeTimeout.time,
				);
			}
			subscribeTimeouts.set(boardId, subscribeTimeout);

			const storage = getStorage();
			const generatedClientId = storage.getUser()
				? storage.getUser()!
				: storage.setUser();

			ws.send({
				type: "Subscribe",
				boardId,
				index: board.events?.getLastIndex() || 0,
				userId: generatedClientId,
				accessKey: board.getAccessKey(),
			});
		}

		function sendUnsubscribeMsg(): void {
			ws.send({ type: "Unsubscribe", boardId: boardId });
		}

		const subscription = {
			board,
			publish: function publish(event: EventsMsg): void {
				board.events?.handleEvent(event);
			},
			subscribe: async function subscribe(): Promise<void> {
				ws.onOpenSubject.subscribe(onSocketOpen);
				await invalidateToken(true);
				await sendSubscribeMsg();
			},
			unsubscribe: function unsubscribe(): void {
				ws.onOpenSubject.unsubscribe(onSocketOpen);
				sendUnsubscribeMsg();
				postDisconnectedMsg();
			},
		};

		subscriptions.set(boardId, subscription);

		subscription.subscribe();
	}

	function unsubscribe(board: Board): void {
		const boardId = board.getBoardId();
		const subscription = subscriptions.get(boardId);
		if (!subscription) {
			return;
		}
		subscription.unsubscribe();
		subscriptions.delete(boardId);

		window.parent.postMessage(
			{
				pattern: "connectionState",
				payload: "disconnected",
			},
			"*",
		);
	}

	async function publishAuth(): Promise<void> {
		try {
			if (isAuthPublishing.flag) {
				return tokenPromise?.promise;
			}
			isAuthPublishing.flag = true;
			const account = getAccount();
			if (!tokenPromise) {
				tokenPromise = createPromiseWithResolvers();
			}
			await account.refreshTokens();
			const jwt = account.accessToken;
			if (!jwt) {
				return;
			}
			ws.send({
				type: "Auth",
				jwt,
			});

			await tokenPromise.promise;
		} catch {
			console.info("Unauthorized");
		} finally {
			isAuthPublishing.flag = false;
			tokenPromise = null;
		}
	}

	function publishLogout(): void {
		ws.send({
			type: "Logout",
		});
	}

	function publishGetMode(): void {
		const board = getCurrentBoard();
		const boardId = board?.getBoardId();
		const account = getAccount();

		if (
			account.isLoggedIn &&
			account.permissions.checkPermissions("owns", "boards", boardId)
		) {
			return;
		}

		if (!boardId || boardId === "blank") {
			return;
		}
		ws.send({
			type: "GetMode",
			boardId,
		});
	}

	function publishBoardEvent(
		boardId: string,
		event: SyncEvent,
		sequenceNumber: number,
	): void {
		if (isAuthPublishing.flag) {
			return;
		}
		const message: BoardEventMsg = {
			type: "BoardEvent",
			boardId,
			event,
			sequenceNumber,
		};

		ws.send(message);
	}

	function publishPresenceEvent(
		boardId: string,
		event: PresenceEventType,
	): void {
		const messageId = generateMessageId();
		const updateCurrentUser = (): string => {
			const currentUser = storage.setUser();
			getCurrentBoard().presence.setCurrentUser(currentUser);
			return currentUser;
		};
		const storage = getStorage();
		const generatedClientId = storage.getUser()
			? storage.getUser()!
			: updateCurrentUser();
		const account = getAccount();
		const generatedNickname = account.isLoggedIn
			? account.info?.name || account.info?.email || "Wild Cat"
			: "Anonymous";
		const generatedColor =
			storage.getUserColor() ||
			getCurrentBoard().presence.generateUserColor(false);
		const message: PresenceEventMsg = {
			type: "PresenceEvent",
			boardId,
			event,
			messageId,
			userId: generatedClientId,
			hardId: storage.getUserId(),
			softId: storage.getUser(),
			nickname: generatedNickname,
			color: generatedColor,
			avatar: account.info?.avatar || null,
		};

		ws.send(message);
	}

	function generateMessageId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	// function publishSnapshot(boardId: string, snapshot: BoardSnapshot): void {
	function publishSnapshot(
		boardId: string,
		snapshot: string,
		lastIndex: number,
	): void {
		if (isAuthPublishing.flag) {
			return;
		}
		ws.send({
			type: "BoardSnapshot",
			boardId,
			snapshot,
			lastEventOrder: lastIndex,
			// lastEventOrder: snapshot.lastIndex,
		});
	}

	let connectionId = 0;
	const userId = 0;

	let notificationId: null | string = null;

	function publishSnapshotBeforeUnload(): void {}

	window.addEventListener("beforeunload", publishSnapshotBeforeUnload);

	function warnAboutDataLossBeforeUnload(event: BeforeUnloadEvent): void {
		event.preventDefault();
		event.returnValue = "Do not leave the page to avoid losing data";
	}

	function notifyAboutLostConnection(): void {
		if (notificationId) {
			return;
		}
		window.removeEventListener("beforeunload", publishSnapshotBeforeUnload);
		window.addEventListener("beforeunload", warnAboutDataLossBeforeUnload);
		notificationId = notify({
			header: i18n.t("notifications.restoringConnectionHeader"),
			body: i18n.t("notifications.restoringConnectionBody"),
			variant: "warning",
			duration: Infinity,
		});
	}

	function dismissNotificationAboutLostConnection(): void {
		if (!notificationId) {
			return;
		}

		window.removeEventListener(
			"beforeunload",
			warnAboutDataLossBeforeUnload,
		);
		toast.dismiss(notificationId);
		notificationId = null;
		window.addEventListener("beforeunload", publishSnapshotBeforeUnload);
	}

	const connection: Connection = {
		get connectionId() {
			return connectionId;
		},
		publishGetMode,
		userId,
		connect,
		subscribe,
		unsubscribe,
		publishBoardEvent,
		publishPresenceEvent,
		publishSnapshot,
		wsClient: ws,
		publishAuth,
		publishLogout,
		onMessage: undefined,
		get onAccessDenied() {
			return onAccessDenied;
		},
		set onAccessDenied(
			handler: (boardId: string, forceUpdate?: boolean) => void,
		) {
			onAccessDenied = handler;
		},
		notifyAboutLostConnection,
		dismissNotificationAboutLostConnection,
	};

	return connection;
}

interface WsClient {
	onOpenSubject: Subject<unknown>;
	onCloseSubject: Subject<unknown>;
	connect: () => void;
	send: (message: SocketMsg) => void;
	isConnected: () => boolean;
	onConnect: () => void;
}

type SocketMsgHandler = (message: SocketMsg) => void;

function postConnectingMsg(): void {
	window.parent.postMessage(
		{
			pattern: "connectionState",
			payload: "connecting",
		},
		"*",
	);
}

function postConnectedMsg(): void {
	window.parent.postMessage(
		{
			pattern: "connectionState",
			payload: "connected",
		},
		"*",
	);
}

function postDisconnectedMsg(): void {
	window.parent.postMessage(
		{
			pattern: "connectionState",
			payload: "disconnected",
		},
		"*",
	);
}

export function createWsClient(
	msgHandler: SocketMsgHandler,
	setConnectionErrorTimeout: () => void,
	onError: (error: unknown) => void,
	getCurrentBoard: () => Board,
	invalidateToken: () => Promise<void>,
): WsClient {
	let socket: WebSocket | null;
	const onOpenSubject = new Subject();
	const onCloseSubject = new Subject();
	const socketUrl = getWebsocketUrl();

	function connect(): void {
		socket = new WebSocket(socketUrl);
		socket.onmessage = onMessage;
		socket.onopen = onOpen;
		socket.onclose = onClose;
		socket.onerror = onError;
	}

	let onConnect = (): void => {
		console.error("onConnect callback not implemented.");
	};

	function onMessage(event: MessageEvent<SocketMsg>): void {
		try {
			const data = JSON.parse(event.data as unknown as string);
			if (!data) {
				throw new Error("Failed to parse WS message");
			}
			if (data.type === "Error") {
				throw new Error(data.message);
			}
			msgHandler(data);
		} catch (error) {
			console.warn(error);
		}
	}

	function send(message: SocketMsg): void {
		invalidateToken();
		if (
			socket &&
			isConnected() &&
			!getCurrentBoard()?.getBoardId().includes("local")
		) {
			socket.send(JSON.stringify(message));
		}
	}

	function isConnected(): boolean {
		return socket ? socket.readyState === WebSocket.OPEN : false;
	}

	function onOpen(): void {
		onOpenSubject.publish({});
	}

	function onClose(): void {
		onCloseSubject.publish({});
		setTimeout(() => {
			connect();
		}, WS_RECONNECT_TIMEOUT);
	}

	// Double stringify
	const pingMsg: SocketMsg = JSON.stringify({ type: "ping" });

	function keepAlivePing(): void {
		const board = getCurrentBoard();
		if (isConnected() && !board?.getBoardId().includes("local")) {
			send(pingMsg);
			if (board) {
				board.presence.ping();
			}

			setConnectionErrorTimeout();
		}
	}

	setInterval(keepAlivePing, WS_PING_INTERVAL);

	connect();

	return {
		onOpenSubject,
		onCloseSubject,
		connect,
		send,
		isConnected,
		get onConnect() {
			return onConnect;
		},
		set onConnect(handler: () => void) {
			onConnect = handler;
		},
	};
}
