// ─────────────────────────────────────────────────────────
// Role Constants — used throughout the application
// ─────────────────────────────────────────────────────────

export const ROLES = {
  VIEWER: 'VIEWER',
  ANALYST: 'ANALYST',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** All valid roles */
export const ALL_ROLES: Role[] = [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN];

/** Transaction types */
export const TRANSACTION_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];
