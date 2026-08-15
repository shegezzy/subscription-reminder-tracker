import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload { sub: string; email: string; }
export const createAccessToken = (payload: TokenPayload, secret: string): string => jwt.sign(payload, secret, { expiresIn: '15m' });
export const createRefreshToken = (payload: TokenPayload, secret: string): string => jwt.sign(payload, secret, { expiresIn: '7d' });
export function verifyAccessToken(token: string, secret: string): TokenPayload {
  const result = jwt.verify(token, secret);
  if (typeof result === 'string' || !result.sub || !result.email) throw new jwt.JsonWebTokenError('Invalid token payload');
  return result as TokenPayload;
}
