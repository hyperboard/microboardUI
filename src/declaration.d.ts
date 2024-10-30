import { AccessToken } from "Interface";

declare global {
    namespace Express {
        interface Request {
            token: AccessToken;
        }
    }
}
