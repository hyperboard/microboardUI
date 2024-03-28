import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import winston from "winston";
import { AccessToken } from "Interface";
import { publicKey } from "shared/config/keys";

export function jwtMiddleware(logger: winston.Logger) {
    return (request: Request, response: Response, next: NextFunction): void => {
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
        const claims = verify(token, publicKey, { algorithms: ["ES256"] });
        if (!claims) {
            response.status(401);
            response.json({
                status: 401,
                message: "Jwt token invalid or expired",
            })
            response.end();
            return;
        }
        request.token = claims as AccessToken;
        next();
    };
}
