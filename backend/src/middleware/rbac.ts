import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Role-based access control middleware.
 * Pass allowed roles as arguments.
 * Example: authorize(Role.ADMIN, Role.SALES)
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ApiResponse.forbidden(
        res,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
      return;
    }

    next();
  };
};
