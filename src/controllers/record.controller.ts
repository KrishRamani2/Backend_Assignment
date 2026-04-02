
import { Request, Response, NextFunction } from 'express';
import { FinancialRecordService } from '../services/record.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { Role } from '../utils/constants';

export class RecordController {
  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const record = await FinancialRecordService.create({
        ...req.body,
        userId: req.user!.userId,
      });
      sendSuccess(res, record, 'Record created successfully', 201);
    } catch (error) {
      next(error);
    }
  }


  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { records, total, page, limit } =
        await FinancialRecordService.getAll(
          res.locals.parsedQuery,
          req.user!.userId,
          req.user!.role as Role
        );
      sendPaginated(res, records, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

 
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const record = await FinancialRecordService.getById(
        req.params.id as string,
        req.user!.userId,
        req.user!.role as Role
      );
      sendSuccess(res, record, 'Record retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const record = await FinancialRecordService.update(
        req.params.id as string,
        req.body,
        req.user!.userId,
        req.user!.role as Role
      );
      sendSuccess(res, record, 'Record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await FinancialRecordService.softDelete(
        req.params.id as string,
        req.user!.userId,
        req.user!.role as Role
      );
      sendSuccess(res, null, 'Record deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
