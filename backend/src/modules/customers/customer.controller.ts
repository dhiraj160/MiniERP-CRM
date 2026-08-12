import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { ApiResponse } from '../../utils/apiResponse';

const customerService = new CustomerService();

export class CustomerController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.list(req.query);
      ApiResponse.success(res, result, 'Customers retrieved');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getById(req.params.id);
      ApiResponse.success(res, customer);
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.create(req.body, req.user!.userId);
      ApiResponse.created(res, customer, 'Customer created successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      ApiResponse.success(res, customer, 'Customer updated successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await customerService.addNote(
        req.params.id,
        req.body.note,
        req.user!.userId
      );
      ApiResponse.created(res, note, 'Note added successfully');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }

  async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.getFollowUps(req.query);
      ApiResponse.success(res, result, 'Follow-ups retrieved');
    } catch (error: any) {
      if (error.status) ApiResponse.error(res, error.message, error.status);
      else next(error);
    }
  }
}
