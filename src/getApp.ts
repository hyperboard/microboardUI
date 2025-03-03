import { createMiddleware } from "@trigger.dev/express";
import { OpenAI } from "ai/openai";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { db, pool } from "drizzle/db";
import { migrateData } from "drizzle/scripts/board-events-table.migration";
import { createVectorExtension } from "drizzle/scripts/create-vector-ext";
import { runMigration } from "drizzle/scripts/migrate";
import { updatePlans } from "drizzle/scripts/plans";
import express from "express";
import helmet from "helmet";
import http from "http";
import { exceptionMiddleware } from "Middlewares/exception.middleware";
import morgan from "morgan";
import path from "path";
import { getRedis } from "Redis";
import { AI } from "Routes/V1/AI/AI";
import { AccessKeysService } from "Routes/V1/Boards/access-keys.service";
import { BoardsService } from "Routes/V1/Boards/boards.service";
import { FoldersService } from "Routes/V1/Foldres/folders.service";
import { createMinioMediaDAL } from "Routes/V1/Media";
import { catchAsync } from "shared/lib/catchAsync";
import { getLoggerLevel } from "shared/lib/logger";
import Stripe from "stripe";
import { client } from "trigger";
import { createImageGenerator } from "ai/openai/image-generator";
import winston from "winston";
import { WebSocketServer } from "ws";
import { nocache } from "./nocache";
import { getV1Router } from "./Routes";
import { Auth } from "./Routes/V1/Auth";
import { createStripeService, StripeService } from "./Routes/V1/Billing/stripe";
import { Templates } from "./Routes/V1/Templates";
import { Users } from "./Routes/V1/Users";
import { Config } from "./shared/config/config";
import { Mailer } from "./shared/modules/mailer/mailer";
import { WebSocketType, withWebSocketApi } from "./WebSocket";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import { TelegramService } from "services/TelegramService";
import { language } from "Middlewares/language.middleware";
import { DevelopersService } from "Routes/V1/Developers/Service";
import { GoogleOAuth } from "Routes/V1/Auth/GoogleOAuth";
import { createCryptoService } from "Routes/V1/Crypto";
import { CryptoService } from "Routes/V1/Crypto/cryptoService";

