import { HttpStatus } from "../enums/http-status.enum";

export class HttpException extends Error {
    constructor(public status: HttpStatus, public message: string) {
        super(message);
    }
}
