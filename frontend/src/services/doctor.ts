import { apiRequest } from './api';

export interface DoctorProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  qualification: string;
  experience: string;
  bio: string;
  languages: string[];
  consultationFee: number;
  hospital: string;
  floor?: string;
  room?: string;
  rating: number;
  reviewCount: number;
  profileImage?: string;
}

export interface DoctorAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  rawStatus: string;
  reason: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    allergies?: string[];
  };
}

export interface DoctorPatient {
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
  emergencyContact?: string;
  address?: string;
}

export interface AvailabilitySlot {
  id: number;
  day: string;
  start: string;
  end: string;
  type: string;
  rawType?: string;
}

export interface UpdateAvailabilityPayload {
  slots?: {
    day: string;
    start: string;
    end: string;
    type?: string;
  }[];
  schedule?: Record<string, { available: boolean; start: string; end: string }>;
}

export interface DoctorPrescription {
  id: string;
  prescriptionId: string;
  appointmentId: string | null;
  patientId: string;
  patientName: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface CreatePrescriptionPayload {
  patientId: string | number;
  appointmentId?: string | number;
  medication: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface DoctorRecord {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  title: string;
  description: string;
  notes: string;
  treatment?: string;
  date: string;
  rawDate?: string;
  fileUrl?: string | null;
}

export interface CreateRecordPayload {
  patientId: string | number;
  appointmentId?: string | number;
  title: string;
  diagnosis?: string;
  description?: string;
  treatment?: string;
  notes?: string;
}

export interface DoctorLab {
  id: string;
  patientId: string;
  patientName: string;
  test: string;
  testName: string;
  result: string;
  status: 'Completed' | 'Attention' | 'Pending';
  rawStatus: string;
  date: string;
  rawDate: string;
  notes?: string;
  fileUrl?: string | null;
}

export interface CreateLabPayload {
  patientId: string | number;
  appointmentId?: string | number;
  testName: string;
  testDate?: string;
  result?: string;
  notes?: string;
  status?: string;
}

export const doctorService = {
  async getProfile(): Promise<DoctorProfile> {
    const res = await apiRequest<DoctorProfile>('/doctor/me', {
      method: 'GET',
    });
    if (!res.data) throw new Error('Failed to load doctor profile.');
    return res.data;
  },

  async getAppointments(): Promise<DoctorAppointment[]> {
    const res = await apiRequest<DoctorAppointment[]>('/doctor/appointments', {
      method: 'GET',
    });
    return res.data || [];
  },

  async getPatients(): Promise<DoctorPatient[]> {
    const res = await apiRequest<DoctorPatient[]>('/doctor/patients', {
      method: 'GET',
    });
    return res.data || [];
  },

  async getAvailability(): Promise<AvailabilitySlot[]> {
    const res = await apiRequest<AvailabilitySlot[]>('/doctor/availability', {
      method: 'GET',
    });
    return res.data || [];
  },

  async updateAvailability(payload: UpdateAvailabilityPayload): Promise<AvailabilitySlot[]> {
    const res = await apiRequest<AvailabilitySlot[]>('/doctor/availability', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data || [];
  },

  async getPrescriptions(): Promise<DoctorPrescription[]> {
    const res = await apiRequest<DoctorPrescription[]>('/doctor/prescriptions', {
      method: 'GET',
    });
    return res.data || [];
  },

  async createPrescription(payload: CreatePrescriptionPayload): Promise<DoctorPrescription> {
    const res = await apiRequest<DoctorPrescription>('/doctor/prescriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error(res.message || 'Failed to create prescription');
    return res.data;
  },

  async getRecords(): Promise<DoctorRecord[]> {
    const res = await apiRequest<DoctorRecord[]>('/doctor/records', {
      method: 'GET',
    });
    return res.data || [];
  },

  async createRecord(payload: CreateRecordPayload): Promise<DoctorRecord> {
    const res = await apiRequest<DoctorRecord>('/doctor/records', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error(res.message || 'Failed to create medical record');
    return res.data;
  },

  async getLabs(): Promise<DoctorLab[]> {
    const res = await apiRequest<DoctorLab[]>('/doctor/labs', {
      method: 'GET',
    });
    return res.data || [];
  },

  async createLab(payload: CreateLabPayload): Promise<DoctorLab> {
    const res = await apiRequest<DoctorLab>('/doctor/labs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error(res.message || 'Failed to create lab report');
    return res.data;
  },

  async updateLabStatus(id: string, status: string): Promise<any> {
    const res = await apiRequest<any>(`/doctor/labs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },
};


