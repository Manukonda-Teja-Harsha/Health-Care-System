import { Router, Response } from 'express';
import { pool } from '../config/db.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/response.js';


const router = Router();

// Ensure all admin endpoints require ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

// 1. GET /api/admin/stats - Overview statistics
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [[usersCount]]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[patientsCount]]: any = await pool.query('SELECT COUNT(*) as count FROM patients');
    const [[doctorsCount]]: any = await pool.query('SELECT COUNT(*) as count FROM doctors');
    const [[appointmentsCount]]: any = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const [[upcomingAppts]]: any = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'CONFIRMED' OR status = 'PENDING'");
    const [[completedAppts]]: any = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'COMPLETED'");
    const [[cancelledAppts]]: any = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'CANCELLED'");
    const [[prescriptionsCount]]: any = await pool.query('SELECT COUNT(*) as count FROM prescriptions');
    const [[recordsCount]]: any = await pool.query('SELECT COUNT(*) as count FROM medical_records');
    const [[labsCount]]: any = await pool.query('SELECT COUNT(*) as count FROM lab_reports');

    const stats = {
      totalUsers: usersCount.count,
      totalPatients: patientsCount.count,
      totalDoctors: doctorsCount.count,
      totalAppointments: appointmentsCount.count,
      upcomingAppointments: upcomingAppts.count,
      completedAppointments: completedAppts.count,
      cancelledAppointments: cancelledAppts.count,
      totalPrescriptions: prescriptionsCount.count,
      totalMedicalRecords: recordsCount.count,
      totalLabReports: labsCount.count,
    };

    return sendSuccess(res, stats, 200, 'Admin statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching admin statistics:', error);
    return sendError(res, 'Failed to fetch admin statistics', 500);
  }
});

// 2. GET /api/admin/users - Get all users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, name, email, role, phone, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    const users = rows.map((u: any) => ({
      id: String(u.id),
      userId: u.id,
      name: u.name,
      email: u.email,
      role: u.role?.toLowerCase() || 'patient',
      rawRole: u.role,
      phone: u.phone || '',
      status: u.is_active ? 'Active' : 'Inactive',
      isActive: Boolean(u.is_active),
      createdAt: u.created_at,
      date: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));

    return sendSuccess(res, users, 200, 'Users retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return sendError(res, 'Failed to fetch users', 500);
  }
});

// 3. DELETE /api/admin/users/:id - Delete / Deactivate a user safely
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentAdminId = req.user!.id;
    const targetUserId = parseInt(String(req.params.id), 10);

    if (isNaN(targetUserId)) {
      return sendError(res, 'Invalid user ID', 400);
    }


    if (targetUserId === currentAdminId) {
      return sendError(res, 'Cannot delete or deactivate your own admin account', 400);
    }

    // Check if target user exists
    const [targetRows]: any = await pool.query(
      'SELECT id, role, is_active FROM users WHERE id = ?',
      [targetUserId]
    );

    if (!targetRows || targetRows.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user has associated medical history or appointments
    const [[patientRow]]: any = await pool.query('SELECT id FROM patients WHERE user_id = ?', [targetUserId]);
    const [[doctorRow]]: any = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [targetUserId]);

    let hasHistory = false;
    if (patientRow) {
      const [[ptAppts]]: any = await pool.query('SELECT COUNT(*) as c FROM appointments WHERE patient_id = ?', [patientRow.id]);
      if (ptAppts.c > 0) hasHistory = true;
    }
    if (doctorRow) {
      const [[docAppts]]: any = await pool.query('SELECT COUNT(*) as c FROM appointments WHERE doctor_id = ?', [doctorRow.id]);
      if (docAppts.c > 0) hasHistory = true;
    }

    if (hasHistory) {
      // Soft-delete/deactivate to preserve foreign key & medical history integrity
      await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [targetUserId]);
      return sendSuccess(res, { id: String(targetUserId), status: 'Deactivated' }, 200, 'User has active medical history; account deactivated successfully.');
    } else {
      // Safe to delete cleanly
      await pool.query('DELETE FROM users WHERE id = ?', [targetUserId]);
      return sendSuccess(res, { id: String(targetUserId), status: 'Deleted' }, 200, 'User deleted successfully.');
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return sendError(res, 'Failed to delete user', 500);
  }
});

