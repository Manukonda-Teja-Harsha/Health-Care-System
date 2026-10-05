import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import doctorsRouter from './routes/doctors.js';
import appointmentsRouter from './routes/appointments.js';
import patientRouter from './routes/patient.js';
import doctorRouter from './routes/doctor.js';
import notificationsRouter from './routes/notifications.js';
import adminRouter from './routes/admin.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { checkDbConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS Configuration
const corsOptions: cors.CorsOptions = {
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/patient', patientRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);


// 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`Healthcare Backend Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Allowed CORS Origin: ${FRONTEND_URL}`);
  
  // Verify database connection on startup
  const isDbConnected = await checkDbConnection();
  if (isDbConnected) {
    console.log(`MySQL Database (healthcare_db): Connected successfully`);
  } else {
    console.warn(`WARNING: MySQL Database is not reachable. Check XAMPP MySQL.`);
  }
  console.log(`===============================================`);
});

export default app;
