import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

async function seed() {
  console.log('--- Starting Database Seeding ---');

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    console.log('1. Clearing existing records...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('TRUNCATE TABLE lab_reports');
    await connection.query('TRUNCATE TABLE medical_records');
    await connection.query('TRUNCATE TABLE prescription_items');
    await connection.query('TRUNCATE TABLE prescriptions');
    await connection.query('TRUNCATE TABLE appointments');
    await connection.query('TRUNCATE TABLE doctor_availability');
    await connection.query('TRUNCATE TABLE doctors');
    await connection.query('TRUNCATE TABLE patients');
    await connection.query('TRUNCATE TABLE departments');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('2. Inserting Departments...');
    const departments = [
      { name: 'Cardiology', description: 'Comprehensive heart and cardiovascular care.' },
      { name: 'Neurology', description: 'Brain, spinal cord, and nervous system disorders.' },
      { name: 'Orthopedics', description: 'Musculoskeletal system, bones, and joints.' },
      { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents.' },
      { name: 'Dermatology', description: 'Diagnosis and treatment of skin, hair, and nail conditions.' },
      { name: 'General Medicine', description: 'Primary and preventive care for adults.' },
    ];

    const departmentMap: Record<string, number> = {};
    for (const dept of departments) {
      const [result]: any = await connection.query(
        'INSERT INTO departments (name, description) VALUES (?, ?)',
        [dept.name, dept.description]
      );
      departmentMap[dept.name] = result.insertId;
    }

    console.log('3. Hashing passwords...');
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
    const doctorPasswordHash = await bcrypt.hash('Doctor@123', saltRounds);
    const patientPasswordHash = await bcrypt.hash('Patient@123', saltRounds);
    const demoAdminHash = await bcrypt.hash('admin123', saltRounds);
    const demoPatientHash = await bcrypt.hash('patient123', saltRounds);
    const demoDoctorHash = await bcrypt.hash('doctor123', saltRounds);

    console.log('4. Creating Admin Users...');
    await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['System Administrator', 'admin@healthcare.com', adminPasswordHash, 'ADMIN', '+1-555-0100']
    );
    await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Demo Admin', 'admin@example.com', demoAdminHash, 'ADMIN', '+1-555-0109']
    );

    console.log('5. Creating Patient Users & Profiles...');
    const [patientUserResult]: any = await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Jane Doe', 'patient@healthcare.com', patientPasswordHash, 'PATIENT', '+1-555-0101']
    );
    const patientUserId = patientUserResult.insertId;

    const [demoPatientUserResult]: any = await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Demo Patient', 'patient@example.com', demoPatientHash, 'PATIENT', '+1-555-0102']
    );
    const demoPatientUserId = demoPatientUserResult.insertId;

    await connection.query(
      `INSERT INTO patients (user_id, date_of_birth, gender, blood_group, emergency_contact, address)
       VALUES (?, '1995-08-20', 'OTHER', 'A+', '+1-555-0198', '123 Health Ave, Springfield')`,
      [demoPatientUserId]
    );

    const [patientResult]: any = await connection.query(
      `INSERT INTO patients (
        user_id, date_of_birth, gender, blood_group, allergies, 
        emergency_contact, address, insurance_provider, insurance_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientUserId,
        '1992-05-14',
        'FEMALE',
        'O+',
        'Penicillin, Peanuts',
        'John Doe (+1-555-0199)',
        '742 Evergreen Terrace, Springfield',
        'Blue Cross Health',
        'BC-98421039',
      ]
    );
    const patientId = patientResult.insertId;

    console.log('6. Creating Doctors...');
    const doctorsData = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'doctor.sarah@healthcare.com',
        phone: '+1-555-0201',
        department: 'Cardiology',
        specialization: 'Cardiology & Heart Failure',
        qualification: 'MD, FACC - Harvard Medical School',
        experienceYears: 15,
        bio: 'Senior cardiologist specializing in preventative cardiology, non-invasive imaging, and heart failure management.',
        languages: 'English, Spanish',
        fee: 150.00,
        hospital: 'City General Hospital',
        floor: '3rd Floor',
        room: 'Room 304',
        rating: 4.90,
        reviewCount: 124,
      },
      {
        name: 'Dr. Marcus Johnson',
        email: 'doctor.marcus@healthcare.com',
        phone: '+1-555-0202',
        department: 'General Medicine',
        specialization: 'Internal & Preventive Medicine',
        qualification: 'MD - Johns Hopkins University',
        experienceYears: 10,
        bio: 'Dedicated primary care physician focused on chronic illness prevention, holistic wellness, and adult health.',
        languages: 'English',
        fee: 100.00,
        hospital: 'Metro Health Pavilion',
        floor: '1st Floor',
        room: 'Room 112',
        rating: 4.80,
        reviewCount: 89,
      },
      {
        name: 'Dr. Emily Davis',
        email: 'doctor.emily@healthcare.com',
        phone: '+1-555-0203',
        department: 'Neurology',
        specialization: 'Clinical Neurology & Epilepsy',
        qualification: 'MD, PhD - Stanford University',
        experienceYears: 12,
        bio: 'Neurologist with deep clinical expertise in migraine management, neurodegenerative diseases, and sleep disorders.',
        languages: 'English, French',
        fee: 200.00,
        hospital: 'City General Hospital',
        floor: '4th Floor',
        room: 'Room 408',
        rating: 4.70,
        reviewCount: 200,
      },
      {
        name: 'Dr. Alex Rivera',
        email: 'doctor.alex@healthcare.com',
        phone: '+1-555-0204',
        department: 'Orthopedics',
        specialization: 'Orthopedic Surgery & Sports Medicine',
        qualification: 'MD - Columbia University',
        experienceYears: 14,
        bio: 'Board-certified orthopedic surgeon specializing in arthroscopic surgery, joint replacement, and sports injury recovery.',
        languages: 'English, Spanish',
        fee: 175.00,
        hospital: 'Sports Medicine Institute',
        floor: '2nd Floor',
        room: 'Room 215',
        rating: 4.95,
        reviewCount: 165,
      },
      {
        name: 'Dr. Priya Patel',
        email: 'doctor.priya@healthcare.com',
        phone: '+1-555-0205',
        department: 'Pediatrics',
        specialization: 'General Pediatrics & Adolescent Care',
        qualification: 'MD, FAAP - University of Pennsylvania',
        experienceYears: 8,
        bio: 'Compassionate pediatrician focusing on child development milestones, vaccinations, and adolescent preventative health.',
        languages: 'English, Hindi, Gujarati',
        fee: 120.00,
        hospital: 'Childrens Wellness Center',
        floor: '1st Floor',
        room: 'Room 101',
        rating: 4.85,
        reviewCount: 94,
      },
      {
        name: 'Dr. Lucas Vance',
        email: 'doctor.lucas@healthcare.com',
        phone: '+1-555-0206',
        department: 'Dermatology',
        specialization: 'Medical & Aesthetic Dermatology',
        qualification: 'MD, FAAD - Yale School of Medicine',
        experienceYears: 11,
        bio: 'Dermatology specialist delivering evidence-based treatment for complex inflammatory skin conditions and skin cancer screenings.',
        languages: 'English, German',
        fee: 160.00,
        hospital: 'City General Hospital',
        floor: '2nd Floor',
        room: 'Room 205',
        rating: 4.75,
        reviewCount: 112,
      },
      {
        name: 'Dr. Sarah Jenkins (Demo)',
        email: 'doctor@example.com',
        phone: '+1-555-0200',
        department: 'Cardiology',
        specialization: 'Cardiology & Heart Failure',
        qualification: 'MD, FACC',
        experienceYears: 15,
        bio: 'Senior cardiologist (Demo doctor account).',
        languages: 'English',
        fee: 150.00,
        hospital: 'City General Hospital',
        floor: '3rd Floor',
        room: 'Room 304',
        rating: 4.90,
        reviewCount: 124,
      },
    ];

    const doctorIds: number[] = [];

    for (const doc of doctorsData) {
      const hashToUse = doc.email === 'doctor@example.com' ? demoDoctorHash : doctorPasswordHash;
      const [userResult]: any = await connection.query(
        'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
        [doc.name, doc.email, hashToUse, 'DOCTOR', doc.phone]
      );
      const userId = userResult.insertId;

      const deptId = departmentMap[doc.department];

      const [doctorResult]: any = await connection.query(
        `INSERT INTO doctors (
          user_id, department_id, specialization, qualification, experience_years,
          bio, languages, consultation_fee, hospital, floor, room, rating, review_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          deptId,
          doc.specialization,
          doc.qualification,
          doc.experienceYears,
          doc.bio,
          doc.languages,
          doc.fee,
          doc.hospital,
          doc.floor,
          doc.room,
          doc.rating,
          doc.reviewCount,
        ]
      );
      const doctorId = doctorResult.insertId;
      doctorIds.push(doctorId);

      // Add doctor availability schedule
      const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;
      for (const day of days) {
        await connection.query(
          `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, consultation_type)
           VALUES (?, ?, ?, ?, ?)`,
          [doctorId, day, '09:00:00', '13:00:00', 'IN_PERSON']
        );
        await connection.query(
          `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, consultation_type)
           VALUES (?, ?, ?, ?, ?)`,
          [doctorId, day, '14:00:00', '17:00:00', 'VIDEO']
        );
      }
    }

    console.log('7. Creating Sample Appointment...');
    const [appointmentResult]: any = await connection.query(
      `INSERT INTO appointments (
        patient_id, doctor_id, appointment_date, start_time, end_time,
        appointment_type, status, reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        doctorIds[0], // Dr. Sarah Jenkins
        '2026-10-15',
        '10:00:00',
        '10:30:00',
        'VIDEO',
        'CONFIRMED',
        'Routine cardiovascular checkup and blood pressure monitoring',
      ]
    );
    const appointmentId = appointmentResult.insertId;

    console.log('8. Creating Sample Prescription...');
    const [prescriptionResult]: any = await connection.query(
      `INSERT INTO prescriptions (
        appointment_id, patient_id, doctor_id, diagnosis, notes
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        appointmentId,
        patientId,
        doctorIds[0],
        'Hypertension Stage 1',
        'Monitor daily blood pressure readings and follow a low-sodium diet.',
      ]
    );
    const prescriptionId = prescriptionResult.insertId;

    await connection.query(
      `INSERT INTO prescription_items (
        prescription_id, medication, dosage, frequency, duration, instructions
      ) VALUES 
      (?, 'Lisinopril', '10mg', 'Once daily', '30 days', 'Take in morning with a full glass of water'),
      (?, 'Amlodipine', '5mg', 'Once daily', '30 days', 'Take in the evening before bed')`,
      [prescriptionId, prescriptionId]
    );

    console.log('9. Creating Sample Medical Record & Lab Report...');
    await connection.query(
      `INSERT INTO medical_records (
        patient_id, doctor_id, record_type, title, description, record_date
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        doctorIds[0],
        'DIAGNOSIS',
        'Hypertension Management Plan',
        'Initial assessment indicated elevated resting BP (138/88). Prescribed Lisinopril 10mg daily.',
        '2026-09-15',
      ]
    );

    await connection.query(
      `INSERT INTO lab_reports (
        patient_id, doctor_id, appointment_id, test_name, result, status, report_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        doctorIds[0],
        appointmentId,
        'Complete Blood Count (CBC)',
        'Hemoglobin: 14.2 g/dL, WBC: 6.8 K/uL, Platelets: 245 K/uL. All markers within normal reference range.',
        'NORMAL',
        '2026-09-18',
        'Reviewed by Dr. Sarah Jenkins. No acute findings.',
      ]
    );

    console.log('10. Creating Sample Notification...');
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?)`,
      [
        patientUserId,
        'Appointment Confirmed',
        'Your video consultation with Dr. Sarah Jenkins is scheduled for Oct 15, 2026 at 10:00 AM.',
        'APPOINTMENT',
        false,
      ]
    );

    await connection.commit();
    console.log('--- Database Seeding Completed Successfully! ---');
  } catch (err) {
    await connection.rollback();
    console.error('Error during database seed:', err);
    throw err;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
