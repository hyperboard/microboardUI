import type {
  AiChatMsg,
  BoardEventMsg,
  ConfirmationMsg,
  SnapshotRequestMsg,
  ModeMsg,
  SyncBoardEvent,
} from "microboard-temp";
import {
  Board,
  messageRouter,
  PresenceEventMsg,
  PresenceEventType,
  UserJoinMsg,
} from "microboard-temp";
import { getApiUrl } from "Config"; // [CHANGE] Импорт для получения REST API URL
import type { Account } from "entities/account";
import toast from "react-hot-toast";
import { notify } from "shared/ui-lib/Toast";
// [CHANGE] getWebsocketUrl удален, так как URL теперь динамический
import { Storage } from "./Storage";
import { VERSION } from "version";

const SECOND = 1000;
// [CHANGE] Таймауты теперь управляются логикой реконнекта
const WS_PING_INTERVAL = 10 * SECOND;

// [CHANGE] Добавлен интерфейс сообщения о завершении подписки (приходит сразу после коннекта)
export interface BoardSubscriptionCompletedMsg {
  type: "BoardSubscriptionCompleted";
  boardId: string;
  mode: "view" | "edit";
  snapshot: any;
  eventsSinceLastSnapshot: SyncBoardEvent[];
  initialSequenceNumber: number;
}

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

export interface SubscribeMsg {
  type: "Subscribe";
  boardId: string;
  userId: string;
  index: number;
  accessKey?: string;
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

export interface AuthConfirmationMsg {
  type: "AuthConfirmation";
}

export interface PingMsg {
  type: "ping" | "pong";
}

export interface BoardAccessDeniedMsg {
  type: "BoardAccessDenied";
  boardId: string;
}

export type EventsMsg =
  | ModeMsg
  | BoardEventMsg
  | SnapshotRequestMsg
  | ConfirmationMsg
  | BoardSubscriptionCompletedMsg // [CHANGE] Добавлено в union тип
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
  connectionId: string;
  getCurrentUser: () => string;
  connect(): Promise<void>;
  subscribe(board: Board): void;
  unsubscribe(board: Board): void;

  publishPresenceEvent(boardId: string, event: PresenceEventType): void;
  publishAuth(): Promise<void>;
  publishLogout(): void;

  onMessage?: (msg: SocketMsg) => void;
  onAccessDenied: (boardId: string, forceUpdate?: boolean) => void;
  notifyAboutLostConnection: () => void;
  dismissNotificationAboutLostConnection: () => void;
  resetConnection: () => void;
  send: (msg: SocketMsg) => void;
}

