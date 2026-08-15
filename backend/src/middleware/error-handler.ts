import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../utils/app-error.js';
import { errorResponse } from '../utils/api-response.js';

export const notFoundHandler: RequestHandler = (request, response) => {
  errorResponse(
    response,
    new AppError(404, 'NOT_FOUND', `Route ${request.method} ${request.path} was not found.`),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (response.headersSent) {
    return;
  }

  if (error instanceof AppError) {
    errorResponse(response, error);
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    errorResponse(response, new AppError(400, 'INVALID_JSON', 'Request body must be valid JSON.'));
    return;
  }

  console.error('Unhandled request error', error);
  errorResponse(response, new AppError(500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred.'));
};
