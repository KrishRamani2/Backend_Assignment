// ─────────────────────────────────────────────────────────
// User Controller — User management endpoints
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export class UserController {
  /**
   * GET /api/users
   * Get all users (admin only).
   */
  static async getAllUsers(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get a specific user by ID.
   */
  static async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id as string);
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/status
   * Update a user's active status (admin only).
   */
  static async updateUserStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await UserService.updateUserStatus(
        req.params.id as string,
        req.body.isActive
      );
      sendSuccess(res, user, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
