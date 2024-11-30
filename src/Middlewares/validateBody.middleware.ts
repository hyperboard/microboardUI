import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from 'shared/enums/http-status.enum';
import { HttpException } from 'shared/exceptions/http-exception';
import { catchAsync } from 'shared/lib/catchAsync';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
    return catchAsync(async (req: Request, _: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
              const flattenedErrors = error.flatten().fieldErrors;
                throw new HttpException(HttpStatus.BAD_REQUEST, 'Validation error', flattenedErrors)
            }
            next(error);
        }
    });
}