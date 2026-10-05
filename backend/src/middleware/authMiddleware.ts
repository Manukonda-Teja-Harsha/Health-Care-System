import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { pool } from '../config/db.js';
import { sendError } from '../utils/response.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No authentication token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Access denied. Malformed token.', 401);
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Authentication token has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    // Verify user still exists in the database
    const [rows]: any = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return sendError(res, 'User account no longer exists.', 401);
    }

    const dbUser = rows[0];
    req.user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendError(res, 'Authentication check failed.', 500);
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const userRole = req.user.role.toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return sendError(
        res,
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}.`,
        403
      );
    }

    next();
  };
}
