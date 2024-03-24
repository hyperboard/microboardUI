import { AccessToken } from "Interface";

declare module "*.sql" {
    const content: string;
    export default content;
}

declare global {
    namespace Express {
        interface Request {
            token: AccessToken;
        }
    }
}
