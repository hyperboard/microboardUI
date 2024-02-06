type EncodedUser = {
    id: string;
    email: string;
}

declare namespace Express {
    export interface Request {
        user: EncodedUser;
    }
}
