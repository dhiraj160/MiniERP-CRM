import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../utils/apiResponse';

const userService = new UserService();

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.list(req.query);
      ApiResponse.success(res, result, 'Users list retrieved');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      ApiResponse.created(res, user, 'User account created');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      ApiResponse.success(res, user, 'User account updated');
    } catch (error) {
      next(error);
    }
  }
}
