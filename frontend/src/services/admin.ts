import { apiRequest } from './api';

export interface AdminStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPrescriptions: number;
  totalMedicalRecords: number;
  totalLabReports: number;
}

export interface AdminUser {
  id: string;
  userId: number;
  name: string;
  email: string;
  role: string;
  rawRole: string;
  phone: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  date: string;
}

export interface AdminDoctor {
  id: string;
  doctorId: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  specialty: string;
  department: string;
  qualification: string;
  experience: string;
  about: string;
  bio: string;
  consultationFee: number;
  fee: number;
  hospital: string;
  floor?: string;
  room?: string;
  rating: number;
  reviews: number;
  status: string;
  isActive: boolean;
  profileImage?: string;
}

export interface AdminAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  type: string;
  status: string;
  rawStatus: string;
  reason: string;
  createdAt: string;
}

export interface AdminPatient {
  id: string;
  patientId: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  appointmentCount: number;
  status: string;
  emergencyContact: string;
  address: string;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await apiRequest<AdminStats>('/admin/stats', {
      method: 'GET',
    });
    if (!res.data) throw new Error('Failed to load admin stats');
    return res.data;
  },

  async getUsers(): Promise<AdminUser[]> {
    const res = await apiRequest<AdminUser[]>('/admin/users', {
      method: 'GET',
    });
    return res.data || [];
  },

  async deleteUser(id: string | number): Promise<any> {
    const res = await apiRequest<any>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async getDoctors(): Promise<AdminDoctor[]> {
    const res = await apiRequest<AdminDoctor[]>('/admin/doctors', {
      method: 'GET',
    });
    return res.data || [];
  },

  async updateDoctorStatus(id: string | number, status: 'active' | 'inactive'): Promise<any> {
    const res = await apiRequest<any>(`/admin/doctors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  async getAppointments(): Promise<AdminAppointment[]> {
    const res = await apiRequest<AdminAppointment[]>('/admin/appointments', {
      method: 'GET',
    });
    return res.data || [];
  },

  async getPatients(): Promise<AdminPatient[]> {
    const res = await apiRequest<AdminPatient[]>('/admin/patients', {
      method: 'GET',
    });
    return res.data || [];
  },
};
