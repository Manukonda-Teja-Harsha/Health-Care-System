import { Router, Response } from 'express';
import { pool } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

function formatSqlTimeToAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${parts[1]} ${ampm}`;
}

// 1. GET /api/doctor/me - Get logged-in doctor profile
router.get('/me', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [rows]: any = await pool.query(
      `SELECT 
        d.id as doctor_id,
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        d.specialization,
        dept.name as department,
        d.qualification,
        d.experience_years as experience,
        d.bio,
        d.languages,
        d.consultation_fee,
        d.hospital,
        d.floor,
        d.room,
        d.rating,
        d.review_count,
        d.profile_image
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE u.id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return sendError(res, 'Doctor profile not found', 404);
    }

    const row = rows[0];
    const data = {
      id: row.doctor_id,
      userId: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      specialization: row.specialization,
      department: row.department || '',
      qualification: row.qualification || '',
      experience: `${row.experience} years`,
      bio: row.bio || '',
      languages: row.languages ? row.languages.split(',').map((l: string) => l.trim()) : [],
      consultationFee: parseFloat(row.consultation_fee),
      hospital: row.hospital,
      floor: row.floor || '',
      room: row.room || '',
      rating: parseFloat(row.rating),
      reviewCount: row.review_count,
      profileImage: row.profile_image || '',
    };

    return sendSuccess(res, data, 200, 'Doctor profile retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching doctor profile:', error);
    return sendError(res, 'Unable to load doctor profile', 500);
  }
});

// 2. GET /api/doctor/appointments - Get logged-in doctor appointments
router.get('/appointments', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendSuccess(res, [], 200);
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
        p.blood_group,
        p.allergies
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
      reason: apt.reason || 'General Consultation',
      patient: {
        id: String(apt.patient_id),
        name: apt.patient_name,
        email: apt.patient_email,
        phone: apt.patient_phone || '',
        dateOfBirth: apt.date_of_birth,
        gender: apt.gender || '',
        bloodGroup: apt.blood_group || '',
        allergies: apt.allergies ? apt.allergies.split(',').map((a: string) => a.trim()) : [],
      }
    }));

    return sendSuccess(res, formatted, 200, 'Doctor appointments retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error);
    return sendError(res, 'Failed to fetch doctor appointments', 500);
  }
});

// 3. GET /api/doctor/patients - Get distinct patients for this doctor
router.get('/patients', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendSuccess(res, [], 200);
    }

    const doctorId = doctorRows[0].id;

    const [rows]: any = await pool.query(
      `SELECT DISTINCT
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
        p.address
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.doctor_id = ?
      ORDER BY u.name ASC`,
      [doctorId]
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
        emergencyContact: p.emergency_contact || '',
        address: p.address || '',
      };
    });

    return sendSuccess(res, patients, 200, 'Doctor patients retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching doctor patients:', error);
    return sendError(res, 'Failed to fetch doctor patients', 500);
  }
});

// 4. GET /api/doctor/availability - Get doctor's current availability
router.get('/availability', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendSuccess(res, [], 200);
    }

    const doctorId = doctorRows[0].id;

    const [rows]: any = await pool.query(
      `SELECT 
        id,
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        consultation_type
      FROM doctor_availability
      WHERE doctor_id = ?
      ORDER BY FIELD(day_of_week, 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'), start_time ASC`,
      [doctorId]
    );

    const formatted = rows.map((slot: any) => ({
      id: slot.id,
      day: slot.day_of_week,
      start: slot.start_time.toString().slice(0, 5),
      end: slot.end_time.toString().slice(0, 5),
      type: slot.consultation_type === 'VIDEO' ? 'Video' : 'In-Person',
      rawType: slot.consultation_type,
    }));

    return sendSuccess(res, formatted, 200, 'Doctor availability retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching doctor availability:', error);
    return sendError(res, 'Failed to fetch doctor availability', 500);
  }
});

