import { Router, Response } from 'express';
import { pool } from '../config/db.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/response.js';


const router = Router();

// 1. GET /api/notifications - Get notifications for the authenticated user
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [rows]: any = await pool.query(
      `SELECT id, user_id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const formatted = rows.map((r: any) => ({
      id: String(r.id),
      userId: r.user_id,
      title: r.title,
      message: r.message,
      type: r.type?.toLowerCase() || 'info',
      read: Boolean(r.is_read),
      isRead: Boolean(r.is_read),
      createdAt: r.created_at,
    }));

    return sendSuccess(res, formatted, 200, 'Notifications retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return sendError(res, 'Failed to fetch notifications', 500);
  }
});

// 2. PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    return sendSuccess(res, { success: true }, 200, 'All notifications marked as read');
  } catch (error: any) {
    console.error('Error marking all notifications read:', error);
    return sendError(res, 'Failed to update notifications', 500);
  }
});

// 3. PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify ownership
    const [rows]: any = await pool.query(
      'SELECT id, user_id FROM notifications WHERE id = ?',
      [id]
    );

    if (!rows || rows.length === 0) {
      return sendError(res, 'Notification not found', 404);
    }

    if (rows[0].user_id !== userId) {
      return sendError(res, 'Forbidden: You cannot modify another user\'s notification', 403);
    }

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );

    return sendSuccess(res, { id, read: true }, 200, 'Notification marked as read');
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    return sendError(res, 'Failed to update notification', 500);
  }
});

export default router;
