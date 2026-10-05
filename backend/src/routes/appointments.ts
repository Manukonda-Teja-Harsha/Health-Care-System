import { Router, Response } from 'express';
import { pool } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

function formatTimeToSql(timeStr: string): string {
  if (!timeStr) return '09:00:00';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const seconds = match[3] || '00';
    const meridiem = match[4]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
  }
  return timeStr.trim();
}

function formatSqlTimeToAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${parts[1]} ${ampm}`;
}

// 1. POST /api/appointments - Book a new appointment (Patient only)
router.post('/', requireAuth, requireRole('PATIENT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { doctorId, appointmentDate, startTime, endTime, appointmentType, reason } = req.body;

    // 1. Validate input
    if (!doctorId || !appointmentDate || !startTime) {
      return sendError(res, 'Doctor ID, appointment date, and start time are required.', 400);
    }

    // 2. Fetch patient record for this user
    const [patientRows]: any = await pool.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (!patientRows || patientRows.length === 0) {
      return sendError(res, 'Patient profile not found for this account.', 404);
    }

    const patientId = patientRows[0].id;

    // 3. Verify doctor exists
    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE id = ?',
      [doctorId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendError(res, 'Doctor not found.', 404);
    }

    const cleanDate = appointmentDate.toString().slice(0, 10);
    const sqlStartTime = formatTimeToSql(startTime);
    const sqlEndTime = endTime ? formatTimeToSql(endTime) : null;
    const normalizedType = appointmentType?.toString().toUpperCase().includes('VIDEO') ? 'VIDEO' : 'IN_PERSON';

    // 4. Double-booking check
    const [conflictRows]: any = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? 
         AND appointment_date = ? 
         AND start_time = ? 
         AND status != 'CANCELLED'`,
      [doctorId, cleanDate, sqlStartTime]
    );

    if (conflictRows && conflictRows.length > 0) {
      return sendError(res, 'This appointment slot is already booked', 409);
    }

    // 5. Insert appointment
    const [result]: any = await pool.query(
      `INSERT INTO appointments 
        (patient_id, doctor_id, appointment_date, start_time, end_time, appointment_type, status, reason)
       VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
      [patientId, doctorId, cleanDate, sqlStartTime, sqlEndTime, normalizedType, reason || 'General Consultation']
    );

    const newAppointmentId = result.insertId;

    // 6. Return populated appointment
    const [rows]: any = await pool.query(
      `SELECT 
        a.id, a.patient_id, a.doctor_id, 
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date, 
        a.start_time, a.end_time, a.appointment_type, a.status, a.reason,
        u.name AS doctor_name, d.specialization AS doctor_specialty, dept.name AS department
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       JOIN departments dept ON d.department_id = dept.id
       WHERE a.id = ?`,
      [newAppointmentId]
    );

    const apt = rows[0];

    // Create notifications for patient and doctor
    try {
      const patientName = req.user!.name || 'Patient';
      const [docUserRows]: any = await pool.query('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
      const doctorUserId = docUserRows[0]?.user_id;
      
      // Notify doctor
      if (doctorUserId) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, 'New Appointment', ?, 'APPOINTMENT')`,
          [doctorUserId, `New appointment booked by ${patientName} on ${cleanDate} at ${formatSqlTimeToAmPm(sqlStartTime)}.`]
        );
      }


      // Notify patient
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Appointment Confirmed', ?, 'APPOINTMENT')`,
        [userId, `Your appointment with Dr. ${apt.doctor_name} on ${cleanDate} at ${formatSqlTimeToAmPm(sqlStartTime)} has been booked.`]
      );
    } catch (notifErr) {
      console.error('Failed to create booking notifications:', notifErr);
    }

    return sendSuccess(res, {
      ...apt,
      date: apt.appointment_date,
      time: formatSqlTimeToAmPm(apt.start_time),
      type: apt.appointment_type === 'VIDEO' ? 'Video Consultation' : 'In-Person',
      status: apt.status === 'CONFIRMED' ? 'Upcoming' : apt.status,
    }, 201, 'Appointment booked successfully.');
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return sendError(res, 'An error occurred while booking the appointment.', 500);
  }
});


