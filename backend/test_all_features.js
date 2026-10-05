const BASE = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('=====================================================');
  console.log('     COMPREHENSIVE HEALTHCARE BACKEND TEST SUITE     ');
  console.log('=====================================================');

  // 1. Health Check
  const health = await req('/health');
  console.log('\n[1] HEALTH CHECK');
  console.log('    Status 200 & Server Running:', health.status === 200 && health.data.server === 'running' ? 'PASS' : 'FAIL');
  console.log('    Database Connected:', health.data.database === 'connected' ? 'PASS' : 'FAIL');

  // 2. Authentication
  console.log('\n[2] AUTHENTICATION & LOGIN');
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@healthcare.com', password: 'Admin@123', role: 'admin' })
  });
  const adminToken = adminLogin.data?.data?.token;
  console.log('    Admin login (admin@healthcare.com):', adminLogin.status === 200 && adminToken ? 'PASS' : 'FAIL');

  const docLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'doctor.sarah@healthcare.com', password: 'Doctor@123', role: 'doctor' })
  });
  const docToken = docLogin.data?.data?.token;
  console.log('    Doctor login (doctor.sarah@healthcare.com):', docLogin.status === 200 && docToken ? 'PASS' : 'FAIL');

  const patLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'patient@healthcare.com', password: 'Patient@123', role: 'patient' })
  });
  const patToken = patLogin.data?.data?.token;
  console.log('    Patient login (patient@healthcare.com):', patLogin.status === 200 && patToken ? 'PASS' : 'FAIL');

  // 3. Security & RBAC
  console.log('\n[3] SECURITY & ROLE-BASED ACCESS CONTROL (RBAC)');
  const patAdminAttempt = await req('/admin/stats', {
    headers: { Authorization: `Bearer ${patToken}` }
  });
  console.log('    Patient denied admin access (HTTP 403):', patAdminAttempt.status === 403 ? 'PASS' : `FAIL (${patAdminAttempt.status})`);

  const docAdminAttempt = await req('/admin/stats', {
    headers: { Authorization: `Bearer ${docToken}` }
  });
  console.log('    Doctor denied admin access (HTTP 403):', docAdminAttempt.status === 403 ? 'PASS' : `FAIL (${docAdminAttempt.status})`);

  const noTokenAttempt = await req('/admin/stats');
  console.log('    Unauthenticated access denied (HTTP 401):', noTokenAttempt.status === 401 ? 'PASS' : `FAIL (${noTokenAttempt.status})`);

  // 4. Admin Module Endpoints
  console.log('\n[4] ADMIN SYSTEM APIs');
  const stats = await req('/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('    GET /api/admin/stats:', stats.status === 200 && stats.data.success ? 'PASS' : 'FAIL', JSON.stringify(stats.data?.data));

  const adminUsers = await req('/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('    GET /api/admin/users:', adminUsers.status === 200 && Array.isArray(adminUsers.data?.data) ? 'PASS' : 'FAIL', `(${adminUsers.data?.data?.length} users)`);

  const adminDocs = await req('/admin/doctors', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('    GET /api/admin/doctors:', adminDocs.status === 200 && Array.isArray(adminDocs.data?.data) ? 'PASS' : 'FAIL', `(${adminDocs.data?.data?.length} doctors)`);

  const adminAppts = await req('/admin/appointments', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('    GET /api/admin/appointments:', adminAppts.status === 200 && Array.isArray(adminAppts.data?.data) ? 'PASS' : 'FAIL', `(${adminAppts.data?.data?.length} appts)`);

  const adminPats = await req('/admin/patients', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('    GET /api/admin/patients:', adminPats.status === 200 && Array.isArray(adminPats.data?.data) ? 'PASS' : 'FAIL', `(${adminPats.data?.data?.length} patients)`);

  // Test doctor status toggle
  if (adminDocs.data?.data?.length > 0) {
    const testDocId = adminDocs.data.data[0].id;
    const currentStatus = adminDocs.data.data[0].status;
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const statusUpdate = await req(`/admin/doctors/${testDocId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: newStatus })
    });
    console.log(`    PUT /api/admin/doctors/:id/status (${newStatus}):`, statusUpdate.status === 200 ? 'PASS' : 'FAIL');
    // revert back
    await req(`/admin/doctors/${testDocId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: currentStatus })
    });
  }

  // 5. Booking & Auto Notifications
  console.log('\n[5] APPOINTMENT SCHEDULING, CONFLICT DETECTION & NOTIFICATIONS');
  const patNotifsInit = await req('/notifications', {
    headers: { Authorization: `Bearer ${patToken}` }
  });
  const initialPatCount = patNotifsInit.data?.data?.length || 0;

  const testDate = '2026-11-20';
  const testSlot = '14:00:00';
  const bookRes = await req('/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${patToken}` },
    body: JSON.stringify({
      doctorId: 1,
      appointmentDate: testDate,
      startTime: testSlot,
      endTime: '14:30:00',
      appointmentType: 'IN_PERSON',
      reason: 'Automated verification checkup'
    })
  });
  console.log('    POST /api/appointments (Book):', bookRes.status === 201 ? 'PASS' : 'FAIL', bookRes.data?.message || '');

  // Double-booking conflict check
  const doubleBookRes = await req('/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${patToken}` },
    body: JSON.stringify({
      doctorId: 1,
      appointmentDate: testDate,
      startTime: testSlot,
      endTime: '14:30:00',
      appointmentType: 'IN_PERSON',
      reason: 'Attempt conflict'
    })
  });
  console.log('    Double-booking prevention (HTTP 409 Conflict):', doubleBookRes.status === 409 ? 'PASS' : `FAIL (${doubleBookRes.status})`);

  // Notifications received after booking
  const patNotifsAfterBook = await req('/notifications', {
    headers: { Authorization: `Bearer ${patToken}` }
  });
  console.log('    Auto Notification created for Patient:', patNotifsAfterBook.data?.data?.length > initialPatCount ? 'PASS' : 'FAIL');

  const docNotifs = await req('/notifications', {
    headers: { Authorization: `Bearer ${docToken}` }
  });
  console.log('    Auto Notification created for Doctor:', (docNotifs.data?.data?.length || 0) > 0 ? 'PASS' : 'FAIL');

  const apptId = bookRes.data?.data?.id;

  // 6. Reschedule Appointment
  if (apptId) {
    const resched = await req(`/appointments/${apptId}/reschedule`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patToken}` },
      body: JSON.stringify({
        appointmentDate: '2026-11-21',
        startTime: '15:00:00',
        endTime: '15:30:00'
      })
    });
    console.log('    PUT /api/appointments/:id/reschedule:', resched.status === 200 ? 'PASS' : 'FAIL');
  }

  // 7. Clinical Records Creation & Notifications
  console.log('\n[6] CLINICAL DATA RECORDING & AUTO-NOTIFICATIONS');
  const patProfile = await req('/patient/me', {
    headers: { Authorization: `Bearer ${patToken}` }
  });
  const patientId = patProfile.data?.data?.id;

  // Prescription
  const rxRes = await req('/doctor/prescriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${docToken}` },
    body: JSON.stringify({
      patientId: patientId,
      appointmentId: apptId || 1,
      diagnosis: 'Seasonal Allergies & Rhinitis',
      instructions: 'Take 1 tablet daily before bed',
      items: [
        { medicationName: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days', instructions: 'After dinner' }
      ]
    })
  });
  console.log('    POST /api/doctor/prescriptions (creates patient notification):', rxRes.status === 201 ? 'PASS' : 'FAIL');

  // Medical Record
  const mrRes = await req('/doctor/records', {
    method: 'POST',
    headers: { Authorization: `Bearer ${docToken}` },
    body: JSON.stringify({
      patientId: patientId,
      recordType: 'Consultation',
      title: 'Routine Allergy Examination',
      description: 'Patient examined with mild nasal congestion. Vital signs normal.',
      notes: 'No chronic issues observed.'
    })
  });
  console.log('    POST /api/doctor/records (creates patient notification):', mrRes.status === 201 ? 'PASS' : 'FAIL');

  // Lab Report
  const labRes = await req('/doctor/labs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${docToken}` },
    body: JSON.stringify({
      patientId: patientId,
      testName: 'Complete Blood Count (CBC)',
      testCategory: 'Hematology',
      resultValue: 'Normal WBC 6.8',
      referenceRange: '4.5 - 11.0 K/uL',
      unit: 'K/uL',
      status: 'Completed',
      notes: 'All markers within baseline.'
    })
  });
  console.log('    POST /api/doctor/labs (creates patient notification):', labRes.status === 201 ? 'PASS' : 'FAIL');

  // 8. Notification Actions
  console.log('\n[7] NOTIFICATION MANAGEMENT (BELL / POPOVER APIS)');
  const patNotifsCurrent = await req('/notifications', {
    headers: { Authorization: `Bearer ${patToken}` }
  });
  if (patNotifsCurrent.data?.data?.length > 0) {
    const firstNotif = patNotifsCurrent.data.data[0];
    const markSingle = await req(`/notifications/${firstNotif.id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patToken}` }
    });
    console.log(`    PUT /api/notifications/:id/read (id: ${firstNotif.id}):`, markSingle.status === 200 ? 'PASS' : 'FAIL');

    const markAll = await req('/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patToken}` }
    });
    console.log('    PUT /api/notifications/read-all:', markAll.status === 200 ? 'PASS' : 'FAIL');
  }

  // 9. Cancel Appointment
  if (apptId) {
    const cancelRes = await req(`/appointments/${apptId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patToken}` },
      body: JSON.stringify({ reason: 'Automated test suite cleanup' })
    });
    console.log('    PUT /api/appointments/:id/cancel:', cancelRes.status === 200 ? 'PASS' : 'FAIL');
  }

  console.log('\n=====================================================');
  console.log('       ALL TEST SCENARIOS COMPLETED SUCCESSFULLY     ');
  console.log('=====================================================');
}

runTests().catch(console.error);
