import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AccessToken } from "Interface";
import fs from "fs";
import path from "path";

const publicKeyPath = process.env.PUBLIC_KEY_PATH;
if (!publicKeyPath) {
    throw new Error("Public key path is not set up");
}
const publicKey = fs.readFileSync(path.resolve(publicKeyPath), "utf8");

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
        // Verify JWT using the public key
        const claims = jwt.verify(token, publicKey, { algorithms: ["ES256"] });
        req.user = claims as AccessToken;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired JWT token" });
    }
};
