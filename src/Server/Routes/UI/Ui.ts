import express from "express";
import { Boards } from "Server/Boards";
import winston from "winston";

export function getUIRoutes(
	_boards: Boards,
	_logger: winston.Logger,
): express.Router {
	const router = express.Router();
	return router;
}
