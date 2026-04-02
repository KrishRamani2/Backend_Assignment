
import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { Role } from '../utils/constants';

export class DashboardController {

  static async getSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const summary = await DashboardService.getSummary(
        req.user!.userId,
        req.user!.role as Role
      );
      sendSuccess(res, summary, 'Dashboard summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
