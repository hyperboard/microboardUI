import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";
import { verifyToken } from "Tokens";

export const authenticate = (optional = false) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if ((!authHeader || !authHeader.startsWith("Bearer ")) && !optional) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid Authorization header format");
        }
        const token = authHeader?.split(" ")[1];
        const decodedToken = await verifyToken(token ?? "", "access");
        if (!decodedToken && !optional) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token");
        }

        if (decodedToken) {
            req.token = decodedToken;
        }

        next();
    });
