import { google } from "googleapis";

export const GOOGLE_AUTH_REDIRECT_URL = `${process.env.BASE_URL}/api/v1/auth/google/callback`;

export class GoogleOAuth {
    private oauthClient = new google.auth.OAuth2({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: GOOGLE_AUTH_REDIRECT_URL,
    });
    private clientId = process.env.GOOGLE_CLIENT_ID;
    private clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    async getUserData(code: string) {
        try {
            // Exchange the authorization code for an access token using oauthClient
            const { tokens } = await this.oauthClient.getToken(code);
            if (!tokens.id_token) {
                return null;
            }

            // Verify the ID token using oauthClient
            const ticket = await this.oauthClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: this.clientId,
            });

            const payload = ticket.getPayload();

            return payload ?? null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    generateAuthUrl() {
        return this.oauthClient.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            response_type: "code",
            scope: ["profile", "email"],
        });
    }
}
