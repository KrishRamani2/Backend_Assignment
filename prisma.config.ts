// ─────────────────────────────────────────────────────────
// Prisma Configuration — Prisma 7+
// ─────────────────────────────────────────────────────────

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: {
    schema: 'prisma/schema.prisma',
  },
  datasource: {
    url: 'file:./dev.db',
  },
});
