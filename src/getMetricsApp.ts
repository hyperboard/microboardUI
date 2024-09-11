import express from "express";
import { register } from "Metrics/metrics";

export function getMetricsApp(): express.Express {
    const metricsApp = express();

    metricsApp.get("/metrics", async (req, res) => {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    });

    return metricsApp;
}
