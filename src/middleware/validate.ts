// ─────────────────────────────────────────────────────────
// Zod Validation Middleware
// ─────────────────────────────────────────────────────────
// Validates req.body, req.query, or req.params against a
// Zod schema before reaching the controller.
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates the request body against a Zod schema.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => ({
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

/**
 * Validates request query parameters against a Zod schema.
 * Stores the parsed result in res.locals.parsedQuery since
 * req.query is read-only in Express 5.
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      _res.locals.parsedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => ({
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
