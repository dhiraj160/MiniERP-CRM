import { Request, Response, NextFunction } from 'express';
import { ChallanService } from './challan.service';
import { ApiResponse } from '../../utils/apiResponse';

const challanService = new ChallanService();

export class ChallanController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await challanService.list(req.query);
      ApiResponse.success(res, result, 'Challans retrieved');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await challanService.getById(req.params.id);
      ApiResponse.success(res, challan);
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await challanService.create(req.body, req.user!.userId);
      ApiResponse.created(res, challan, 'Challan created successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await challanService.update(req.params.id, req.body, req.user!.userId);
      ApiResponse.success(res, challan, 'Challan updated successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await challanService.confirm(req.params.id, req.user!.userId);
      ApiResponse.success(res, challan, 'Challan confirmed successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await challanService.cancel(req.params.id, req.user!.userId);
      ApiResponse.success(res, challan, 'Challan cancelled successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }
}
