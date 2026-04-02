// ─────────────────────────────────────────────────────────
// Zod Validation Schemas
// ─────────────────────────────────────────────────────────
// Centralized input validation schemas for all endpoints
// ─────────────────────────────────────────────────────────

import { z } from 'zod';
import { ROLES, ALL_ROLES, TRANSACTION_TYPES } from './constants';

// ─── Auth Schemas ────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  role: z.enum(ALL_ROLES as [string, ...string[]]).optional().default(ROLES.VIEWER),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── User Schemas ────────────────────────────────────────

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

// ─── Financial Record Schemas ────────────────────────────

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  type: z.enum([TRANSACTION_TYPES.INCOME, TRANSACTION_TYPES.EXPENSE], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  transactionDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD)' }
  ),
});

export const updateRecordSchema = createRecordSchema.partial();

export const recordQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  type: z
    .enum([TRANSACTION_TYPES.INCOME, TRANSACTION_TYPES.EXPENSE])
    .optional(),
  category: z.string().optional(),
  startDate: z
    .string()
    .refine((d) => !d || !isNaN(Date.parse(d)), {
      message: 'Invalid startDate format',
    })
    .optional(),
  endDate: z
    .string()
    .refine((d) => !d || !isNaN(Date.parse(d)), {
      message: 'Invalid endDate format',
    })
    .optional(),
  sortBy: z
    .enum(['transactionDate', 'amount', 'createdAt'])
    .optional()
    .default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
