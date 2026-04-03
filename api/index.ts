// ─────────────────────────────────────────────────────────
// Vercel Serverless Entry Point — Crash-Safe Wrapper
// ─────────────────────────────────────────────────────────
// The handler function is always exported successfully.
// The Express app is loaded lazily inside the handler,
// so if it throws (missing env vars, Prisma crash, etc.)
// we still return a proper JSON response WITH CORS headers.
// This is what prevents "CORS header missing" on 500 errors.
// ─────────────────────────────────────────────────────────

import type { Request, Response } from 'express';

// Cache the app after first successful load
let cachedApp: any = null;

function getApp() {
  if (!cachedApp) {
    // Loaded lazily so a crash here is caught by the handler try/catch
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cachedApp = require('../src/server').default;
  }
  return cachedApp;
}

export default function handler(req: Request, res: Response) {
  // ── CORS headers FIRST — always, no matter what happens next ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Load and delegate to Express app
  try {
    const app = getApp();
    return app(req, res);
  } catch (err: any) {
    console.error('[handler] App load failed:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server failed to initialize. Ensure all environment variables are set in Vercel.',
        detail: process.env.NODE_ENV !== 'production' ? (err?.message || 'Unknown') : undefined,
        statusCode: 500,
      },
    });
  }
}
