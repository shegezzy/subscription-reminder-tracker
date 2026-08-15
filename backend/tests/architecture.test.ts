import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { EnvironmentValidationError, validateEnvironment } from '../src/config/env.js';
import { asyncHandler } from '../src/middleware/async-handler.js';

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
    const next = vi.fn();
    const handler = asyncHandler(async () => {
      throw new Error('failure');
    });

    handler({} as never, {} as never, next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledOnce());
  });

  it('validates required runtime environment values', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production', PORT: 'invalid' })).toThrow(
      EnvironmentValidationError,
    );

    expect(
      validateEnvironment({
        NODE_ENV: 'test',
        PORT: '4100',
        FRONTEND_URL: 'http://localhost:3000',
      }),
    ).toEqual({ nodeEnv: 'test', port: 4100, frontendUrl: 'http://localhost:3000' });
  });
});