export function createConnection(
  getCurrentBoard: () => Board,
  getAccount: () => Account,
  getStorage: () => Storage,
): Connection {
  // [CHANGE] Вместо Map подписок храним один активный WS клиент и ID текущей доски
  let wsClient: WsClient | null = null;
  let activeBoardId: string | null = null;

  const onConnectionLost = (): void => {
    postDisconnectedMsg();
    notifyAboutLostConnection(); // [CHANGE] Сразу уведомляем UI
  };

  const onError = (error: unknown): void => {
    const err = error as Error;
    console.error("Connection Error:", err);
    // [CHANGE] Логика ошибки теперь не закрывает все подряд, клиент сам попробует реконнект
  };

  // [CHANGE] Очистка неактуальных листенеров
  function clearConnectionError(): void {
    window.removeEventListener("beforeunload", warnAboutDataLossBeforeUnload);
  }

  let onAccessDenied = (boardId: string): void => {
    console.error("Access denied to board:", boardId);
    notify({ body: "Access denied", variant: "error" });
  };

  // [CHANGE] InvalidateToken теперь не нужен для отправки Auth сообщений,
  // так как аутентификация происходит при handshake. Оставляем заглушку или логику реконнекта.
  const invalidateToken = async (alwaysSend = false) => {
    // Logic if needed
  };

  // [CHANGE] Полностью обновленный обработчик сообщений
  async function onMessage(msg: SocketMsg): Promise<void> {
    if (msg.type === "VersionCheck") {
      if (VERSION !== msg.version) {
        console.log("VERSION WARY, RELOADING...");
        window.location.reload();
      }
      return;
    }

    const board = getCurrentBoard();

    switch (msg.type) {
      case "BoardSubscriptionCompleted":
        console.log(
          `[Connection] Subscribed to ${msg.boardId} in ${msg.mode} mode`,
        );
        dismissNotificationAboutLostConnection();
        postConnectedMsg();
        messageRouter.handleMessage(msg, board);
        break;

      case "AiChat":
      case "Confirmation":
      case "BoardEvent":
      case "CreateSnapshotRequest":
      case "UserJoin":
      case "Mode":
      case "PresenceEvent":
        clearConnectionError();
        dismissNotificationAboutLostConnection();
        messageRouter.handleMessage(msg, board);
        break;

      case "Error":
        console.error("[Server Error]", msg.message);
        break;

      case "ping":
      case "pong":
        board?.presence?.ping();
        break;

      case "InvalidateRights":
        if (board) subscribe(board);
        break;

      case "BoardAccessDenied":
        onAccessDenied(msg.boardId);
        window.parent.postMessage(
          { pattern: "access-denied", payload: msg.boardId },
          "*",
        );
        break;

      default:
      // console.warn("Debug: Received unknown message type:", msg.type);
    }
  }

  // [CHANGE] connect() больше не открывает глобальный сокет.
  // Оставлен для совместимости интерфейса.
  async function connect(): Promise<void> {
    postConnectingMsg();
  }

  async function subscribe(board: Board): Promise<void> {
    const boardId = board.getBoardId();
    if (boardId === "welcome" || boardId.includes("local")) {
      return;
    }

    activeBoardId = boardId;

    if (wsClient) {
      wsClient.close();
      wsClient = null;
    }

    try {
      postConnectingMsg();

      const account = getAccount();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (account.isLoggedIn && account.accessToken) {
        headers["Authorization"] = `Bearer ${account.accessToken}`;
      }

      const response = await fetch(
        `${getApiUrl()}/websocket/${boardId}/connect`,
        {
          method: "POST",
          headers,
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          try {
            console.log(
              "[Connection] Token expired (401), attempting refresh...",
            );
            await account.refreshTokens();

            return await subscribe(board);
          } catch (refreshErr) {
            console.error(
              "[Connection] Failed to refresh token during subscribe",
              refreshErr,
            );
          }
        }

        postDisconnectedMsg();
        dismissNotificationAboutLostConnection();

        if (response.status === 404 || response.status === 403) {
          onAccessDenied(boardId);
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        const errorText =
          errorData.error || `Server error (${response.status})`;

        notify({
          header: "Connection Error",
          body: errorText,
          variant: "error",
        });
        onAccessDenied(boardId);

        return;
      }

      const { wsUrl, jwt } = await response.json();

      wsClient = createWsClient(
        wsUrl,
        jwt,
        onMessage,
        (err) => {
          onError(err);
        },
        () => subscribe(board),
      );
    } catch (error: any) {
      postDisconnectedMsg();
      onError(error);

      if (![403, 404].includes(error.status)) {
        notify({
          body: "Failed to reach server. Please check your connection.",
          variant: "error",
        });
      }
    }
  }

  // [CHANGE] Упрощенный unsubscribe - просто закрываем сокет
  function unsubscribe(board: Board): void {
    if (activeBoardId === board.getBoardId()) {
      wsClient?.close();
      wsClient = null;
      activeBoardId = null;
      postDisconnectedMsg();
    }
  }

  // [CHANGE] Auth теперь происходит при handshake, метод оставлен заглушкой
  async function publishAuth(): Promise<void> {
    return Promise.resolve();
  }

  function publishLogout(): void {
    if (wsClient) wsClient.close();
  }

  const getCurrentUser = (): string => {
    const storage = getStorage();
    const storageUser = storage.getUser();
    if (storageUser) {
      const board = getCurrentBoard();
      if (board && board.presence) {
        board.presence.setCurrentUser(storageUser);
      }
      return storageUser;
    }
    const currentUser = storage.setUser();

    const board = getCurrentBoard();
    if (board && board.presence) {
      board.presence.setCurrentUser(currentUser);
    }
    return currentUser;
  };

  function publishPresenceEvent(
    boardId: string,
    event: PresenceEventType,
  ): void {
    // [CHANGE] Шлем только если активна эта доска
    if (activeBoardId !== boardId) return;

    const messageId = generateMessageId();
    const storage = getStorage();
    const generatedClientId = getCurrentUser();
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

    send(message);
  }

  function generateMessageId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  let notificationId: null | string = null;

  function warnAboutDataLossBeforeUnload(event: BeforeUnloadEvent): void {
    event.preventDefault();
    event.returnValue = "Do not leave the page to avoid losing data";
  }

  function notifyAboutLostConnection(): void {
    if (notificationId) return;
    window.addEventListener("beforeunload", warnAboutDataLossBeforeUnload);
    notificationId = notify({
      header: window.MICROBOARD_CONFIG.i18n.t(
        "notifications.restoringConnectionHeader",
      ),
      body: window.MICROBOARD_CONFIG.i18n.t(
        "notifications.restoringConnectionBody",
      ),
      variant: "warning",
      duration: Infinity,
    });
  }

  function dismissNotificationAboutLostConnection(): void {
    if (!notificationId) return;
    window.removeEventListener("beforeunload", warnAboutDataLossBeforeUnload);
    toast.dismiss(notificationId);
    notificationId = null;
  }

  function resetConnection() {
    const board = getCurrentBoard();
    if (board) subscribe(board);
  }

  function send(msg: SocketMsg): void {
    if (wsClient && wsClient.isConnected()) {
      wsClient.send(msg);
    }
  }

  const connection: Connection = {
    get connectionId() {
      return getCurrentUser();
    },
    getCurrentUser,
    connect,
    subscribe,
    unsubscribe,
    publishPresenceEvent,
    publishAuth,
    publishLogout,
    resetConnection,
    onMessage: undefined,
    get onAccessDenied() {
      return onAccessDenied;
    },
    set onAccessDenied(handler) {
      onAccessDenied = handler;
    },
    notifyAboutLostConnection,
    dismissNotificationAboutLostConnection,
    send,
  };

  return connection;
}

// [CHANGE] Интерфейс WS клиента упрощен
interface WsClient {
  send: (message: SocketMsg) => void;
  isConnected: () => boolean;
  close: () => void;
}

type SocketMsgHandler = (message: SocketMsg) => void;

function postConnectingMsg(): void {
  window.parent.postMessage(
    { pattern: "connectionState", payload: "connecting" },
    "*",
  );
}

function postConnectedMsg(): void {
  window.parent.postMessage(
    { pattern: "connectionState", payload: "connected" },
    "*",
  );
}

function postDisconnectedMsg(): void {
  window.parent.postMessage(
    { pattern: "connectionState", payload: "disconnected" },
    "*",
  );
}

export function createWsClient(
  wsUrl: string,
  token: string,
  msgHandler: SocketMsgHandler,
  onError: (error: unknown) => void,
  onReconnect: () => void,
): WsClient {
  let socket: WebSocket | null = null;
  let pingInterval: any = null;
  let isClosedIntentionally = false;

  let lastAlive = Date.now();
  const PING_INTERVAL = 5000;
  const MAX_SILENCE = 15000;
  const RECONNECT_DELAY = 1000;

  function connect(): void {
    try {
      const fullUrl = `${wsUrl}?token=${token}`;
      socket = new WebSocket(fullUrl);
      lastAlive = Date.now();
    } catch (e) {
      onError(e);
      return;
    }

    socket.onmessage = (event) => {
      lastAlive = Date.now();
      try {
        const data = JSON.parse(event.data);
        if (data.type === "pong") return;
        msgHandler(data);
      } catch (e) {
        console.warn("[WS] Parse error", e);
      }
    };

    socket.onopen = () => {
      console.log("[WS] Connected");
      lastAlive = Date.now();
      startPing();
    };

    socket.onclose = (e) => {
      console.warn("[WS] Closed", e.code, e.reason);
      stopPing();
      if (!isClosedIntentionally) {
        setTimeout(() => onReconnect(), RECONNECT_DELAY);
      }
    };

    socket.onerror = (e) => {
      console.error("[WS] Error", e);
    };
  }

  function startPing() {
    stopPing();
    pingInterval = setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;

      if (Date.now() - lastAlive > MAX_SILENCE) {
        console.warn("[WS] Server timeout, forcing close...");
        socket.close();
        return;
      }

      socket.send(JSON.stringify({ type: "ping" }));
    }, PING_INTERVAL);
  }

  function stopPing() {
    if (pingInterval) clearInterval(pingInterval);
  }

  function close() {
    isClosedIntentionally = true;
    stopPing();
    if (socket) {
      socket.close();
      socket = null;
    }
  }

  connect();

  return {
    send: (msg: SocketMsg) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg));
      }
    },
    isConnected: () => socket !== null && socket.readyState === WebSocket.OPEN,
    close,
  };
}
