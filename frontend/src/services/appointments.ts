import { apiRequest } from './api';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  rawStatus: string;
  reason: string;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
    department: string;
    hospital: string;
    floor?: string;
    room?: string;
    image?: string;
  };
  patient?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
  };
}

export interface BookAppointmentPayload {
  doctorId: number | string;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  appointmentType: string;
  reason?: string;
}

export interface ReschedulePayload {
  appointmentDate: string;
  startTime: string;
  endTime?: string;
}

export const appointmentsService = {
  async bookAppointment(payload: BookAppointmentPayload): Promise<any> {
    const res = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async getPatientAppointments(): Promise<Appointment[]> {
    const res = await apiRequest<Appointment[]>('/appointments/my', {
      method: 'GET',
    });
    return res.data || [];
  },

  async getDoctorAppointments(): Promise<Appointment[]> {
    const res = await apiRequest<Appointment[]>('/appointments/doctor', {
      method: 'GET',
    });
    return res.data || [];
  },

  async cancelAppointment(id: string): Promise<any> {
    const res = await apiRequest(`/appointments/${id}/cancel`, {
      method: 'PUT',
    });
    return res.data;
  },

  async rescheduleAppointment(id: string, payload: ReschedulePayload): Promise<any> {
    const res = await apiRequest(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