// 2. GET /api/appointments/my - Get patient's appointments (Patient only)
router.get('/my', requireAuth, requireRole('PATIENT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [patientRows]: any = await pool.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (!patientRows || patientRows.length === 0) {
      return sendSuccess(res, []);
    }

    const patientId = patientRows[0].id;

    const [rows]: any = await pool.query(
      `SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date,
        a.start_time,
        a.end_time,
        a.appointment_type,
        a.status,
        a.reason,
        a.created_at,
        u.name AS doctor_name,
        d.specialization AS doctor_specialty,
        dept.name AS department,
        d.hospital,
        d.floor,
        d.room,
        d.profile_image AS doctor_image
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON d.department_id = dept.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [patientId]
    );

    const formatted = rows.map((apt: any) => ({
      id: String(apt.id),
      patientId: String(apt.patient_id),
      doctorId: String(apt.doctor_id),
      date: apt.date,
      time: formatSqlTimeToAmPm(apt.start_time),
      type: apt.appointment_type === 'VIDEO' ? 'Video Consultation' : 'In-Person',
      status: apt.status === 'CONFIRMED' || apt.status === 'PENDING' ? 'Upcoming' : apt.status === 'COMPLETED' ? 'Completed' : 'Cancelled',
      rawStatus: apt.status,
      reason: apt.reason,
      doctor: {
        id: String(apt.doctor_id),
        name: apt.doctor_name,
        specialty: apt.doctor_specialty,
        department: apt.department,
        hospital: apt.hospital,
        floor: apt.floor,
        room: apt.room,
        image: apt.doctor_image || '',
      }
    }));

    return sendSuccess(res, formatted);
  } catch (error: any) {
    console.error('Error fetching patient appointments:', error);
    return sendError(res, 'Failed to fetch appointments.', 500);
  }
});

// 3. GET /api/appointments/doctor - Get doctor's appointments (Doctor only)
router.get('/doctor', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendSuccess(res, []);
    }

    const doctorId = doctorRows[0].id;

    const [rows]: any = await pool.query(
      `SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date,
        a.start_time,
        a.end_time,
        a.appointment_type,
        a.status,
        a.reason,
        a.created_at,
        u.name AS patient_name,
        u.email AS patient_email,
        u.phone AS patient_phone,
        p.date_of_birth,
        p.gender,
        p.blood_group
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [doctorId]
    );

    const formatted = rows.map((apt: any) => ({
      id: String(apt.id),
      patientId: String(apt.patient_id),
      doctorId: String(apt.doctor_id),
      date: apt.date,
      time: formatSqlTimeToAmPm(apt.start_time),
      type: apt.appointment_type === 'VIDEO' ? 'Video Consultation' : 'In-Person',
      status: apt.status === 'CONFIRMED' || apt.status === 'PENDING' ? 'Upcoming' : apt.status === 'COMPLETED' ? 'Completed' : 'Cancelled',
      rawStatus: apt.status,
      reason: apt.reason,
      patient: {
        id: String(apt.patient_id),
        name: apt.patient_name,
        email: apt.patient_email,
        phone: apt.patient_phone || '',
        dateOfBirth: apt.date_of_birth,
        gender: apt.gender,
        bloodGroup: apt.blood_group,
      }
    }));

    return sendSuccess(res, formatted);
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error);
    return sendError(res, 'Failed to fetch doctor appointments.', 500);
  }
});

