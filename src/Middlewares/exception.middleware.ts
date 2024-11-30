import type { NextFunction, Request, Response } from "express";
import { ExceptionResponse } from "shared/dto/exception-response.dto";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import type { Logger } from "winston";

export function exceptionMiddleware(logger: Logger) {
  return function (err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof HttpException) {
      return res.status(err.statusCode).json(new ExceptionResponse(err.status, err.message, err.data))
    }

    logger.error(err);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ExceptionResponse('error', 'Unknown server error'));
  }
}