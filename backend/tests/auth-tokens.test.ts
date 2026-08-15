import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { createAccessToken, verifyAccessToken } from '../src/utils/auth-tokens.js';

const secret = 'a'.repeat(32);

describe('access tokens', () => {
  it('verifies a valid signed token', () => {
    const token = createAccessToken({ sub: 'user-id', email: 'user@example.com' }, secret);
    expect(verifyAccessToken(token, secret)).toMatchObject({ sub: 'user-id', email: 'user@example.com' });
  });

  it('rejects invalid and expired tokens', () => {
    expect(() => verifyAccessToken('invalid', secret)).toThrow();
    const expired = jwt.sign({ sub: 'user-id', email: 'user@example.com' }, secret, { expiresIn: -1 });
    expect(() => verifyAccessToken(expired, secret)).toThrow();
  });
});
