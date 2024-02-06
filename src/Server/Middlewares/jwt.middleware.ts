import { Request, Response, NextFunction } from "express";
import { decode, verify } from "jsonwebtoken";
import winston from "winston";

export function jwtMiddleware(logger: winston.Logger) {
    return (request: Request, response: Response, next: NextFunction): void => {
        if (!process.env.JWT_SECRET) {
            logger.error("process.env.JWT_SECRET not found");

            response
                .status(500)
                .json({
                    status: 500,
                    message: "",
                })
                .end();
        }
        const authorization = request.headers["authorization"];
        const token = authorization?.split(" ")[1];
        if (!token) {
            response.status(401);
            response.json({
                status: 401,
                message: "JWT token not found in Authorization header",
            })
            response.end();
            return;
        }
        const isValidToken = verify(token, process.env.JWT_SECRET!);
        if (!isValidToken) {
            response.status(401);
            response.json({
                status: 401,
                message: "Jwt token invalid or expired",
            })
            response.end();
            return;
        }
        const decodedUser = decode(token) as EncodedUser;
        request.user = decodedUser as EncodedUser;
        next();
    };
}
