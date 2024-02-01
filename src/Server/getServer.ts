import express from "express";
import http from "http";

export function getServer(app: express.Express): http.Server {
	return http.createServer(app);
}
