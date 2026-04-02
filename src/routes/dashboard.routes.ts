// ─────────────────────────────────────────────────────────
// Dashboard Routes — /api/dashboard
// ─────────────────────────────────────────────────────────

import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { ROLES } from '../utils/constants';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary with analytics
 *     description: >
 *       Returns total income, total expense, net balance, category-wise breakdown,
 *       recent 5 transactions, and monthly trends for the last 12 months.
 *       VIEWER: sees only own data. ANALYST & ADMIN: sees all data.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                           example: 150000
 *                         totalExpense:
 *                           type: number
 *                           example: 85000
 *                         netBalance:
 *                           type: number
 *                           example: 65000
 *                         totalRecords:
 *                           type: integer
 *                           example: 42
 *                     categoryBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           type:
 *                             type: string
 *                           total:
 *                             type: number
 *                           count:
 *                             type: integer
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FinancialRecord'
 *                     monthlyTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2025-01"
 *                           income:
 *                             type: number
 *                           expense:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – ANALYST or ADMIN required
 */
router.get(
  '/summary',
  roleGuard(ROLES.ANALYST, ROLES.ADMIN),
  DashboardController.getSummary
);

export default router;