export async function getApp(): Promise<{
    server: http.Server;
    webSocket: WebSocketType;
    stripeService: StripeService;
    cryptoService: CryptoService;
}> {
    const app = express();

    await createVectorExtension(pool).catch(console.error);

    // await runMigration();
    // if (process.env.NODE_ENV?.toLocaleLowerCase() === "production") {
    //     await runMigration();
    // }

    if (process.env.MIGRATE_EVENTS === "true") {
        await migrateData().catch(console.error);
    }

    await updatePlans().catch(console.error);

    app.use(morgan("combined"));
    if (process.env.NODE_ENV !== "production") {
        app.use(cors());
    }

    const server = http.createServer(app);
    const wss = new WebSocketServer({
        server,
    });

    const stripe = new Stripe(process.env.STRIPE_KEY!, {
        apiVersion: "2024-12-18.acacia",
    });

    // Create a winston logger.
    const logger = winston.createLogger({
        level: getLoggerLevel(process.env.LOG_LEVEL),
        format: winston.format.combine(
            winston.format.errors({ stack: true }), // Ensure error objects are serialized
            winston.format.metadata(), // Include metadata in logs
            winston.format.json({ space: 2 }) // Output logs in JSON format
        ),
        defaultMeta: {
            service: "user-service",
        },
        transports: [
            // Write all logs error (and below) to `error.log`.
            new winston.transports.File({
                filename: "error.log",
                level: "error",
            }),
            // Write to all logs with level `info` and below to `combined.log`
            new winston.transports.File({ filename: "combined.log" }),
            // Write all logs with level `info` and below to console.
            new winston.transports.Console({
                format: winston.format.combine(winston.format.simple(), winston.format.errors({ stack: true })),
            }),
        ],
    });

    const redis = await getRedis(logger);
    const stripeService = await createStripeService(stripe, redis);
    const cryptoService = createCryptoService(redis, logger);
    app.post(
        "/api/v1/billing/webhook",
        express.raw({ type: "application/json" }),
        catchAsync(async (req, res) => {
            try {
                const signature = req.headers["stripe-signature"];

                if (!signature) {
                    return res.status(400).json({ error: "Missing stripe-signature header" });
                }

                const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

                await stripeService.handleWebhook(event);
                res.json({ received: true });
            } catch (err: any) {
                logger.error("Stripe webhook Error:", err);
                res.status(400).send(`Webhook Error: ${err?.message || "Unknown"}`);
            }
        })
    );

    app.use(language("x-client-language"));
    app.use(bodyParser.json({ limit: "10mb" }));
    app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
    app.use(cookieParser());
    app.use(compression());
    app.use(createMiddleware(client, "/api/trigger"));

    logger.info.bind(logger);

    // Atlassian security policy requirements
    // http://go.atlassian.com/security-requirements-for-cloud-apps
    // HSTS must be enabled with a minimum age of at least one year
    app.use(
        helmet.hsts({
            maxAge: 31536000,
            includeSubDomains: false,
        })
    );
    app.use(
        helmet.referrerPolicy({
            policy: ["origin"],
        })
    );

    const staticPath = path.join(process.cwd(), "public");

    app.use(express.static(staticPath));
    app.use(nocache);

    const config = new Config();
    const openai = new OpenAI(process.env.OPENAI_API_KEY!, {
        deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    });
    const mailer = new Mailer(config, logger, process.env.BASE_URL ?? "example");
    const templates = new Templates(logger);
    const accessKeysService = new AccessKeysService(db);
    const boardsService = new BoardsService(db, logger);
    const foldersService = new FoldersService(db, boardsService);
    const imageGenerator = await createImageGenerator({
        openaiToken: process.env.OPENAI_API_KEY!,
        replicateToken: process.env.REPLICATE_TOKEN!,
        logger: logger,
        useapiToken: process.env.USEAPI_TOKEN,
        discordToken: process.env.DISCORD_TOKEN,
        discordServerId: process.env.DISCORD_SERVER_ID,
        discordChannelId: process.env.DISCORD_CHANNEL_ID,
    });

    const developersService = new DevelopersService(boardsService, logger, redis);

    const telegramService = new TelegramService({
        token: process.env.TELEGRAM_BOT_TOKEN!,
        appToken: process.env.TELEGRAM_APP_TOKEN!,
        isEnabled: process.env.TELEGRAM_ENABLED === "true",
        logger,
        source: (process.env.NODE_ENV || "development") as "development" | "staging" | "production",
        notifierUrl: process.env.TELEGRAM_NOTIFIER_URL || "http://localhost:8080",
    });
    await telegramService.start();

    const webSocket = withWebSocketApi({
        wss,
        accessKeysService,
        logger,
        redis,
        boardsService,
        openai,
        imageGenerator,
        telegramService,
        developersService,
        stripeService,
        cryptoService,
    });
    const media = createMinioMediaDAL(logger);
    const users = new Users(media, logger);
    const auth = new Auth(logger, users, config, mailer);
    const googleOAuthService = new GoogleOAuth();
    const ai = new AI(openai);

    app.get("/", (request, response) => {
        response.status(200).json({});
    });

    app.get("/api/v1/connection", (request, response) => {
        const timestamp = new Date().getTime();
        response.status(200).json({ connection: timestamp });
    });

    const v1Router = getV1Router({
        config,
        mailer,
        templates,
        logger,
        auth,
        users,
        media,
        wss,
        redis,
        ai,
        openai,
        stripeService,
        cryptoService,
        developersService,
        accessKeysService,
        boardsService,
        foldersService,
        googleOAuthService,
        telegramService,
    });

    app.use(v1Router);

    app.use(exceptionMiddleware(logger));

    app.use((req, res, next) => {
        if (req.path.includes("favicon.svg")) {
            res.sendFile("favicon.svg", { root: staticPath });
        } else if (req.path.includes("bundle.js.map")) {
            res.sendFile("bundle.js.map", { root: staticPath });
        } else if (req.accepts("html") && !req.get("Content-Type")) {
            // BUG: blocks delete requests of downstream routers
            res.sendFile("index.html", { root: staticPath });
        } else {
            next();
        }
    });

    app.all(
        "*",
        catchAsync(async (req) => {
            throw new HttpException(HttpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`);
        })
    );

    const onError = (err: unknown) => {
        logger.error("Fatal unhandled error");
        logger.error(err);
    };

    process.on("unhandledRejection", onError);
    process.on("uncaughtException", onError);

    return { server, webSocket, cryptoService, stripeService };
}
