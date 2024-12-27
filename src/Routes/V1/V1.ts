import { Stripe } from "stripe";
import express from "express";
import fs from "fs";
import path from "path";
import { Auth, getAuthRouter } from "Routes/V1/Auth";
// import { Boards } from "Routes/V1/Boards";
import { getUsersRouter, Users } from "Routes/V1/Users";
import { Config } from "shared/config/config";
import { internalError } from "shared/lib/routing";
import { Mailer } from "shared/modules/mailer/mailer";
import winston from "winston";
import { WebSocketServer } from "ws";
import { createJobsRouter } from "./Jobs";
import { createMediaRouter } from "./Media";
import { MediaDAL } from "./Media/MediaDAL";
import { getMiroRouter } from "./Miro";
import { getTemplatesRouter, Templates } from "./Templates";
import { createHealthRouter } from "./Health";
import { Redis } from "Redis";
import { getAIRouter } from "./AI/Router";
import { AI } from "./AI/AI";
import { getBillingRouter } from "./Billing";
import { getIngestRouter } from "./Ingest";
import { OpenAI } from "../../ai/openai";

function createFileRoute(
    router: express.Router,
    routePath: string,
    filePath: string,
    logger: winston.Logger,
    sendType: string,
    encoding?: BufferEncoding,
    dataUpdateCb?: (data: string) => string
) {
    router.get(routePath, (req, res) => {
        const resolvedPath = path.resolve(__dirname, filePath);
        const readFileCallback = (err: NodeJS.ErrnoException | null, data: Buffer | string) => {
            if (err) {
                logger.error(`Error reading ${filePath}`, err);
                return internalError(res, err, "Internal Server Error");
            }
            if (dataUpdateCb) {
                data = dataUpdateCb(data as string);
            }
            res.type(sendType).send(data);
        };

        if (encoding) {
            fs.readFile(resolvedPath, encoding, readFileCallback);
        } else {
            fs.readFile(resolvedPath, readFileCallback);
        }
    });
}

export function getV1Router({
    config,
    mailer,
    // boards,
    templates,
    logger,
    auth,
    users,
    media,
    wss,
    redis,
    ai,
    openai,
    stripe,
}: {
    config: Config;
    mailer: Mailer;
    // boards: Boards;
    templates: Templates;
    logger: winston.Logger;
    auth: Auth;
    users: Users;
    media: MediaDAL;
    wss: WebSocketServer;
    redis: Redis;
    ai: AI;
    openai: OpenAI;
    stripe: Stripe;
}): express.Router {
    const router = express.Router();
    const apiBase = "/api/v1";
    router.use(apiBase, createHealthRouter(logger, redis));
    router.use(apiBase, getAuthRouter(auth, users, logger));
    // router.use(apiBase, getBoardsRouter(boards, logger));
    router.use(apiBase, getTemplatesRouter(templates, logger), getAIRouter(ai, logger));
    router.use(apiBase, getAIRouter(ai, logger));
    router.use(apiBase, createMediaRouter(media as MediaDAL, logger));
    router.use(apiBase, createJobsRouter(logger, wss));
    // BUG: Миддлвар блокирует запрос GET boards/:id без токена по edit/view ссылке
    // router.use(authMiddleware);
    router.use(apiBase, getUsersRouter(users, logger));
    router.use(`${apiBase}/miro`, getMiroRouter());
    router.use(`${apiBase}`, getBillingRouter(logger, stripe));
    router.use(`${apiBase}`, getIngestRouter(logger, openai));

    createFileRoute(
        router,
        `${apiBase}/embed.js`,
        "./Embedding/embedMicroboard.js",
        logger,
        "application/javascript",
        "utf8",
        (data) => {
            return data.replaceAll(/<embedUrl\/>/g, process.env.EMBED_URL || "");
        }
    );

    createFileRoute(router, `${apiBase}/dropflow.wasm`, "./dropflow.wasm", logger, "application/wasm");
    createFileRoute(
        router,
        `${apiBase}/fonts/OpenSans-Regular.ttf`,
        "./fonts/OpenSans-Regular.ttf",
        logger,
        "font/ttf"
    );
    createFileRoute(router, `${apiBase}/fonts/OpenSans-Bold.ttf`, "./fonts/OpenSans-Bold.ttf", logger, "font/ttf");
    createFileRoute(router, `${apiBase}/fonts/OpenSans-Italic.ttf`, "./fonts/OpenSans-Italic.ttf", logger, "font/ttf");
    createFileRoute(
        router,
        `${apiBase}/fonts/OpenSans-BoldItalic.ttf`,
        "./fonts/OpenSans-BoldItalic.ttf",
        logger,
        "font/ttf"
    );

    createFileRoute(router, `${apiBase}/fonts/LabGrotesqueK.ttf`, "./fonts/LabGrotesqueK.ttf", logger, "font/ttf");
    createFileRoute(
        router,
        `${apiBase}/fonts/LabGrotesqueK_Bold.ttf`,
        "./fonts/LabGrotesqueK_Bold.ttf",
        logger,
        "font/ttf"
    );
    createFileRoute(
        router,
        `${apiBase}/fonts/LabGrotesqueK_Italic.ttf`,
        "./fonts/LabGrotesqueK_Italic.ttf",
        logger,
        "font/ttf"
    );
    createFileRoute(
        router,
        `${apiBase}/fonts/LabGrotesqueK_Bold_Italic.ttf`,
        "./fonts/LabGrotesqueK_Bold_Italic.ttf",
        logger,
        "font/ttf"
    );

    createFileRoute(router, `${apiBase}/fonts/LabGrotesqueK.ttf`, "./fonts/LabGrotesqueK.ttf", logger, "font/ttf");
    createFileRoute(
        router,
        `${apiBase}/fonts/LabGrotesqueK_Bold.ttf`,
        "./fonts/LabGrotesqueK_Bold.ttf",
        logger,
        "font/ttf"
    );
    createFileRoute(
        router,
        `${apiBase}/fonts/LabGrotesqueK_Italic.ttf`,
        "./fonts/LabGrotesqueK_Italic.ttf",
        logger,
        "font/ttf"
    );
    createFileRoute(
        router,
        `${apiBase}/fonts/LabGrotesqueK_Bold_Italic.ttf`,
        "./fonts/LabGrotesqueK_Bold_Italic.ttf",
        logger,
        "font/ttf"
    );

    router.get("/api/v1/healthcheck", (req, res) => {
        res.status(200).json({ status: "OK", message: "Server is up and running" });
    });

    return router;
}
