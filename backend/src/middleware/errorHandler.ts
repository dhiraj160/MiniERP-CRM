import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a standardized response.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err);

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    switch (prismaError.code) {
      case 'P2002':
        const field = prismaError.meta?.target?.[0] || 'field';
        ApiResponse.conflict(res, `A record with this ${field} already exists`);
        return;
      case 'P2025':
        ApiResponse.notFound(res, 'Record not found');
        return;
      case 'P2003':
        ApiResponse.badRequest(res, 'Related record not found');
        return;
      default:
        ApiResponse.error(res, 'Database error');
        return;
    }
  }

  // Prisma validation errors
  if (err.constructor.name === 'PrismaClientValidationError') {
    ApiResponse.badRequest(res, 'Invalid data provided');
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    ApiResponse.unauthorized(res, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ApiResponse.unauthorized(res, 'Token expired');
    return;
  }

  // Default 500 error
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error';

  ApiResponse.error(res, message, 500);
};
