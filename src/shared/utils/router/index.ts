// Utilities that are used in express router and related packages;

import { AccessToken } from "Interface";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { HttpStatus } from "shared/enums/http-status.enum";

export function checkPermissions(
    jwt: AccessToken,
    action: "owns" | "edits" | "reads",
    resource: "boards" | "catalogs" | "groups",
    resourceId: string
): boolean {
    if (!jwt || !jwt[action]?.[resource]) {
        return false;
    }
    return jwt[action]![resource]?.includes(resourceId) ?? false;
}

export function hasRootCatalogPermission(token: AccessToken): boolean {
    return checkPermissions(token, "owns", "catalogs", "root");
}

export function forbidden(res: Response): void {
    res.status(HttpStatus.FORBIDDEN).json({
        message: "Forbidden - User does not have the necessary permissions for the resource",
    });
}

export function validateRequest(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: HttpStatus.BAD_REQUEST,
            message: errors.array().map((e) => e.msg),
        });
    }
    next();
}

export function handleError(res: Response, error: any, defaultStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    const status = error.status || defaultStatus;

    return res.status(status).json({
        status,
        message: error.message,
    });
}
