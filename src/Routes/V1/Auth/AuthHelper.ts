import { Config } from "shared/config/config";
import { AccessToken } from "Interface";
import { Permissions } from "./types";
import { createToken } from "Tokens";

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

    public async generateRefreshToken(id: number, permissions?: Permissions): Promise<string> {
        const claims: Partial<AccessToken> = {
            ...permissions,
        };

        const token = await createToken(
            claims,
            `${id}`,
            60 * 60, // 1 hour
            'Whiteboard',
            'Whiteboard'
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

        const token = await createToken(
            claims,
            `${id}`,
            60 * 60 * 24 * 7, // 7 days
            'Whiteboard',
            'Whiteboard'
        );

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
        const refreshToken = await this.generateRefreshToken(id, permissions);

        if (!accessToken || !refreshToken) {
            throw new Error("Failed to generate tokens");
        }

        return {
            accessToken,
            refreshToken,
        };
    }
}
