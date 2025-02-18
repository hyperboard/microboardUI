import { IncomingMessage, ServerResponse } from "http";

export function nocache(_request: IncomingMessage, response: ServerResponse, next: () => void) {
    response.setHeader("Surrogate-Control", "no-store");
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", "0");
    next();
}