// 5. PUT /api/doctor/availability - Update or set doctor availability
router.put('/availability', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    const doctorId = doctorRows[0].id;
    const { slots, schedule } = req.body;

    // Handle structured slot array [{ day, start, end, type }]
    if (Array.isArray(slots)) {
      await pool.query('DELETE FROM doctor_availability WHERE doctor_id = ?', [doctorId]);

      for (const slot of slots) {
        const day = (slot.day || 'MON').toUpperCase();
        const start = slot.start ? `${slot.start}:00`.slice(0, 8) : '09:00:00';
        const end = slot.end ? `${slot.end}:00`.slice(0, 8) : '17:00:00';
        const type = (slot.type || 'IN_PERSON').toUpperCase().includes('VIDEO') ? 'VIDEO' : 'IN_PERSON';

        await pool.query(
          `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, consultation_type)
           VALUES (?, ?, ?, ?, ?)`,
          [doctorId, day, start, end, type]
        );
      }
    } else if (schedule && typeof schedule === 'object') {
      // Handle day-based map e.g. { monday: { available, start, end } }
      await pool.query('DELETE FROM doctor_availability WHERE doctor_id = ?', [doctorId]);

      const dayMap: Record<string, string> = {
        monday: 'MON', tuesday: 'TUE', wednesday: 'WED',
        thursday: 'THU', friday: 'FRI', saturday: 'SAT', sunday: 'SUN',
        mon: 'MON', tue: 'TUE', wed: 'WED', thu: 'THU', fri: 'FRI', sat: 'SAT', sun: 'SUN'
      };

      for (const [dayKey, config] of Object.entries<any>(schedule)) {
        const dbDay = dayMap[dayKey.toLowerCase()];
        if (dbDay && config?.available) {
          const start = config.start ? `${config.start}:00`.slice(0, 8) : '09:00:00';
          const end = config.end ? `${config.end}:00`.slice(0, 8) : '17:00:00';
          await pool.query(
            `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, consultation_type)
             VALUES (?, ?, ?, ?, 'IN_PERSON')`,
            [doctorId, dbDay, start, end]
          );
        }
      }
    }

    // Return updated availability
    const [rows]: any = await pool.query(
      `SELECT id, day_of_week, start_time, end_time, consultation_type
       FROM doctor_availability
       WHERE doctor_id = ?
       ORDER BY FIELD(day_of_week, 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'), start_time ASC`,
      [doctorId]
    );

    const formatted = rows.map((s: any) => ({
      id: s.id,
      day: s.day_of_week,
      start: s.start_time.toString().slice(0, 5),
      end: s.end_time.toString().slice(0, 5),
      type: s.consultation_type === 'VIDEO' ? 'Video' : 'In-Person',
    }));

    return sendSuccess(res, formatted, 200, 'Availability updated successfully');
  } catch (error: any) {
    console.error('Error updating doctor availability:', error);
    return sendError(res, 'Failed to update availability', 500);
  }
});

