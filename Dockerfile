# ─────────────────────────────────────────────────────────
# Finance Dashboard API — Dockerfile
# ─────────────────────────────────────────────────────────
# Multi-stage build:
#   builder — compiles TypeScript + generates Prisma client
#   runner  — lean production image (~150MB final size)
#
# Usage:
#   docker build -t finance-dashboard-api .
#   docker run -p 3000:3000 --env-file .env finance-dashboard-api
# ─────────────────────────────────────────────────────────

# ── Stage 1: Build ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma client (uses accelerateUrl from env at runtime)
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 2: Production Runner ───────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy only what's needed to run
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the compiled server (no prisma db push — Accelerate manages the DB)
CMD ["node", "dist/server.js"]
