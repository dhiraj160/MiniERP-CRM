import { Request, Response, NextFunction } from 'express';
import { StockService } from './stock.service';
import { ApiResponse } from '../../utils/apiResponse';

const stockService = new StockService();

export class StockController {
  async move(req: Request, res: Response, next: NextFunction) {
    try {
      const movement = await stockService.move(req.body, req.user!.userId);
      ApiResponse.created(res, movement, 'Stock movement recorded');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async listMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await stockService.listMovements(req.query);
      ApiResponse.success(res, result, 'Stock movements retrieved');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }
}
