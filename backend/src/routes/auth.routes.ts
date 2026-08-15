import { Router } from 'express';
import { login, register } from '../services/auth.service.js';
import type { AuthConfig, AuthenticatedRequest } from '../types/auth.js';
import { AppError } from '../utils/app-error.js';
import { createAccessToken, createRefreshToken } from '../utils/auth-tokens.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate } from '../middleware/authenticate.js';
import { successResponse } from '../utils/api-response.js';

export function createAuthRouter(config: AuthConfig): Router {
  const router = Router();
  const cookie = { httpOnly: true, sameSite: 'lax' as const, secure: config.nodeEnv === 'production', path: '/' };
  const validate = (body: unknown): { email: string; password: string; firstName?: string | undefined; lastName?: string | undefined } => {
    if (!body || typeof body !== 'object') throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request body.');
    const { email, password, firstName, lastName } = body as Record<string, unknown>;
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 12) throw new AppError(400, 'VALIDATION_ERROR', 'Provide a valid email and password of at least 12 characters.');
    if ((firstName !== undefined && typeof firstName !== 'string') || (lastName !== undefined && typeof lastName !== 'string')) throw new AppError(400, 'VALIDATION_ERROR', 'Names must be strings.');
    return { email, password, firstName: firstName as string | undefined, lastName: lastName as string | undefined };
  };
  const sendSession = (response: import('express').Response, user: { _id: unknown; email: string; firstName: string; lastName: string }) => {
    const payload = { sub: String(user._id), email: user.email };
    response.cookie('accessToken', createAccessToken(payload, config.jwtAccessSecret), { ...cookie, maxAge: 15 * 60 * 1000 });
    response.cookie('refreshToken', createRefreshToken(payload, config.jwtRefreshSecret), { ...cookie, maxAge: 7 * 24 * 60 * 60 * 1000 });
    successResponse(response, { user: { id: payload.sub, email: user.email, firstName: user.firstName, lastName: user.lastName } }, 201);
  };
  router.post('/register', asyncHandler(async (request, response) => { const input = validate(request.body); if (!input.firstName || !input.lastName) throw new AppError(400, 'VALIDATION_ERROR', 'First and last names are required.'); sendSession(response, await register({ ...input, firstName: input.firstName, lastName: input.lastName })); }));
  router.post('/login', asyncHandler(async (request, response) => { const input = validate(request.body); sendSession(response, await login(input)); }));
  router.post('/logout', (_request, response) => { response.clearCookie('accessToken', cookie); response.clearCookie('refreshToken', cookie); successResponse(response, { message: 'Logged out.' }); });
  router.get('/me', authenticate(config), (request: AuthenticatedRequest, response) => { if (!request.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.'); successResponse(response, { user: request.user }); });
  return router;
}
