import { apiRequest } from './api';

export interface PatientProfile {
  id: string;
  patientId: number | null;
  userId: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  address?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface UpdatePatientProfilePayload {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  address?: string;
}

export interface MedicalRecord {
  id: string;
  type: string;
  rawType: string;
  title: string;
  description: string;
  date: string;
  rawDate: string;
  doctor: string;
  doctorId?: string | null;
  fileUrl?: string | null;
}

export interface Prescription {
  id: string;
  prescriptionId: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed';
  takenToday: boolean;
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  doctorId: string;
}

export interface LabReport {
  id: string;
  name: string;
  result: string;
  status: 'Normal' | 'Attention' | 'Critical' | 'Pending';
  rawStatus: string;
  date: string;
  rawDate: string;
  lab: string;
  doctor: string;
  fileUrl?: string | null;
}

export const patientService = {
  async getProfile(): Promise<PatientProfile> {
    const res = await apiRequest<PatientProfile>('/patient/me', {
      method: 'GET',
    });
    if (!res.data) throw new Error('Failed to load profile.');
    return res.data;
  },

  async updateProfile(payload: UpdatePatientProfilePayload): Promise<PatientProfile> {
    const res = await apiRequest<PatientProfile>('/patient/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error('Failed to update profile.');
    return res.data;
  },

  async getRecords(): Promise<MedicalRecord[]> {
    const res = await apiRequest<MedicalRecord[]>('/patient/records', {
      method: 'GET',
    });
    return res.data || [];
  },

  async getPrescriptions(): Promise<Prescription[]> {
    const res = await apiRequest<Prescription[]>('/patient/prescriptions', {
      method: 'GET',
    });
    return res.data || [];
  },

  async getLabs(): Promise<LabReport[]> {
    const res = await apiRequest<LabReport[]>('/patient/labs', {
      method: 'GET',
    });
    return res.data || [];
  },
};
