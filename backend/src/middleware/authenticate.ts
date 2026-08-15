import type { NextFunction, Response } from 'express';
import type { AuthConfig, AuthenticatedRequest } from '../types/auth.js';
import { AppError } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/auth-tokens.js';

export function authenticate(config: AuthConfig) {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
    const token = request.cookies?.accessToken;
    if (typeof token !== 'string') return next(new AppError(401, 'UNAUTHORIZED', 'Authentication is required.'));
    try {
      const payload = verifyAccessToken(token, config.jwtAccessSecret);
      request.user = { id: payload.sub, email: payload.email };
      next();
    } catch { next(new AppError(401, 'UNAUTHORIZED', 'Authentication is invalid or expired.')); }
  };
}
