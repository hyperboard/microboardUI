import { Request, Response, NextFunction } from "express";
import { decode, verify } from "jsonwebtoken";
import winston from "winston";
import { HttpStatus } from "../enums/http-status.enum";

export function jwtMiddleware(logger: winston.Logger) {
    return (request: Request, response: Response, next: NextFunction): void => {
        if (!process.env.JWT_SECRET) {
            logger.error("process.env.JWT_SECRET not found");

            response
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: "Jwt secret not secured",
                })
                .end();
        }
        const authorization = request.headers["authorization"];
        const token = authorization?.split(" ")[1];

        if (!token) {
            response.status(HttpStatus.UNAUTHORIZED);
            response.json({
                status: HttpStatus.UNAUTHORIZED,
                message: "JWT token not found in Authorization header",
            });
            response.end();
            return;
        }
        const isValidToken = verify(token, process.env.JWT_SECRET!);
        if (!isValidToken) {
            response.status(HttpStatus.UNAUTHORIZED);
            response.json({
                status: HttpStatus.UNAUTHORIZED,
                message: "Jwt token invalid or expired",
            });
            response.end();
            return;
        }

        const decodedUser = decode(token) as RequestUser;
        request.user = decodedUser as RequestUser;

        next();
    };
}
