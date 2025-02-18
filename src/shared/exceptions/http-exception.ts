import { HttpStatus } from "../enums/http-status.enum";

export class HttpException extends Error {
    status: "fail" | "error";

    constructor(
        public statusCode: HttpStatus,
        public message: string,
        public data?: Record<string | number | symbol, unknown>
    ) {
        super(message);

        this.status = statusCode.toString().startsWith("4") ? "fail" : "error";

        Error.captureStackTrace(this, this.constructor);
    }
}
