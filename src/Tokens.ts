import jwt from "jsonwebtoken";
import { AccessToken, type RefreshToken } from "Interface";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

type TokenType = "access" | "refresh";

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
    userId: string,
    expiresIn: number,
    issuer: string,
    audience: string,
    type: TokenType,
    claims?: object
): Promise<string> {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expirationTime = issuedAt + expiresIn;
    const privateKey = getPrivateKey(type);

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
    tokenString: string,
    type: TokenType
): Promise<AccessToken | null> {
    try {
        const publicKey = getPublicKey(type);
        if (!publicKey) {
            throw new Error("Private key is not defined");
        }
        const token = jwt.verify(tokenString, publicKey, {
            algorithms: ["ES256"],
        }) as AccessToken | RefreshToken;
        if (isTokenValid(token)) {
            return token;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}


function getPrivateKey(type: TokenType) {
    switch (type) {
        case "access":
            return getAccessPrivateKey();
        case "refresh":
            return getRefreshPrivateKey();
        default:
            throw new Error("Wrong token type");
    }
}

function getPublicKey(type: TokenType) {
    switch (type) {
        case "access":
            return getAccessPublicKey();
        case "refresh":
            return getRefreshPublicKey();
        default:
            throw new Error("Wrong token type");
    }
}

function getAccessPublicKey() {
    const publicKeyPath = process.env.ACCESS_PUBLIC_KEY_PATH;
    return getKey(publicKeyPath);
}

function getAccessPrivateKey() {
    const privateKeyPath = process.env.ACCESS_PRIVATE_KEY_PATH;
    return getKey(privateKeyPath);
}

function getRefreshPublicKey() {
    const publicKeyPath = process.env.REFRESH_PUBLIC_KEY_PATH;
    return getKey(publicKeyPath);
}

function getRefreshPrivateKey() {
    const privateKeyPath = process.env.REFRESH_PRIVATE_KEY_PATH;
    return getKey(privateKeyPath);
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
