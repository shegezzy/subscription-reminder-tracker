import express from 'express';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { EnvironmentValidationError, validateEnvironment } from '../src/config/env.js';
import { asyncHandler } from '../src/middleware/async-handler.js';
import { errorHandler } from '../src/middleware/error-handler.js';
import { AppError } from '../src/utils/app-error.js';

describe('backend architecture', () => {
  it('returns the standard error format for unknown routes', async () => {
    const app = createApp();
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route GET /api/unknown was not found.' },
    });
  });

  it('sends malformed JSON through the central error handler', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/health')
      .set('content-type', 'application/json')
      .send('{');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
    });
  });

  it('forwards rejected async handlers to Express error middleware', async () => {
    const app = express();
    app.get(
      '/failure',
      asyncHandler(async () => {
        throw new AppError(418, 'TEAPOT', 'Expected failure.');
      }),
    );
    app.use(errorHandler);

    const response = await request(app).get('/failure');

    expect(response.status).toBe(418);
    expect(response.body).toEqual({
      success: false,
      error: { code: 'TEAPOT', message: 'Expected failure.' },
    });
  });

  it('validates required runtime environment values', () => {
    let caughtError: unknown;

    try {
      validateEnvironment({ NODE_ENV: 'production', PORT: 'invalid' });
    } catch (error: unknown) {
      caughtError = error;
    }

    if (!(caughtError instanceof EnvironmentValidationError)) {
      throw new Error('Expected environment validation to throw EnvironmentValidationError.');
    }

    expect(caughtError.issues).toEqual([
      'PORT must be an integer between 1 and 65535',
      'FRONTEND_URL is required',
      'MONGODB_URI is required',
      'JWT_ACCESS_SECRET must be at least 32 characters',
      'JWT_REFRESH_SECRET must be at least 32 characters',
    ]);

    expect(
      validateEnvironment({
        NODE_ENV: 'test',
        PORT: '4100',
        FRONTEND_URL: 'http://localhost:3000',
        MONGODB_URI: 'mongodb://localhost:27017/test',
        JWT_ACCESS_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      }),
    ).toEqual({
      nodeEnv: 'test',
      port: 4100,
      frontendUrl: 'http://localhost:3000',
      mongoUri: 'mongodb://localhost:27017/test',
      jwtAccessSecret: 'a'.repeat(32),
      jwtRefreshSecret: 'b'.repeat(32),
    });

    expect(
      validateEnvironment({
        NODE_ENV: 'test',
        PORT: '4100',
        FRONTEND_URL: 'http://localhost:3000',
        MONGODB_URI: 'mongodb+srv://user:pass@cluster0.example.mongodb.net/test',
        JWT_ACCESS_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      }),
    ).toEqual({
      nodeEnv: 'test',
      port: 4100,
      frontendUrl: 'http://localhost:3000',
      mongoUri: 'mongodb+srv://user:pass@cluster0.example.mongodb.net/test',
      jwtAccessSecret: 'a'.repeat(32),
      jwtRefreshSecret: 'b'.repeat(32),
    });
  });
});