// 6. GET /api/doctor/prescriptions - Get prescriptions created by logged-in doctor
router.get('/prescriptions', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendSuccess(res, [], 200);
    }

    const doctorId = doctorRows[0].id;

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
        u.name as patient_name,
        u.email as patient_email
      FROM prescriptions p
      LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
      JOIN patients pt ON p.patient_id = pt.id
      JOIN users u ON pt.user_id = u.id
      WHERE p.doctor_id = ?
      ORDER BY p.created_at DESC`,
      [doctorId]
    );

    const list = rows.map((r: any) => {
      const createdDate = new Date(r.created_at);
      const startDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const endDateObj = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const endDate = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return {
        id: r.item_id ? `pi_${r.item_id}` : `pr_${r.prescription_id}`,
        prescriptionId: String(r.prescription_id),
        appointmentId: r.appointment_id ? String(r.appointment_id) : null,
        patientId: String(r.patient_id),
        patientName: r.patient_name,
        medicine: r.medication || r.diagnosis || 'Prescription',
        dosage: r.dosage || 'As directed',
        frequency: r.frequency || 'Daily',
        duration: r.duration || '30 days',
        instructions: r.instructions || r.notes || '',
        startDate,
        endDate,
        status: 'Active',
      };
    });

    return sendSuccess(res, list, 200, 'Doctor prescriptions retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching doctor prescriptions:', error);
    return sendError(res, 'Failed to fetch doctor prescriptions', 500);
  }
});

// 7. POST /api/doctor/prescriptions - Create a prescription for an appointment patient
router.post('/prescriptions', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { patientId, appointmentId, dosage, frequency, duration, instructions } = req.body;
    const medication = req.body.medication || req.body.items?.[0]?.medicationName || req.body.diagnosis || 'Prescription';

    if (!patientId || !medication) {
      return sendError(res, 'Patient ID and medication are required.', 400);
    }

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendError(res, 'Doctor not found.', 404);
    }

    const doctorId = doctorRows[0].id;

    // Verify doctor has an appointment with this patient
    const [appointmentCheck]: any = await pool.query(
      `SELECT id, patient_id FROM appointments 
       WHERE doctor_id = ? AND patient_id = ? 
       ${appointmentId ? 'AND id = ?' : ''} LIMIT 1`,
      appointmentId ? [doctorId, patientId, appointmentId] : [doctorId, patientId]
    );

    if (!appointmentCheck || appointmentCheck.length === 0) {
      return sendError(res, 'Forbidden: You can only prescribe medications to patients who have appointments with you.', 403);
    }

    const validAppointmentId = appointmentId || appointmentCheck[0].id;

    // Insert prescription
    const [pResult]: any = await pool.query(
      `INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [validAppointmentId, patientId, doctorId, medication, instructions || '']
    );

    const prescriptionId = pResult.insertId;

    // Insert prescription item
    const [itemResult]: any = await pool.query(
      `INSERT INTO prescription_items (prescription_id, medication, dosage, frequency, duration, instructions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        prescriptionId,
        medication,
        dosage || 'As directed',
        frequency || 'Daily',
        duration || '7 days',
        instructions || ''
      ]
    );

    const newPrescription = {
      id: `pi_${itemResult.insertId}`,
      prescriptionId: String(prescriptionId),
      appointmentId: String(validAppointmentId),
      patientId: String(patientId),
      medication,
      dosage: dosage || 'As directed',
      frequency: frequency || 'Daily',
      duration: duration || '7 days',
      instructions: instructions || '',
      status: 'Active',
    };

    // Automatic notification for patient
    try {
      const [[ptUser]]: any = await pool.query('SELECT user_id FROM patients WHERE id = ?', [patientId]);
      if (ptUser) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, 'New Prescription', ?, 'PRESCRIPTION')`,
          [ptUser.user_id, `A new prescription for ${medication} has been issued by your doctor.`]
        );
      }
    } catch (notifErr) {
      console.error('Failed to notify patient of prescription:', notifErr);
    }

    return sendSuccess(res, newPrescription, 201, 'Prescription created successfully');
  } catch (error: any) {
    console.error('Error creating prescription:', error);
    return sendError(res, 'Failed to create prescription', 500);
  }
});


