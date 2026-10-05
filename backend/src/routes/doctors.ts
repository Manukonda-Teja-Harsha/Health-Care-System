import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// GET /api/doctors - Retrieve all doctors from MySQL
router.get('/', async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        d.id,
        u.name,
        d.specialization,
        d.specialization AS specialty,
        dept.name AS department,
        d.qualification,
        d.qualification AS qualifications,
        d.experience_years,
        d.experience_years AS experience,
        d.bio,
        d.languages,
        d.consultation_fee,
        d.consultation_fee AS fee,
        d.hospital,
        d.floor,
        d.room,
        d.rating,
        d.review_count,
        d.profile_image,
        d.profile_image AS avatar
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON d.department_id = dept.id
      ORDER BY d.id ASC
    `;

    const [rows]: any = await pool.query(query);

    return sendSuccess(res, rows);
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return sendError(res, 'Failed to fetch doctors from database.', 500);
  }
});

// GET /api/doctors/:id - Retrieve single doctor by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        d.id,
        u.name,
        u.email,
        d.specialization,
        d.specialization AS specialty,
        dept.name AS department,
        d.qualification,
        d.qualification AS qualifications,
        d.experience_years,
        d.experience_years AS experience,
        d.bio,
        d.languages,
        d.consultation_fee,
        d.consultation_fee AS fee,
        d.hospital,
        d.floor,
        d.room,
        d.rating,
        d.review_count,
        d.profile_image,
        d.profile_image AS avatar
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON d.department_id = dept.id
      WHERE d.id = ?
    `;

    const [rows]: any = await pool.query(query, [id]);

    if (!rows || rows.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    return sendSuccess(res, rows[0]);
  } catch (error: any) {
    console.error('Error fetching doctor by id:', error);
    return sendError(res, 'Failed to fetch doctor details.', 500);
  }
});

// GET /api/doctors/:id/availability - Retrieve doctor availability
router.get('/:id/availability', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        consultation_type
      FROM doctor_availability
      WHERE doctor_id = ?
      ORDER BY FIELD(day_of_week, 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'), start_time ASC
    `;

    const [rows]: any = await pool.query(query, [id]);

    return sendSuccess(res, rows);
  } catch (error: any) {
    console.error('Error fetching doctor availability:', error);
    return sendError(res, 'Failed to fetch doctor availability.', 500);
  }
});

export default router;
