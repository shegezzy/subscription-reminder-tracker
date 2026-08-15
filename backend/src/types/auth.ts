import type { Request } from 'express';

export interface AuthenticatedUser { id: string; email: string; }
export interface AuthenticatedRequest extends Request { user?: AuthenticatedUser; }
export interface AuthConfig { jwtAccessSecret: string; jwtRefreshSecret: string; nodeEnv: 'development' | 'test' | 'production'; }