// 8. GET /api/doctor/records - Get medical records created by / associated with authenticated doctor
router.get('/records', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendSuccess(res, [], 200);
    }

    const doctorId = doctorRows[0].id;

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
        u.name as patient_name
      FROM medical_records mr
      JOIN patients pt ON mr.patient_id = pt.id
      JOIN users u ON pt.user_id = u.id
      WHERE mr.doctor_id = ?
      ORDER BY mr.record_date DESC, mr.created_at DESC`,
      [doctorId]
    );

    const records = rows.map((r: any) => {
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
        patientId: String(r.patient_id),
        patientName: r.patient_name,
        type: r.record_type,
        title: r.title,
        description: r.description || '',
        notes: r.description || '',
        date: formattedDate,
        rawDate: r.record_date ? new Date(r.record_date).toISOString().slice(0, 10) : '',
        fileUrl: r.file_url || null,
      };
    });

    return sendSuccess(res, records, 200, 'Doctor medical records retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching doctor medical records:', error);
    return sendError(res, 'Failed to fetch doctor medical records', 500);
  }
});

// 9. POST /api/doctor/records - Create a medical record for an appointment patient
router.post('/records', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { patientId, appointmentId, diagnosis, title, description, treatment, notes } = req.body;

    const recordTitle = title || diagnosis;
    const recordDescription = description || notes || treatment || '';

    if (!patientId || !recordTitle) {
      return sendError(res, 'Patient ID and title/diagnosis are required.', 400);
    }

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendError(res, 'Doctor not found.', 404);
    }

    const doctorId = doctorRows[0].id;

    // Verify doctor has an appointment relationship with this patient
    const [appointmentCheck]: any = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? AND patient_id = ? 
       ${appointmentId ? 'AND id = ?' : ''} LIMIT 1`,
      appointmentId ? [doctorId, patientId, appointmentId] : [doctorId, patientId]
    );

    if (!appointmentCheck || appointmentCheck.length === 0) {
      return sendError(res, 'Forbidden: You can only create records for patients who have appointments with you.', 403);
    }

    const today = new Date().toISOString().slice(0, 10);

    const [recResult]: any = await pool.query(
      `INSERT INTO medical_records (patient_id, doctor_id, record_type, title, description, record_date)
       VALUES (?, ?, 'DIAGNOSIS', ?, ?, ?)`,
      [patientId, doctorId, recordTitle, recordDescription, today]
    );

    const newRecord = {
      id: String(recResult.insertId),
      patientId: String(patientId),
      title: recordTitle,
      diagnosis: recordTitle,
      description: recordDescription,
      notes: recordDescription,
      treatment: treatment || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    // Automatic notification for patient
    try {
      const [[ptUser]]: any = await pool.query('SELECT user_id FROM patients WHERE id = ?', [patientId]);
      if (ptUser) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, 'New Medical Record', ?, 'RECORD')`,
          [ptUser.user_id, `A new medical record "${recordTitle}" has been added by your doctor.`]
        );
      }
    } catch (notifErr) {
      console.error('Failed to notify patient of medical record:', notifErr);
    }

    return sendSuccess(res, newRecord, 201, 'Medical record created successfully');
  } catch (error: any) {
    console.error('Error creating medical record:', error);
    return sendError(res, 'Failed to create medical record', 500);
  }
});


// 10. GET /api/doctor/labs - Get lab reports for this doctor
router.get('/labs', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {

  try {
    const userId = req.user!.id;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendSuccess(res, [], 200);
    }

    const doctorId = doctorRows[0].id;

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
        u.name as patient_name
      FROM lab_reports lr
      JOIN patients pt ON lr.patient_id = pt.id
      JOIN users u ON pt.user_id = u.id
      WHERE lr.doctor_id = ?
      ORDER BY lr.report_date DESC, lr.created_at DESC`,
      [doctorId]
    );

    const statusMap: Record<string, string> = {
      'NORMAL': 'Completed',
      'ATTENTION': 'Attention',
      'CRITICAL': 'Attention',
      'PENDING': 'Pending',
    };

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

      return {
        id: String(r.id),
        patientId: String(r.patient_id),
        patientName: r.patient_name,
        test: r.test_name,
        testName: r.test_name,
        result: r.result || 'Pending evaluation',
        status: statusMap[r.status] || 'Pending',
        rawStatus: r.status,
        date: formattedDate,
        rawDate: r.report_date ? new Date(r.report_date).toISOString().slice(0, 10) : '',
        notes: r.notes || '',
        fileUrl: r.file_url || null,
      };
    });

    return sendSuccess(res, reports, 200, 'Doctor lab reports retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching doctor lab reports:', error);
    return sendError(res, 'Failed to fetch doctor lab reports', 500);
  }
});