// 4. GET /api/admin/doctors - Get all doctors with user and department info
router.get('/doctors', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT 
        d.id,
        d.user_id,
        d.specialization,
        d.qualification,
        d.experience_years as experience,
        d.bio,
        d.consultation_fee,
        d.hospital,
        d.floor,
        d.room,
        d.rating,
        d.review_count,
        d.profile_image,
        u.name,
        u.email,
        u.phone,
        u.is_active,
        dept.name as department_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      ORDER BY u.name ASC`
    );

    const doctors = rows.map((d: any) => ({
      id: String(d.id),
      doctorId: d.id,
      userId: d.user_id,
      name: d.name,
      email: d.email,
      phone: d.phone || '',
      specialization: d.specialization,
      specialty: d.specialization,
      department: d.department_name || d.specialization,
      qualification: d.qualification,
      experience: d.experience,
      about: d.bio,
      bio: d.bio,
      consultationFee: Number(d.consultation_fee),
      fee: Number(d.consultation_fee),
      hospital: d.hospital,
      floor: d.floor,
      room: d.room,
      rating: Number(d.rating),
      reviews: d.review_count,
      status: d.is_active ? 'Active' : 'Inactive',
      isActive: Boolean(d.is_active),
      profileImage: d.profile_image,
    }));

    return sendSuccess(res, doctors, 200, 'Admin doctors retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching admin doctors:', error);
    return sendError(res, 'Failed to fetch doctors', 500);
  }
});

// 5. PUT /api/admin/doctors/:id/status - Update doctor status (active/inactive)
router.put('/doctors/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doctorId = parseInt(String(req.params.id), 10);
    const { status } = req.body;

    if (isNaN(doctorId)) {
      return sendError(res, 'Invalid doctor ID', 400);
    }


    const [doctorRows]: any = await pool.query(
      'SELECT id, user_id FROM doctors WHERE id = ?',
      [doctorId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    const userId = doctorRows[0].user_id;
    const isActive = String(status).toLowerCase() === 'active' || status === true;

    await pool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, userId]
    );

    return sendSuccess(res, { id: String(doctorId), status: isActive ? 'Active' : 'Inactive' }, 200, 'Doctor status updated successfully');
  } catch (error: any) {
    console.error('Error updating doctor status:', error);
    return sendError(res, 'Failed to update doctor status', 500);
  }
});

// 6. GET /api/admin/appointments - Get all appointments in the system
router.get('/appointments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,
        a.start_time,
        a.end_time,
        a.appointment_type,
        a.status,
        a.reason,
        a.created_at,
        pu.name as patient_name,
        pu.email as patient_email,
        du.name as doctor_name,
        du.email as doctor_email,
        d.specialization as doctor_specialty
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      ORDER BY a.appointment_date DESC, a.start_time DESC`
    );

    const appointments = rows.map((a: any) => {
      let formattedTime = a.start_time;
      try {
        const [hours, minutes] = a.start_time.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        formattedTime = `${h12}:${minutes} ${ampm}`;
      } catch {
        // fallback to raw
      }

      const statusMap: Record<string, string> = {
        'CONFIRMED': 'Upcoming',
        'PENDING': 'Upcoming',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled',
      };

      return {
        id: String(a.id),
        patientId: String(a.patient_id),
        doctorId: String(a.doctor_id),
        patientName: a.patient_name,
        patientEmail: a.patient_email,
        doctorName: a.doctor_name,
        doctorEmail: a.doctor_email,
        doctorSpecialty: a.doctor_specialty,
        date: a.appointment_date,
        time: formattedTime,
        type: a.appointment_type === 'VIDEO' ? 'Video' : 'In-Person',
        status: statusMap[a.status] || a.status,
        rawStatus: a.status,
        reason: a.reason || 'General Consultation',
        createdAt: a.created_at,
      };
    });

    return sendSuccess(res, appointments, 200, 'Admin appointments retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching admin appointments:', error);
    return sendError(res, 'Failed to fetch appointments', 500);
  }
});

// 7. GET /api/admin/patients - Get all registered patients
router.get('/patients', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT 
        p.id as patient_id,
        p.user_id,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.allergies,
        p.emergency_contact,
        p.address,
        u.name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at,
        COUNT(a.id) as appointment_count
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN appointments a ON p.id = a.patient_id
      GROUP BY p.id, p.user_id, p.date_of_birth, p.gender, p.blood_group, p.allergies, p.emergency_contact, p.address, u.name, u.email, u.phone, u.is_active, u.created_at
      ORDER BY u.name ASC`
    );

    const patients = rows.map((p: any) => {
      let age = 30;
      if (p.date_of_birth) {
        const birthDate = new Date(p.date_of_birth);
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      return {
        id: String(p.patient_id),
        patientId: p.patient_id,
        userId: p.user_id,
        name: p.name,
        email: p.email,
        phone: p.phone || '',
        age,
        gender: p.gender === 'FEMALE' ? 'Female' : p.gender === 'MALE' ? 'Male' : 'Other',
        bloodGroup: p.blood_group || 'O+',
        allergies: p.allergies ? p.allergies.split(',').map((a: string) => a.trim()) : [],
        appointmentCount: Number(p.appointment_count),
        status: p.is_active ? 'Active' : 'Inactive',
        emergencyContact: p.emergency_contact || '',
        address: p.address || '',
      };
    });

    return sendSuccess(res, patients, 200, 'Admin patients retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching admin patients:', error);
    return sendError(res, 'Failed to fetch patients', 500);
  }
});

export default router;
