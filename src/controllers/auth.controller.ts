// ─────────────────────────────────────────────────────────
// Auth Controller — Handles registration & login requests
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user account.
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token.
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get the current authenticated user's profile.
   */
  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      sendSuccess(res, req.user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
