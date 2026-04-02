// ─────────────────────────────────────────────────────────
// Prisma Client Singleton (Prisma 7+ with driver adapter)
// ─────────────────────────────────────────────────────────
// Uses @prisma/adapter-better-sqlite3 for SQLite connections.
// Re-uses a single PrismaClient instance across the app.
// ─────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Create the SQLite adapter
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
