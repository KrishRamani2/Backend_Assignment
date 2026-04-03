
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { config } from '../config';


export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.header("Access-Control-Allow-Origin", "*");
  // Log error in development
  if (!config.isProduction) {
    console.error('❌ Error:', err.message);
    if (!(err instanceof ApiError)) {
      console.error(err.stack);
    }
  }

  // Handle known operational errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Handle Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: {
          message: 'A record with this value already exists',
          statusCode: 409,
        },
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          message: 'Record not found',
          statusCode: 404,
        },
      });
      return;
    }
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: {
      message: config.isProduction
        ? 'Internal server error'
        : err.message || 'Something went wrong',
      statusCode: 500,
    },
  });
};
