// ─────────────────────────────────────────────────────────
// Role Guard Middleware
// ─────────────────────────────────────────────────────────
// Restricts route access to specific roles.
// Must be used AFTER the authenticate middleware.
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { Role } from '../utils/constants';

/**
 * Creates a middleware that restricts access to users
 * whose role is included in the allowed roles list.
 *
 * @example
 * router.get('/admin-only', authenticate, roleGuard('ADMIN'), handler);
 * router.get('/analysts', authenticate, roleGuard('ANALYST', 'ADMIN'), handler);
 */
export const roleGuard = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};
