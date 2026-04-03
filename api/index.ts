// ─────────────────────────────────────────────────────────
// Vercel Serverless Entry Point
// ─────────────────────────────────────────────────────────
// Wraps the Express app export for Vercel's Node.js runtime.
// If the app fails to load, returns a safe JSON error with
// CORS headers so the browser never sees a raw 500.
// ─────────────────────────────────────────────────────────

import type { Request, Response } from 'express';

let app: any;
let loadError: Error | null = null;

try {
  app = require('../src/server').default;
} catch (err: any) {
  loadError = err;
  console.error('❌ Failed to load app:', err?.message || err);
}

export default function handler(req: Request, res: Response) {
  // Always attach CORS headers — even on crash
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (loadError || !app) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server failed to initialize. Check environment variables.',
        detail: loadError?.message || 'Unknown error',
        statusCode: 500,
      },
    });
  }

  return app(req, res);
}
