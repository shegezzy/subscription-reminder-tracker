import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import { healthRouter } from './routes/health.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import type { AuthConfig } from './types/auth.js';

export function createApp(authConfig?: AuthConfig): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestLogger);
  if (authConfig) {
    app.use(cors({ origin: authConfig.frontendUrl, credentials: true, methods: ['GET', 'POST'] }));
  }
  app.use(cookieParser());
  app.use(express.json({ limit: '100kb' }));
  app.use('/api/health', healthRouter);
  if (authConfig) app.use('/api/auth', createAuthRouter(authConfig));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
