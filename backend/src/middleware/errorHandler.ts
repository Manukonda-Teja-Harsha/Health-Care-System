import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Unhandled server error:', err?.message || err);

  const statusCode = err?.statusCode || err?.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err?.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message,
  });
}
