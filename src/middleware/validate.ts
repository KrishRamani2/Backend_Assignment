import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';


export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = (error as any).issues.map((e: { path: any[]; message: any; }) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        _res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: formattedErrors,
          },
        });
        return;
      }
      next(error);
    }
  };
};


export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      _res.locals.parsedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = (error as any).issues.map((e: { path: any[]; message: any; }) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        _res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: formattedErrors,
          },
        });
        return;
      }
      next(error);
    }
  };
};
