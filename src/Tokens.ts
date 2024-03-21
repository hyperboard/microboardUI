import jwt from "jsonwebtoken";
import { AccessToken } from "Interface";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface Token {
    sub: string; // Subject (usually user id)
    exp: number; // Expiration time
    nbf?: number; // Not before
    iat: number; // Issued at
    jti: string; // JWT ID
    aud: string; // Audience
    iss: string; // Issuer
}

export async function createToken(
    claims: object,
    userId: string,
    expiresIn: number,
    issuer: string,
    audience: string
): Promise<string> {
    const privateKey = getPrivateKey();

    const issuedAt = Math.floor(Date.now() / 1000);
    const expirationTime = issuedAt + expiresIn;

    const standardClaims: Token = {
        sub: userId, // Subject (usually the user id)
        exp: expirationTime, // Expiration time
        iat: issuedAt, // Issued at
        jti: uuidv4(), // JWT ID using UUID v4
        aud: audience, // Audience
        iss: issuer, // Issuer
    };

    const tokenPayload = {
        ...claims,
        ...standardClaims,
    };

    if (!privateKey) {
        throw new Error("Private key is not defined");
    }

    const tokenString = jwt.sign(tokenPayload, privateKey, {
        algorithm: "ES256",
    });

    return tokenString;
}

export async function verifyToken(
    tokenString: string
): Promise<AccessToken | null> {
    try {
        const publicKey = getPublicKey();
        const token = jwt.verify(tokenString, publicKey, {
            algorithms: ["ES256"],
        }) as AccessToken;
        if (isTokenValid(token)) {
            return token;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

function getPublicKey() {
    const publicKeyPath = process.env.PUBLIC_KEY_PATH;
    return getKey(publicKeyPath);
}

function getPrivateKey() {
    const publicKeyPath = process.env.PRIVATE_KEY_PATH;
    return getKey(publicKeyPath);
}

function getKey(keyPath: string | undefined) {
    if (!keyPath) {
        throw new Error("Key path is not set up");
    }
    return fs.readFileSync(path.resolve(keyPath), "utf8");
}

function isTokenValid(token: Token): boolean {
    const now = Math.floor(Date.now() / 1000);

    // Check if token "Not Before" field is valid (if present)
    if (token.nbf && token.nbf > now) return false;

    // Check if token has expired
    if (token.exp <= now) return false;

    // Check if token "Issued At" field indicates it was issued in the future
    if (token.iat > now) return false;

    // Check if the audience is the intended audience
    // const intendedAudience = "YourIntendedAudience";
    if (token.aud !== "Whiteboard") return false;

    // Check if the issuer is the expected issuer
    // const expectedIssuer = "YourExpectedIssuer";
    // if (token.iss !== expectedIssuer) return false;

    // Check if JWT ID is in a valid format
    if (!validateJTI(token.jti)) return false;

    return true;
}

function validateJTI(jti: string): boolean {
    const jtiFormat = /^[a-zA-Z0-9-_]+$/;
    return jtiFormat.test(jti);
}
