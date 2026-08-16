import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload { sub: string; email: string; }
function createToken(payload: TokenPayload, secret: string, expiresIn: NonNullable<SignOptions['expiresIn']>): string {
  return jwt.sign({ sub: payload.sub, email: payload.email }, secret, { expiresIn });
}

export const createAccessToken = (payload: TokenPayload, secret: string): string => createToken(payload, secret, '15m');
export const createRefreshToken = (payload: TokenPayload, secret: string): string => createToken(payload, secret, '7d');
function verifyToken(token: string, secret: string): TokenPayload {
  const result = jwt.verify(token, secret);
  if (typeof result === 'string' || !result.sub || !result.email) throw new jwt.JsonWebTokenError('Invalid token payload');
  return result as TokenPayload;
}

export const verifyAccessToken = verifyToken;
export const verifyRefreshToken = verifyToken;
