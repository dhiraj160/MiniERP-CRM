import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...((data && typeof data === 'object' && 'pagination' in (data as any))
        ? data
        : { data }),
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, message: string, statusCode = 500, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  static badRequest(res: Response, message: string, errors?: any) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string) {
    return this.error(res, message, 409);
  }
}
