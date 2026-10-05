import { Router, Response } from 'express';
import { pool } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// 1. GET /api/patient/me - Get current logged-in patient profile
router.get('/me', requireAuth, requireRole('PATIENT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [rows]: any = await pool.query(
      `SELECT 
        p.id as patient_id,
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.allergies,
        p.emergency_contact,
        p.address,
        p.insurance_provider,
        p.insurance_number,
        p.created_at,
        p.updated_at
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      WHERE u.id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return sendError(res, 'Patient profile not found.', 404);
    }

    const row = rows[0];

    const data = {
      id: row.patient_id ? String(row.patient_id) : String(row.user_id),
      patientId: row.patient_id,
      userId: row.user_id,
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().slice(0, 10) : '',
      gender: row.gender || '',
      bloodGroup: row.blood_group || '',
      allergies: row.allergies || '',
      emergencyContact: row.emergency_contact || '',
      address: row.address || '',
      insuranceProvider: row.insurance_provider || '',
      insuranceNumber: row.insurance_number || '',
    };

    return sendSuccess(res, data, 200, 'Patient profile retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    return sendError(res, 'Unable to load profile', 500);
  }
});

// 2. PUT /api/patient/me - Update logged-in patient's own profile
router.put('/me', requireAuth, requireRole('PATIENT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, phone, dateOfBirth, gender, bloodGroup, allergies, emergencyContact, address } = req.body;

    // 1. Update user basic info (name, phone)
    if (name !== undefined || phone !== undefined) {
      const updates: string[] = [];
      const values: any[] = [];
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name.trim());
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone.trim());
      }
      values.push(userId);

      if (updates.length > 0) {
        await pool.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }
    }

    // 2. Ensure patient profile row exists
    const [patientRows]: any = await pool.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patientRows.length === 0) {
      await pool.query(
        'INSERT INTO patients (user_id) VALUES (?)',
        [userId]
      );
    }

    // 3. Update patient profile specific fields
    const patientUpdates: string[] = [];
    const patientValues: any[] = [];

    if (dateOfBirth !== undefined) {
      patientUpdates.push('date_of_birth = ?');
      patientValues.push(dateOfBirth ? dateOfBirth.slice(0, 10) : null);
    }
    if (gender !== undefined) {
      patientUpdates.push('gender = ?');
      patientValues.push(gender || null);
    }
    if (bloodGroup !== undefined) {
      patientUpdates.push('blood_group = ?');
      patientValues.push(bloodGroup || null);
    }
    if (allergies !== undefined) {
      patientUpdates.push('allergies = ?');
      patientValues.push(allergies || null);
    }
    if (emergencyContact !== undefined) {
      patientUpdates.push('emergency_contact = ?');
      patientValues.push(emergencyContact || null);
    }
    if (address !== undefined) {
      patientUpdates.push('address = ?');
      patientValues.push(address || null);
    }

    if (patientUpdates.length > 0) {
      patientValues.push(userId);
      await pool.query(
        `UPDATE patients SET ${patientUpdates.join(', ')} WHERE user_id = ?`,
        patientValues
      );
    }

    // 4. Return updated profile
    const [updatedRows]: any = await pool.query(
      `SELECT 
        p.id as patient_id,
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.allergies,
        p.emergency_contact,
        p.address,
        p.insurance_provider,
        p.insurance_number
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      WHERE u.id = ?`,
      [userId]
    );

    const row = updatedRows[0];
    const data = {
      id: row.patient_id ? String(row.patient_id) : String(row.user_id),
      patientId: row.patient_id,
      userId: row.user_id,
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().slice(0, 10) : '',
      gender: row.gender || '',
      bloodGroup: row.blood_group || '',
      allergies: row.allergies || '',
      emergencyContact: row.emergency_contact || '',
      address: row.address || '',
      insuranceProvider: row.insurance_provider || '',
      insuranceNumber: row.insurance_number || '',
    };

    return sendSuccess(res, data, 200, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Error updating patient profile:', error);
    return sendError(res, 'Unable to update profile', 500);
  }
});

// 3. GET /api/patient/records - Get logged-in patient's medical records
router.get('/records', requireAuth, requireRole('PATIENT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get patient ID
    const [patientRows]: any = await pool.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (!patientRows || patientRows.length === 0) {
      return sendSuccess(res, [], 200, 'No records found');
    }

    const patientId = patientRows[0].id;

    const [rows]: any = await pool.query(
      `SELECT 
        mr.id,
        mr.patient_id,
        mr.doctor_id,
        mr.record_type,
        mr.title,
        mr.description,
        mr.file_url,
        mr.record_date,
        mr.created_at,
        u.name as doctor_name,
        d.specialization as doctor_specialty
      FROM medical_records mr
      LEFT JOIN doctors d ON mr.doctor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE mr.patient_id = ?
      ORDER BY mr.record_date DESC, mr.created_at DESC`,
      [patientId]
    );

    const records = rows.map((r: any) => {
      const typeLabel = r.record_type === 'DIAGNOSIS' ? 'Diagnosis'
        : r.record_type === 'CONSULTATION' ? 'Consultation'
        : r.record_type === 'DOCUMENT' ? 'Document'
        : 'Note';

      let formattedDate = '';
      if (r.record_date) {
        try {
          formattedDate = new Date(r.record_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          formattedDate = String(r.record_date);
        }
      }

      return {
        id: String(r.id),
        type: typeLabel,
        rawType: r.record_type,
        title: r.title,
        description: r.description || '',
        date: formattedDate,
        rawDate: r.record_date ? new Date(r.record_date).toISOString().slice(0, 10) : '',
        doctor: r.doctor_name || 'System',
        doctorId: r.doctor_id ? String(r.doctor_id) : null,
        fileUrl: r.file_url || null,
      };
    });

    return sendSuccess(res, records, 200, 'Medical records retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching medical records:', error);
    return sendError(res, 'Unable to load records', 500);
  }
});

// 4. GET /api/patient/prescriptions - Get logged-in patient's prescriptions
router.get('/prescriptions', requireAuth, requireRole('PATIENT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get patient ID
    const [patientRows]: any = await pool.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (!patientRows || patientRows.length === 0) {
      return sendSuccess(res, [], 200, 'No prescriptions found');
    }

    const patientId = patientRows[0].id;

    // Query prescriptions joined with prescription_items, doctors, and doctor's user
    const [rows]: any = await pool.query(
      `SELECT 
        p.id as prescription_id,
        p.appointment_id,
        p.patient_id,
        p.doctor_id,
        p.diagnosis,
        p.notes,
        p.created_at,
        pi.id as item_id,
        pi.medication,
        pi.dosage,
        pi.frequency,
        pi.duration,
        pi.instructions,
        u.name as doctor_name,
        d.specialization as doctor_specialty
      FROM prescriptions p
      LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
      LEFT JOIN doctors d ON p.doctor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC`,
      [patientId]
    );

    // Flatten / map prescriptions
    const list: any[] = [];
    rows.forEach((r: any) => {
      const createdDate = new Date(r.created_at);
      const startDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      // Calculate approximate end date based on duration or default 30 days
      const endDateObj = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const endDate = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      list.push({
        id: r.item_id ? `pi_${r.item_id}` : `pr_${r.prescription_id}`,
        prescriptionId: String(r.prescription_id),
        medicine: r.medication || r.diagnosis || 'Prescription',
        dosage: r.dosage || 'As directed',
        frequency: r.frequency || 'Daily',
        duration: r.duration || '30 days',
        instructions: r.instructions || r.notes || '',
        startDate,
        endDate,
        status: 'Active',
        takenToday: false,
        doctor: {
          id: r.doctor_id ? String(r.doctor_id) : 'd1',
          name: r.doctor_name || 'Dr. Sarah Jenkins',
          specialty: r.doctor_specialty || 'General Physician',
        },
        doctorId: r.doctor_id ? String(r.doctor_id) : 'd1',
      });
    });

    return sendSuccess(res, list, 200, 'Prescriptions retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error);
    return sendError(res, 'Unable to load prescriptions', 500);
  }
});

// 5. GET /api/patient/labs - Get logged-in patient's lab reports
router.get('/labs', requireAuth, requireRole('PATIENT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get patient ID
    const [patientRows]: any = await pool.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (!patientRows || patientRows.length === 0) {
      return sendSuccess(res, [], 200, 'No lab reports found');
    }

    const patientId = patientRows[0].id;

    const [rows]: any = await pool.query(
      `SELECT 
        lr.id,
        lr.patient_id,
        lr.doctor_id,
        lr.appointment_id,
        lr.test_name,
        lr.result,
        lr.status,
        lr.report_date,
        lr.notes,
        lr.file_url,
        lr.created_at,
        u.name as doctor_name
      FROM lab_reports lr
      LEFT JOIN doctors d ON lr.doctor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE lr.patient_id = ?
      ORDER BY lr.report_date DESC, lr.created_at DESC`,
      [patientId]
    );

    const reports = rows.map((r: any) => {
      let formattedDate = '';
      if (r.report_date) {
        try {
          formattedDate = new Date(r.report_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          formattedDate = String(r.report_date);
        }
      }

      const statusMap: Record<string, string> = {
        'NORMAL': 'Normal',
        'ATTENTION': 'Attention',
        'CRITICAL': 'Critical',
        'PENDING': 'Pending',
      };

      return {
        id: String(r.id),
        name: r.test_name,
        result: r.result || '',
        status: statusMap[r.status] || 'Normal',
        rawStatus: r.status,
        date: formattedDate,
        rawDate: r.report_date ? new Date(r.report_date).toISOString().slice(0, 10) : '',
        lab: r.notes || 'Central Diagnostics',
        doctor: r.doctor_name || 'System',
        fileUrl: r.file_url || null,
      };
    });

    return sendSuccess(res, reports, 200, 'Lab reports retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching lab reports:', error);
    return sendError(res, 'Unable to load lab reports', 500);
  }
});

export default router;
