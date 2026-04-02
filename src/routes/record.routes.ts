import { Router } from 'express';
import { RecordController } from '../controllers/record.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { roleGuard } from '../middleware/roleGuard';
import { ROLES } from '../utils/constants';
import {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
} from '../utils/validators';

const router = Router();

// All record routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a new financial record
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, transactionDate]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000.50
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 example: "INCOME"
 *               category:
 *                 type: string
 *                 example: "Salary"
 *               description:
 *                 type: string
 *                 example: "Monthly salary payment"
 *               transactionDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  roleGuard(ROLES.ADMIN),
  validateBody(createRecordSchema),
  RecordController.create
);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List financial records with filtering & pagination
 *     description: >
 *       VIEWER sees only own records. ANALYST and ADMIN see all records.
 *       Supports filtering by date range, category, and type. Paginated results.
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Records per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter by transaction type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (partial match)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Start of date range (YYYY-MM-DD)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "End of date range (YYYY-MM-DD)"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [transactionDate, amount, createdAt]
 *           default: transactionDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated list of financial records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FinancialRecord'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get(
  '/',
  roleGuard(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  validateQuery(recordQuerySchema),
  RecordController.getAll
);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a financial record by ID
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Financial record details
 *       404:
 *         description: Record not found
 */
router.get(
  '/:id',
  roleGuard(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  RecordController.getById
);

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update a financial record
 *     description: Only the record owner or ADMIN can update.
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               transactionDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       403:
 *         description: Forbidden – not the owner
 *       404:
 *         description: Record not found
 */
router.put(
  '/:id',
  roleGuard(ROLES.ADMIN),
  validateBody(updateRecordSchema),
  RecordController.update
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft-delete a financial record
 *     description: Only the record owner or ADMIN can delete. Record is soft-deleted (isDeleted = true).
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       403:
 *         description: Forbidden – not the owner
 *       404:
 *         description: Record not found
 */
router.delete(
  '/:id',
  roleGuard(ROLES.ADMIN),
  RecordController.delete
);

export default router;
