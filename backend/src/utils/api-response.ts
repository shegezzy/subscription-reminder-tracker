import type { Response } from 'express';
import type { AppError } from './app-error.js';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function successResponse<T>(response: Response, data: T, status = 200): Response<ApiSuccess<T>> {
  return response.status(status).json({ success: true, data });
}

export function errorResponse(response: Response, error: AppError): Response<ApiFailure> {
  return response.status(error.statusCode).json({
    success: false,
    error: { code: error.code, message: error.message },
  });
}
