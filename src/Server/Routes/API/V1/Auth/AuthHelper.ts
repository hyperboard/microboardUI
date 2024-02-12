import {Config} from "../../../../shared/config/config";
import {sign} from "jsonwebtoken";

export class AuthHelper {
    constructor(private config: Config) {
    }

    public generatePasscode(length: number = 6): string {
        const symbols = "0123456789";
        let passcode = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * symbols.length);
            passcode += symbols[randomIndex];
        }

        return passcode;
    }

    public generateRefreshToken(email: string, id: number): string {
        return sign({email, id}, this.config.environment.JWT_REFRESH_SECRET as string, {
            expiresIn: "7d",
        });
    }

    public generateAccessToken(email: string, id: number): string {
        return sign({email, id}, this.config.environment.JWT_SECRET as string, {
            expiresIn: "1h",
        });
    }

    public generateTokens(email: string, id: number): {
        accessToken: string;
        refreshToken: string;
    } {
        const accessToken = this.generateAccessToken(email, id);
        const refreshToken = this.generateRefreshToken(email, id);
        return {
            accessToken,
            refreshToken,
        };
    }
}