// 11. POST /api/doctor/labs - Create a lab report
router.post('/labs', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { patientId, appointmentId, testName, testDate, result, notes, status } = req.body;

    if (!patientId || !testName) {
      return sendError(res, 'Patient ID and test name are required.', 400);
    }

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendError(res, 'Doctor not found.', 404);
    }

    const doctorId = doctorRows[0].id;

    // Verify appointment belongs to authenticated doctor and matches the patient
    const [appointmentCheck]: any = await pool.query(
      `SELECT id, patient_id FROM appointments 
       WHERE doctor_id = ? AND patient_id = ?
       ${appointmentId ? 'AND id = ?' : ''} LIMIT 1`,
      appointmentId ? [doctorId, patientId, appointmentId] : [doctorId, patientId]
    );

    if (!appointmentCheck || appointmentCheck.length === 0) {
      return sendError(res, 'Forbidden: You can only create lab reports for patients who have appointments with you.', 403);
    }

    const validAppointmentId = appointmentId || appointmentCheck[0].id;
    const reportDate = testDate || new Date().toISOString().slice(0, 10);

    // Map status to valid ENUM ('NORMAL', 'ATTENTION', 'PENDING', 'CRITICAL')
    let dbStatus: 'NORMAL' | 'ATTENTION' | 'PENDING' | 'CRITICAL' = 'NORMAL';
    if (status) {
      const upper = String(status).toUpperCase();
      if (upper === 'ATTENTION') dbStatus = 'ATTENTION';
      else if (upper === 'PENDING') dbStatus = 'PENDING';
      else if (upper === 'CRITICAL') dbStatus = 'CRITICAL';
      else if (upper === 'COMPLETED' || upper === 'NORMAL') dbStatus = 'NORMAL';
    }

    const [insertResult]: any = await pool.query(
      `INSERT INTO lab_reports (patient_id, doctor_id, appointment_id, test_name, result, status, report_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, validAppointmentId, testName, result || null, dbStatus, reportDate, notes || null]
    );

    // Get patient name for UI
    const [patientRows]: any = await pool.query(
      `SELECT u.name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
      [patientId]
    );
    const patientName = patientRows[0]?.name || 'Patient';

    const statusMap: Record<string, string> = {
      'NORMAL': 'Completed',
      'ATTENTION': 'Attention',
      'CRITICAL': 'Attention',
      'PENDING': 'Pending',
    };

    const newLab = {
      id: String(insertResult.insertId),
      patientId: String(patientId),
      patientName,
      test: testName,
      testName,
      result: result || 'Pending evaluation',
      status: statusMap[dbStatus],
      rawStatus: dbStatus,
      date: new Date(reportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rawDate: reportDate,
      notes: notes || '',
    };

    // Automatic notification for patient
    try {
      const [[ptUser]]: any = await pool.query('SELECT user_id FROM patients WHERE id = ?', [patientId]);
      if (ptUser) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, 'New Lab Report', ?, 'LAB')`,
          [ptUser.user_id, `A new lab report for "${testName}" has been issued.`]
        );
      }
    } catch (notifErr) {
      console.error('Failed to notify patient of lab report:', notifErr);
    }

    return sendSuccess(res, newLab, 201, 'Lab report created successfully');
  } catch (error: any) {
    console.error('Error creating lab report:', error);
    return sendError(res, 'Failed to create lab report', 500);
  }
});


// 12. PATCH /api/doctor/labs/:id - Update lab status
router.patch('/labs/:id', requireAuth, requireRole('DOCTOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const [doctorRows]: any = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return sendError(res, 'Doctor not found.', 404);
    }

    const doctorId = doctorRows[0].id;

    // Verify ownership
    const [labRows]: any = await pool.query(
      'SELECT id FROM lab_reports WHERE id = ? AND doctor_id = ?',
      [id, doctorId]
    );

    if (!labRows || labRows.length === 0) {
      return sendError(res, 'Lab report not found or unauthorized.', 404);
    }

    let dbStatus: 'NORMAL' | 'ATTENTION' | 'PENDING' | 'CRITICAL' = 'NORMAL';
    if (status) {
      const upper = String(status).toUpperCase();
      if (upper === 'ATTENTION') dbStatus = 'ATTENTION';
      else if (upper === 'PENDING') dbStatus = 'PENDING';
      else if (upper === 'CRITICAL') dbStatus = 'CRITICAL';
      else if (upper === 'COMPLETED' || upper === 'NORMAL') dbStatus = 'NORMAL';
    }

    await pool.query(
      'UPDATE lab_reports SET status = ? WHERE id = ?',
      [dbStatus, id]
    );

    return sendSuccess(res, { id, status: dbStatus }, 200, 'Lab report status updated successfully');
  } catch (error: any) {
    console.error('Error updating lab report:', error);
    return sendError(res, 'Failed to update lab report', 500);
  }
});

export default router;

