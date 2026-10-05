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

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  reason: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
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

export interface Note {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  title: string;
  content: string;
}

export interface Lab {
  id: string;
  patientId: string;
  test: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Attention';
  result: string;
}

interface AppState {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  notes: Note[];
  labs: Lab[];
  notifications: { id: string; message: string; read: boolean; type: string }[];
  
  // Patient Actions
  bookAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  markMedicationTaken: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Doctor Actions
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addPrescription: (p: Omit<Prescription, 'id' | 'status' | 'takenToday'>) => void;
  addNote: (n: Omit<Note, 'id'>) => void;
  addLab: (l: Omit<Lab, 'id'>) => void;
  updateLabStatus: (id: string, status: Lab['status']) => void;
}

const mockDoctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', experience: '15 years', hospital: 'General Hospital', rating: 4.9, reviews: 124, fee: 150, image: '', about: 'Expert in cardiovascular health.' },
  { id: 'd2', name: 'Dr. Marcus Johnson', specialty: 'General Practice', experience: '10 years', hospital: 'City Clinic', rating: 4.8, reviews: 89, fee: 100, image: '', about: 'Dedicated general practitioner.' },
  { id: 'd3', name: 'Dr. Emily Davis', specialty: 'Neurology', experience: '12 years', hospital: 'Metro Health', rating: 4.7, reviews: 200, fee: 200, image: '', about: 'Specialist in neurological disorders.' },
];

const mockPatients: Patient[] = [
  { id: 'p1', name: 'Teja Manukonda', age: 32, gender: 'Male', bloodGroup: 'O+', allergies: ['Penicillin'] },
  { id: 'p2', name: 'Marcus Johnson', age: 45, gender: 'Male', bloodGroup: 'A+', allergies: [] },
  { id: 'p3', name: 'Sarah Williams', age: 28, gender: 'Female', bloodGroup: 'B-', allergies: ['Peanuts'] },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      doctors: mockDoctors,
      patients: mockPatients,
      appointments: [
        { id: 'a1', doctorId: 'd1', patientId: 'p1', date: '2026-10-12', time: '10:00 AM', type: 'Video Consultation', status: 'Upcoming', reason: 'Routine checkup' },
        { id: 'a2', doctorId: 'd1', patientId: 'p2', date: '2026-10-12', time: '11:00 AM', type: 'In-Person', status: 'Upcoming', reason: 'Follow up' },
      ],
      prescriptions: [
        { id: 'pr1', doctorId: 'd1', patientId: 'p1', medicine: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', startDate: '2026-09-01', endDate: '2026-10-01', instructions: 'Take in the morning with water.', status: 'Active', takenToday: false }
      ],
      notes: [],
      labs: [
        { id: 'l1', patientId: 'p1', test: 'Complete Blood Count (CBC)', date: 'Oct 05, 2026', status: 'Completed', result: 'Normal' },
      ],
      notifications: [
        { id: 'n1', message: 'Upcoming appointment with Dr. Jenkins tomorrow.', read: false, type: 'appointment' },
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
      
      updateAppointmentStatus: (id, status) => set((state) => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a)
      })),
      addPrescription: (p) => set((state) => ({
        prescriptions: [...state.prescriptions, { ...p, id: Math.random().toString(36).substr(2, 9), status: 'Active', takenToday: false }]
      })),
      addNote: (n) => set((state) => ({
        notes: [...state.notes, { ...n, id: Math.random().toString(36).substr(2, 9) }]
      })),
      addLab: (l) => set((state) => ({
        labs: [...state.labs, { ...l, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateLabStatus: (id, status) => set((state) => ({
        labs: state.labs.map(l => l.id === id ? { ...l, status } : l)
      })),
    }),
    {
      name: 'app-storage',
    }
  )
);
