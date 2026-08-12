import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/apiResponse';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      ApiResponse.success(res, result, 'Login successful');
    } catch (error: any) {
      if (error.status) {
        ApiResponse.error(res, error.message, error.status);
      } else {
        next(error);
      }
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      ApiResponse.success(res, result, 'Token refreshed');
    } catch (error: any) {
      if (error.status) {
        ApiResponse.error(res, error.message, error.status);
      } else {
        next(error);
      }
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      ApiResponse.success(res, user);
    } catch (error: any) {
      if (error.status) {
        ApiResponse.error(res, error.message, error.status);
      } else {
        next(error);
      }
    }
  }
}
