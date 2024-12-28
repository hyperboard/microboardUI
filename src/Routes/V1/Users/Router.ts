import express from "express";
import { body, param, query } from "express-validator";
import { jwtMiddleware } from "Middlewares/jwt.middleware";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";
import winston from "winston";
import { Users } from "./Users";

export function getUsersRouter(usersService: Users, logger: winston.Logger): express.Router {
    const router = express.Router();

    router.patch(
        "/users/me/avatar",
        jwtMiddleware(logger),
        catchAsync(async (request, response) => {
            const { token } = request;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);
            const contentType = request.headers["content-type"];

            await usersService.uploadAvatar(userId, request, contentType);
            response.status(HttpStatus.NO_CONTENT).send();
        })
    );

    router.delete(
        "/users/me/avatar",
        jwtMiddleware(logger),
        catchAsync(async (request, response) => {
            const { token } = request;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            await usersService.uploadAvatar(userId);
            response.status(HttpStatus.NO_CONTENT).send();
        })
    );

    router.get(
        "/users/me",
        jwtMiddleware(logger),
        catchAsync(async (request, response) => {
            const { token } = request;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);
            if (!token || userToken === null) {
                response
                    .status(HttpStatus.UNAUTHORIZED)
                    .json({
                        status: HttpStatus.UNAUTHORIZED,
                        message: "Unauthorized",
                    })
                    .end();
                return;
            }
            let user = null;
            try {
                user = await usersService.getUser(userId);
                response.json(user).end();
            } catch (e: HttpException | any) {
                response
                    .status(e.status || HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({
                        status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                        message: e.message,
                    })
                    .end();
            }

            response.end();
        })
    );

    router.patch(
        "/users/me",
        jwtMiddleware(logger),
        body("name").isString().isLength({ min: 1 }).optional(),
        catchAsync(async (request, response) => {
            const { token } = request;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);
            if (!token || userToken === null) {
                response
                    .status(HttpStatus.UNAUTHORIZED)
                    .json({
                        status: HttpStatus.UNAUTHORIZED,
                        message: "Unauthorized",
                    })
                    .end();
                return;
            }
            try {
                await usersService.editUser(userId, request.body.name);
                response.status(HttpStatus.NO_CONTENT).send();
            } catch (e: HttpException | any) {
                response
                    .status(e.status || HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({
                        status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                        message: e.message,
                    })
                    .end();
            }

            response.end();
        })
    );

    router.get(
        "/users/:userId",
        param("userId").isInt(),
        catchAsync(async (request, response) => {
            const userId = parseInt(request.body?.userId);
            let user = null;
            try {
                user = await usersService.getUser(userId);
                response.json(user).end();
            } catch (e: HttpException | any) {
                response
                    .status(e.status || HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({
                        status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                        message: e.message,
                    })
                    .end();
            }

            response.end();
        })
    );

    router.get(
        "/users",
        query("search").isString().optional(),
        query("limit").isInt().optional().default(20),
        catchAsync(async (request, response) => {
            const search = request.query.search;
            const limit = request.query.limit;

            try {
                const users = await usersService.getUsers(
                    typeof search === "string" ? search : undefined,
                    typeof limit === "string" ? +limit : undefined
                );
                response.json(users).end();
            } catch (e: HttpException | any) {
                response
                    .status(e.status || HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({
                        status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                        message: e.message,
                    })
                    .end();
            }

            response.end();
        })
    );

    return router;
}
