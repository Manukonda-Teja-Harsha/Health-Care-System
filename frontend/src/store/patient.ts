import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  hospital: string;
  rating: number;
  reviews: number;
  fee: number;
  image: string;
  about: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  reason: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate: string;
  instructions: string;
  status: 'Active' | 'Completed';
  takenToday: boolean;
}

interface PatientState {
  doctors: Doctor[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  notifications: { id: string; message: string; read: boolean; type: string }[];
  bookAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  markMedicationTaken: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const mockDoctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', experience: '15 years', hospital: 'General Hospital', rating: 4.9, reviews: 124, fee: 150, image: '', about: 'Expert in cardiovascular health.' },
  { id: 'd2', name: 'Dr. Marcus Johnson', specialty: 'General Practice', experience: '10 years', hospital: 'City Clinic', rating: 4.8, reviews: 89, fee: 100, image: '', about: 'Dedicated general practitioner.' },
  { id: 'd3', name: 'Dr. Emily Davis', specialty: 'Neurology', experience: '12 years', hospital: 'Metro Health', rating: 4.7, reviews: 200, fee: 200, image: '', about: 'Specialist in neurological disorders.' },
];

export const useAppStore = create<PatientState>()(
  persist(
    (set) => ({
      doctors: mockDoctors,
      appointments: [
        { id: 'a1', doctorId: 'd1', date: '2026-10-12', time: '10:00 AM', type: 'Video Consultation', status: 'Upcoming', reason: 'Routine checkup' }
      ],
      prescriptions: [
        { id: 'p1', doctorId: 'd1', medicine: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', startDate: '2026-09-01', endDate: '2026-10-01', instructions: 'Take in the morning with water.', status: 'Active', takenToday: false }
      ],
      notifications: [
        { id: 'n1', message: 'Upcoming appointment with Dr. Jenkins tomorrow.', read: false, type: 'appointment' },
        { id: 'n2', message: 'Your lab results for Blood Panel are ready.', read: false, type: 'lab' }
      ],
      bookAppointment: (apt) => set((state) => ({
        appointments: [...state.appointments, { ...apt, id: Math.random().toString(36).substr(2, 9), status: 'Upcoming' }]
      })),
      cancelAppointment: (id) => set((state) => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a)
      })),
      rescheduleAppointment: (id, date, time) => set((state) => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, date, time } : a)
      })),
      markMedicationTaken: (id) => set((state) => ({
        prescriptions: state.prescriptions.map(p => p.id === id ? { ...p, takenToday: true } : p)
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'patient-storage',
    }
  )
);
