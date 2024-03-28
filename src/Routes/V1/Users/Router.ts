import express from "express";
import { Users } from "./Users";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import winston from "winston";
import { jwtMiddleware } from "Middlewares/jwt.middleware";

export function getUsersRouter(
    usersService: Users,
    logger: winston.Logger
): express.Router {
    const router = express.Router();

    router.get("/users/me",
        jwtMiddleware(logger),
        async (request, response) => {
            const { token: reqUser } = request;
            if (!reqUser) {
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
                user = await usersService.getMe(reqUser);
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
        });

    return router;
}
