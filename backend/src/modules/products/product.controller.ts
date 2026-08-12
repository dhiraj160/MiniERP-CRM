import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { ApiResponse } from '../../utils/apiResponse';

const productService = new ProductService();

export class ProductController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.list(req.query);
      ApiResponse.success(res, result, 'Products retrieved');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      ApiResponse.success(res, product);
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      ApiResponse.created(res, product, 'Product created successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);
      ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.getLowStock(req.query);
      ApiResponse.success(res, result, 'Low stock products retrieved');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }
}
