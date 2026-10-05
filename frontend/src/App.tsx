import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import PatientLayout from './components/layout/PatientLayout';
import PatientDashboard from './pages/patient/Dashboard';
import Doctors from './pages/patient/Doctors';
import DoctorDetails from './pages/patient/DoctorDetails';
import Appointments from './pages/patient/Appointments';
import AppointmentDetails from './pages/patient/AppointmentDetails';
import Records from './pages/patient/Records';
import Prescriptions from './pages/patient/Prescriptions';
import Labs from './pages/patient/Labs';
import Health from './pages/patient/Health';
import Notifications from './pages/patient/Notifications';
import Settings from './pages/patient/Settings';

import SharedProfile from './pages/shared/Profile';

import DoctorLayout from './components/layout/DoctorLayout';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPatientDetails from './pages/doctor/PatientDetails';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import DoctorNotes from './pages/doctor/Notes';
import DoctorLabs from './pages/doctor/Labs';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorSettings from './pages/doctor/Settings';

import AdminLayout from './components/layout/AdminLayout';
import AdminOverview from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminAppointments from './pages/admin/Appointments';
import AdminSystem from './pages/admin/System';
import { useEffect } from 'react';
import AdminSettings from './pages/admin/Settings';
import { useAuthStore } from './store/auth';
import PublicDoctors from './pages/public/PublicDoctors';
import PublicDoctorProfile from './pages/public/PublicDoctorProfile';
import MyAppointments from './pages/public/MyAppointments';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user && !allowedRoles.includes(user.role as string)) return <Navigate to={`/${user.role}`} replace />;
  
  return <>{children}</>;
};

import { Toaster } from './components/ui/toaster';

function App() {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
        <Navbar />
        <Toaster />
        <main className="flex-1 pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Doctors Directory — no auth required */}
            <Route path="/doctors" element={<PublicDoctors />} />
            <Route path="/doctors/:id" element={<PublicDoctorProfile />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }>
              <Route index element={<PatientDashboard />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="doctors/:id" element={<DoctorDetails />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="appointments/:id" element={<AppointmentDetails />} />
              <Route path="records" element={<Records />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="labs" element={<Labs />} />
              <Route path="health" element={<Health />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<SharedProfile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="patients/:id" element={<DoctorPatientDetails />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
              <Route path="notes" element={<DoctorNotes />} />
              <Route path="labs" element={<DoctorLabs />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="profile" element={<SharedProfile />} />
              <Route path="settings" element={<DoctorSettings />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminOverview />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="system" element={<AdminSystem />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
