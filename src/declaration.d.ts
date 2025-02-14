import { AccessToken } from "Interface";
import type { Lang } from "Middlewares/language.middleware";

declare global {
    namespace Express {
        interface Request {
            token: AccessToken;
            lang: Lang;
        }
    }
}
