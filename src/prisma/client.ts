// ─────────────────────────────────────────────────────────
// Prisma Client Singleton (Prisma 7+ with driver adapter)
// ─────────────────────────────────────────────────────────
// Uses @prisma/adapter-better-sqlite3 for SQLite connections.
// Re-uses a single PrismaClient instance across the app.
// ─────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
