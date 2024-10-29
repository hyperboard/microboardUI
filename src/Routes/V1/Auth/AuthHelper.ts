import { AccessToken } from "Interface";
import { Config } from "shared/config/config";
import { createToken } from "Tokens";
import { Permissions } from "./types";

export const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 30; // 30 days
export const ACCESS_TOKEN_EXPIRY = 1 * 60 * 60; // 1 hour

export class AuthHelper {
    constructor(private config: Config) {}

    public generatePasscode(length: number = 6): string {
        const symbols = "0123456789";
        let passcode = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * symbols.length);
            passcode += symbols[randomIndex];
        }

        return passcode;
    }

    public async generateRefreshToken(id: number): Promise<string> {
        const token = await createToken(
            `${id}`,
            60 * 60, // 1 hour
            "Whiteboard",
            "Whiteboard",
            "refresh"
        );

        if (!token) {
            throw new Error("Failed to generate refresh token");
        }

        return token;
    }

    public async generateAccessToken(id: number, permissions?: Permissions): Promise<string> {
        const claims: Partial<AccessToken> = {
            ...permissions,
        };

        const token = await createToken(`${id}`, ACCESS_TOKEN_EXPIRY, "Whiteboard", "Whiteboard", "access", claims);

        if (!token) {
            throw new Error("Failed to generate access token");
        }

        return token;
    }

    public async generateTokens(
        id: number,
        permissions?: Permissions
    ): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const accessToken = await this.generateAccessToken(id, permissions);
        const refreshToken = await this.generateRefreshToken(id);

        if (!accessToken || !refreshToken) {
            throw new Error("Failed to generate tokens");
        }

        return {
            accessToken,
            refreshToken,
        };
    }
}
