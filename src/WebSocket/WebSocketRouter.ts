import { z } from "zod";
import WebSocket from "ws";

// Base schema for all socket messages
const baseSocketMsgSchema = z.object({
    type: z.string(),
});

// Define specific message schemas
const authMsgSchema = baseSocketMsgSchema.extend({
    type: z.literal("Auth"),
    jwt: z.string(),
});

authMsgSchema.shape.

const logoutMsgSchema = baseSocketMsgSchema.extend({
    type: z.literal("Logout"),
});

const subscribeMsgSchema = baseSocketMsgSchema.extend({
    type: z.literal("Subscribe"),
    boardId: z.string(),
});

// ... define other message schemas ...

// Union schema of all possible message types
const socketMsgSchema = z.discriminatedUnion("type", [
    authMsgSchema,
    logoutMsgSchema,
    subscribeMsgSchema,
    // ... other message schemas ...
]);

// Infer types from schemas
type SocketMsg = z.infer<typeof socketMsgSchema>;
type AuthMsg = z.infer<typeof authMsgSchema>;
type LogoutMsg = z.infer<typeof logoutMsgSchema>;
type SubscribeMsg = z.infer<typeof subscribeMsgSchema>;
// ... infer other message types ...

type MessageHandler<T extends SocketMsg> = (msg: T, ws: WebSocket) => Promise<void>;
type ErrorHandler<T extends SocketMsg> = (error: any, msg: T, ws: WebSocket) => Promise<void>;

export class WebSocketRouter {
    private handlers: Map<string, { schema: z.ZodType<any>; handlers: MessageHandler<any>[] }> = new Map();
    private errorHandlers: Map<string, ErrorHandler<any>> = new Map();

	route<T extends SocketMsg>(type: T['type'], schema: z.ZodType<T>): RouteBuilder<T> {
		if (!this.handlers.has(type)) {
			this.handlers.set(type, { schema, handlers: [] });
		}
		return new RouteBuilder<T>(this, type);
	} 

    async handleMessage(ws: WebSocket, rawMsg: unknown): Promise<void> {
        const parsedMsg = socketMsgSchema.safeParse(rawMsg);
        if (!parsedMsg.success) {
            console.error("Invalid message format:", parsedMsg.error);
            return;
        }

        const msg = parsedMsg.data;
        const route = this.handlers.get(msg.type);
        const errorHandler = this.errorHandlers.get(msg.type);

        if (route) {
            try {
                const validatedMsg = route.schema.parse(msg);
                for (const handler of route.handlers) {
                    await handler(validatedMsg, ws);
                }
            } catch (error) {
                if (errorHandler) {
                    await errorHandler(error, msg, ws);
                } else {
                    console.error(`Unhandled error for message type ${msg.type}:`, error);
                }
            }
        } else {
            console.warn(`No handler registered for message type: ${msg.type}`);
        }
    }
}

class RouteBuilder<T extends SocketMsg> {
    constructor(private router: WebSocketRouter, private messageType: string) {}

    use(handler: MessageHandler<T>): this {
        this.router["handlers"].get(this.messageType)!.handlers.push(handler);
        return this;
    }

    handle(handler: MessageHandler<T>): this {
        return this.use(handler);
    }

    catch(errorHandler: ErrorHandler<T>): this {
        this.router["errorHandlers"].set(this.messageType, errorHandler);
        return this;
    }
}

// Usage
const wsRouter = new WebSocketRouter();

wsRouter
  .route("Auth", authMsgSchema)
  // .handle((msg, ws) => handleAuthMsg(msg, ws))
  // .catch((error, msg, ws) => handleError(ws, error, "Failed to authenticate"));

wsRouter
  .route("Logout", logoutMsgSchema)
  // .handle(handleLogoutMsg);

wsRouter
  .route("Subscribe", subscribeMsgSchema)
  //.handle(handleSubscribeMsg)
  // .catch((error, msg, ws) => {
    // unsubscribeClient(msg.boardId, ws);
    // return handleError(ws, error, "Failed to subscribe to board events");
  // });

// ... other routes ...

// Main message handler
async function handleMessage(ws: WebSocket, rawMsg: unknown) {
  await wsRouter.handleMessage(ws, rawMsg);
}
