import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return sendError(res, 'Full name is required and must be at least 2 characters.', 400);
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return sendError(res, 'A valid email address is required.', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return sendError(res, 'Password is required and must be at least 6 characters long.', 400);
    }

    // Public registration restriction: only patients can register publicly
    if (role && role.toString().toUpperCase() !== 'PATIENT') {
      return sendError(
        res,
        'Public registration is only available for Patient accounts. Doctor and Admin accounts are provisioned administratively.',
        403
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 2. Check if email already exists
    const [existingRows]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existingRows && existingRows.length > 0) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    // 3. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Atomic transaction: create user and patient profile
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult]: any = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [cleanName, cleanEmail, passwordHash, 'PATIENT']
      );

      const userId = userResult.insertId;

      await connection.query(
        'INSERT INTO patients (user_id) VALUES (?)',
        [userId]
      );

      await connection.commit();

      // 5. Generate JWT token for immediate authenticated session
      const token = generateToken({
        id: userId,
        email: cleanEmail,
        role: 'PATIENT',
        name: cleanName,
      });

      return sendSuccess(
        res,
        {
          token,
          user: {
            id: userId,
            name: cleanName,
            email: cleanEmail,
            role: 'patient',
          },
        },
        201,
        'Patient account registered successfully.'
      );
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return sendError(res, 'An error occurred while creating your account. Please try again.', 500);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return sendError(res, 'Both email and password are required.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Fetch user by email
    const [rows]: any = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (!rows || rows.length === 0) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const user = rows[0];

    // 2. Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // 3. Verify role if client explicitly selected one
    if (role && role.toString().toUpperCase() !== user.role.toUpperCase()) {
      return sendError(
        res,
        `Role mismatch: This account is registered as ${user.role}. Please select the correct role to sign in.`,
        403
      );
    }

    // 4. Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
        },
      },
      200,
      'Login successful.'
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, 'An error occurred during authentication. Please try again.', 500);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthenticated.', 401);
    }

    const [rows]: any = await pool.query(
      'SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!rows || rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    const user = rows[0];

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        phone: user.phone,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    return sendError(res, 'Failed to fetch current user.', 500);
  }
}

export function logout(_req: Request, res: Response) {
  return sendSuccess(res, null, 200, 'Logged out successfully.');
}