// 4. PUT /api/appointments/:id/cancel - Cancel appointment
router.put('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role.toUpperCase();

    // Check appointment and ownership
    const [rows]: any = await pool.query(
      `SELECT a.id, a.status, p.user_id AS patient_user_id, d.user_id AS doctor_user_id
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return sendError(res, 'Appointment not found.', 404);
    }

    const apt = rows[0];

    // Authorization: Must be the patient who booked it, or the doctor assigned to it, or ADMIN
    const isOwner = (userRole === 'PATIENT' && apt.patient_user_id === userId) ||
                    (userRole === 'DOCTOR' && apt.doctor_user_id === userId) ||
                    userRole === 'ADMIN';

    if (!isOwner) {
      return sendError(res, 'You are not authorized to cancel this appointment.', 403);
    }

    if (apt.status === 'CANCELLED') {
      return sendError(res, 'This appointment is already cancelled.', 400);
    }

    await pool.query(
      "UPDATE appointments SET status = 'CANCELLED' WHERE id = ?",
      [id]
    );

    // Automatic notifications for cancellation
    try {
      // Notify doctor
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Appointment Cancelled', ?, 'APPOINTMENT')`,
        [apt.doctor_user_id, `Appointment #${id} has been cancelled.`]
      );
      // Notify patient
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Appointment Cancelled', ?, 'APPOINTMENT')`,
        [apt.patient_user_id, `Your appointment #${id} has been cancelled.`]
      );
    } catch (notifErr) {
      console.error('Failed to create cancellation notifications:', notifErr);
    }

    return sendSuccess(res, { id, status: 'Cancelled' }, 200, 'Appointment cancelled successfully.');
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    return sendError(res, 'Failed to cancel appointment.', 500);
  }
});

// 5. PUT /api/appointments/:id/reschedule - Reschedule appointment (Patient only)
router.put('/:id/reschedule', requireAuth, requireRole('PATIENT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { appointmentDate, startTime, endTime } = req.body;

    if (!appointmentDate || !startTime) {
      return sendError(res, 'New appointment date and start time are required.', 400);
    }

    // Check appointment and patient ownership
    const [rows]: any = await pool.query(
      `SELECT a.id, a.doctor_id, a.status, p.user_id AS patient_user_id, d.user_id AS doctor_user_id, u.name as doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE a.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return sendError(res, 'Appointment not found.', 404);
    }

    const apt = rows[0];

    if (apt.patient_user_id !== userId) {
      return sendError(res, 'You are not authorized to reschedule this appointment.', 403);
    }

    if (apt.status === 'CANCELLED') {
      return sendError(res, 'Cannot reschedule a cancelled appointment.', 400);
    }

    const cleanDate = appointmentDate.toString().slice(0, 10);
    const sqlStartTime = formatTimeToSql(startTime);
    const sqlEndTime = endTime ? formatTimeToSql(endTime) : null;

    // Check if new slot is already booked
    const [conflictRows]: any = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? 
         AND appointment_date = ? 
         AND start_time = ? 
         AND status != 'CANCELLED'
         AND id != ?`,
      [apt.doctor_id, cleanDate, sqlStartTime, id]
    );

    if (conflictRows && conflictRows.length > 0) {
      return sendError(res, 'This appointment slot is already booked', 409);
    }

    await pool.query(
      `UPDATE appointments 
       SET appointment_date = ?, start_time = ?, end_time = ?, status = 'CONFIRMED'
       WHERE id = ?`,
      [cleanDate, sqlStartTime, sqlEndTime, id]
    );

    // Automatic notifications for reschedule
    try {
      const patientName = req.user!.name || 'Patient';
      // Notify doctor
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Appointment Rescheduled', ?, 'APPOINTMENT')`,
        [apt.doctor_user_id, `Appointment #${id} with ${patientName} was rescheduled to ${cleanDate} at ${formatSqlTimeToAmPm(sqlStartTime)}.`]
      );
      // Notify patient
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Appointment Rescheduled', ?, 'APPOINTMENT')`,
        [userId, `Your appointment with Dr. ${apt.doctor_name} has been rescheduled to ${cleanDate} at ${formatSqlTimeToAmPm(sqlStartTime)}.`]
      );
    } catch (notifErr) {
      console.error('Failed to create reschedule notifications:', notifErr);
    }

    return sendSuccess(res, {
      id,
      date: cleanDate,
      time: formatSqlTimeToAmPm(sqlStartTime),
      status: 'Upcoming',
    }, 200, 'Appointment rescheduled successfully.');
  } catch (error: any) {
    console.error('Error rescheduling appointment:', error);
    return sendError(res, 'Failed to reschedule appointment.', 500);
  }
});


export default router;
