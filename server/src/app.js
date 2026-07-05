import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { apiRouter } from './routes/api.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  const allowedOrigins = env.clientOrigin.split(',').map((o) => o.trim());

  app.use(
    helmet({
      contentSecurityPolicy: false, // client is a separate SPA deployment
    }),
  );
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter, apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found.' });
  });

  // Centralized error handler — never leak stack traces to clients.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({ message: 'Internal server error.' });
  });

  return app;
}
