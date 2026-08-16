import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createRefreshToken, verifyRefreshToken } from '../src/utils/auth-tokens.js';

const config = {
  nodeEnv: 'test' as const,
  frontendUrl: 'http://localhost:3000',
  jwtAccessSecret: 'a'.repeat(32),
  jwtRefreshSecret: 'b'.repeat(32),
};

describe('authentication session hardening', () => {
  it('refreshes an expired access token with a valid refresh token', async () => {
    const expiredAccessToken = jwt.sign({ sub: 'user-id', email: 'user@example.com' }, config.jwtAccessSecret, { expiresIn: -1 });
    const refreshToken = createRefreshToken({ sub: 'user-id', email: 'user@example.com' }, config.jwtRefreshSecret);
    expect(verifyRefreshToken(refreshToken, config.jwtRefreshSecret)).toMatchObject({ sub: 'user-id' });
    const app = createApp(config);

    const expiredResponse = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`accessToken=${expiredAccessToken}`, `refreshToken=${refreshToken}`]);

    expect(expiredResponse.status).toBe(401);

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.headers['set-cookie']).toEqual(expect.arrayContaining([
      expect.stringContaining('accessToken='),
      expect.stringContaining('HttpOnly'),
      expect.stringContaining('SameSite=Lax'),
    ]));
  });

  it('rejects refresh requests without a valid refresh token', async () => {
    const app = createApp(config);
    const response = await request(app).post('/api/auth/refresh');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('allows credentialed requests only from the configured frontend origin', async () => {
    const app = createApp(config);
    const response = await request(app)
      .options('/api/auth/me')
      .set('Origin', config.frontendUrl)
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(config.frontendUrl);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
