import { Router, type Response } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { login, register } from '../services/auth.service.js';
import type { AuthConfig, AuthenticatedRequest } from '../types/auth.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/auth-tokens.js';
import { successResponse } from '../utils/api-response.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from '../middleware/async-handler.js';

type AuthInput = { email: string; password: string; firstName?: string | undefined; lastName?: string | undefined };
type SessionUser = { _id: unknown; email: string; firstName: string; lastName: string };

export function createAuthRouter(config: AuthConfig): Router {
  const router = Router();
  const cookie = { httpOnly: true, sameSite: config.nodeEnv === 'production' ? 'none' as const : 'lax' as const, secure: config.nodeEnv === 'production', path: '/' };

  function validate(body: unknown): AuthInput {
    if (!body || typeof body !== 'object') throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request body.');
    const { email, password, firstName, lastName } = body as Record<string, unknown>;
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 12) throw new AppError(400, 'VALIDATION_ERROR', 'Provide a valid email and password of at least 12 characters.');
    if ((firstName !== undefined && typeof firstName !== 'string') || (lastName !== undefined && typeof lastName !== 'string')) throw new AppError(400, 'VALIDATION_ERROR', 'Names must be strings.');
    return { email, password, firstName: firstName as string | undefined, lastName: lastName as string | undefined };
  }

  function setSession(response: Response, user: SessionUser, status = 200) {
    const payload = { sub: String(user._id), email: user.email };
    response.cookie('accessToken', createAccessToken(payload, config.jwtAccessSecret), { ...cookie, maxAge: 15 * 60 * 1000 });
    response.cookie('refreshToken', createRefreshToken(payload, config.jwtRefreshSecret), { ...cookie, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return successResponse(response, { user: { id: payload.sub, email: user.email, firstName: user.firstName, lastName: user.lastName } }, status);
  }

  router.post('/register', asyncHandler(async (request, response) => {
    const input = validate(request.body);
    if (!input.firstName || !input.lastName) throw new AppError(400, 'VALIDATION_ERROR', 'First and last names are required.');
    setSession(response, await register({ ...input, firstName: input.firstName, lastName: input.lastName }), 201);
  }));

  router.post('/login', asyncHandler(async (request, response) => {
    const input = validate(request.body);
    setSession(response, await login(input));
  }));

  router.post('/refresh', (request, response, next) => {
    const token = request.cookies?.refreshToken;
    if (typeof token !== 'string') return next(new AppError(401, 'UNAUTHORIZED', 'Authentication is required.'));
    try {
      const payload = verifyRefreshToken(token, config.jwtRefreshSecret);
      response.cookie('accessToken', createAccessToken(payload, config.jwtAccessSecret), { ...cookie, maxAge: 15 * 60 * 1000 });
      return successResponse(response, { message: 'Access token refreshed.' });
    } catch {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication is invalid or expired.'));
    }
  });

  router.post('/logout', (_request, response) => {
    response.clearCookie('accessToken', cookie);
    response.clearCookie('refreshToken', cookie);
    successResponse(response, { message: 'Logged out.' });
  });

  router.get('/me', authenticate(config), (request: AuthenticatedRequest, response) => {
    if (!request.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    successResponse(response, { user: request.user });
  });

  return router;
}
