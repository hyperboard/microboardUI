import { Request, Response, NextFunction } from "express";
import { verifyToken } from "Tokens";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await verifyToken(token, 'access');
    if (!decodedToken) {
        return res.status(401).json({ message: "Invalid or expired JWT token" });
    }

    req.token = decodedToken;
    next();
}
