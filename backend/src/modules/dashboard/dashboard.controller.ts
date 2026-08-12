import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from '../../utils/apiResponse';

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      ApiResponse.success(res, stats, 'Dashboard statistics retrieved');
    } catch (error) {
      next(error);
    }
  }
}
