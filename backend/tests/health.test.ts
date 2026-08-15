import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('GET /api/health', () => {
  it('returns 200 and status ok', async () => {
    const app = createApp();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('does not expose sensitive information', async () => {
    const app = createApp();
    const response = await request(app).get('/api/health');
    const bodyText = JSON.stringify(response.body).toLowerCase();

    expect(bodyText).not.toContain('secret');
    expect(bodyText).not.toContain('password');
    expect(bodyText).not.toContain('mongodb');
  });
});
