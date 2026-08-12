import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { ApiResponse } from '../../utils/apiResponse';

const categoryService = new CategoryService();

export class CategoryController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.list();
      ApiResponse.success(res, categories, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body.name);
      ApiResponse.created(res, category, 'Category created');
    } catch (error) {
      next(error);
    }
  }
}
