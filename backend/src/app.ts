import express, { type Express } from 'express';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import { healthRouter } from './routes/health.routes.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestLogger);
  app.use(express.json({ limit: '100kb' }));
  app.use('/api/health', healthRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
