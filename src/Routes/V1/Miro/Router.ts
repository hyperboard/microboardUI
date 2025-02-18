import express from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";

export function getMiroRouter() {
    const router = express.Router();

    router.use(
        "/token",
        createProxyMiddleware({
            target: "https://api.miro.com/v1/oauth/token",
            changeOrigin: true,
            proxyTimeout: 30000,
        } as Options)
    );

    router.use(
        "/boards",
        createProxyMiddleware({
            target: "https://api.miro.com/v2/boards",
            changeOrigin: true,
            proxyTimeout: 30000,
        } as Options)
    );

    router.use(
        "/boards/{id}/**",
        createProxyMiddleware({
            target: "https://api.miro.com/v2/boards/{id}/**",
            changeOrigin: true,
            proxyTimeout: 30000,
        } as Options)
    );

    return router;
}
