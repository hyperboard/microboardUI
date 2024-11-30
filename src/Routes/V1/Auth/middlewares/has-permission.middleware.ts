import type { NextFunction, Request, Response } from "express";
import type { AccessToken } from "Interface";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";

type Actions = "owns" | "edits" | "reads";
type Resources = "boards" | "catalogs" | "groups";

export function checkPermissions(
  jwt: AccessToken,
  action: Actions,
  resource: Resources,
  resourceId: string
): boolean {
  if (!jwt || !jwt[action]?.[resource]) {
    return false;
  }
  return jwt[action]![resource]?.includes(resourceId) ?? false;
}

export function hasPermission(action: Actions, resource: Resources, getResourceId: (req: Request) => string) {
  return catchAsync(async (req: Request, _: Response, next: NextFunction) => {
    const resourceId = getResourceId(req);
    const token = req.token
    
    if (checkPermissions(token, action, resource, resourceId)) {
      return next()
    }

    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Not authorized');
  });
}