import type { Request, Response } from 'express';

export function getHealth(_request: Request, response: Response): void {
  // Keep this established operational contract intentionally minimal.
  response.status(200).json({ status: 'ok' });
}
