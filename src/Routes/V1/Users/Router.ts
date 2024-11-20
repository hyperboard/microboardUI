import express from "express";
import { Users } from "./Users";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import winston from "winston";
import { jwtMiddleware } from "Middlewares/jwt.middleware";
import { catchAsync } from "shared/lib/catchAsync";
import { body, param } from "express-validator";
import { Readable } from "stream";

export function getUsersRouter(
    usersService: Users,
    logger: winston.Logger
): express.Router {
    const router = express.Router();

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
        }, logger
        ));
    
        router.patch(
            "/users/me",
            jwtMiddleware(logger),
            body('name').isString().isLength({min: 1}).optional(),
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
                    user = await usersService.editUser(userId, request.body.name);
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
            }, logger
            ));


    router.post(
        "/users/me/avatar",
        jwtMiddleware(logger),
        catchAsync(async (request, response) => {
            const { token } = request;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            if (!request.headers['content-type']?.startsWith('multipart/form-data')) {
                response
                    .status(HttpStatus.BAD_REQUEST)
                    .json({
                        status: HttpStatus.BAD_REQUEST,
                        message: "Invalid content type",
                    })
                    .end();
                return;
            }

            const boundary = request.headers['content-type'].split('boundary=')[1];
            if (!boundary) {
                response
                    .status(HttpStatus.BAD_REQUEST)
                    .json({
                        status: HttpStatus.BAD_REQUEST,
                        message: "Boundary not found",
                    })
                    .end();
                return;
            }

            const chunks: Buffer[] = [];
            request.on('data', (chunk) => {
                chunks.push(chunk);
            });

            request.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const parts = buffer.toString().split(`--${boundary}`);

                for (const part of parts) {
                    if (part.includes('Content-Disposition: form-data; name="avatar"; filename=')) {
                        const [header, body] = part.split('\r\n\r\n');
                        const fileStream = body.trim();
                        const mimeTypeMatch = header.match(/Content-Type: (.+)/);
                        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : null;
                        const filenameMatch = header.match(/filename="(.+)"/);
                        const fileExtension = filenameMatch ? filenameMatch[1].split('.').pop() : null;

                        if (!mimeType || !fileExtension) {
                            response
                                .status(HttpStatus.BAD_REQUEST)
                                .json({
                                    status: HttpStatus.BAD_REQUEST,
                                    message: "Invalid file data",
                                })
                                .end();
                            return;
                        }
                        const readableStream = new Readable();
                        readableStream.push(fileStream);
                        readableStream.push(null); // Indicate the end of the stream
                        let user = null;
                        try {
                            user = await usersService.uploadAvatar(userId, readableStream, mimeType, fileExtension);
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

                        return;
                    }
                }

                response
                    .status(HttpStatus.BAD_REQUEST)
                    .json({
                        status: HttpStatus.BAD_REQUEST,
                        message: "File not found",
                    })
                    .end();
            });
        }, logger
        ));

    router.get(
        "/users/:userId",
        param('userId').isInt(),
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
        }, logger
        ));

    return router;
}
