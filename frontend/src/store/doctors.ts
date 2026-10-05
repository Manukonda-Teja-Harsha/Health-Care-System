// ─────────────────────────────────────────────────────────────────────────────
// Doctors Zustand Store — public favorites, appointments, compare list
// Persisted to localStorage. No backend.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PublicAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  department: string;
  date: string;       // ISO YYYY-MM-DD
  time: string;       // '09:00 AM'
  type: 'In-Person' | 'Video Consultation';
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  reason: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled';
  bookedAt: string;   // ISO timestamp
}

interface DoctorsState {
  favorites: string[];           // doctor IDs
  compareList: string[];         // max 3 doctor IDs
  appointments: PublicAppointment[];

  toggleFavorite: (id: string) => void;
  toggleCompare:  (id: string) => void;
  clearCompare:   () => void;

  bookAppointment:       (apt: Omit<PublicAppointment, 'id' | 'bookedAt' | 'status'>) => string;
  cancelAppointment:     (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
}

export const useDoctorsStore = create<DoctorsState>()(
  persist(
    (set) => ({
      favorites:    [],
      compareList:  [],
      appointments: [],

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),

      toggleCompare: (id) =>
        set((s) => {
          if (s.compareList.includes(id))
            return { compareList: s.compareList.filter((c) => c !== id) };
          if (s.compareList.length >= 3) return s; // max 3
          return { compareList: [...s.compareList, id] };
        }),

      clearCompare: () => set({ compareList: [] }),

      bookAppointment: (apt) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((s) => ({
          appointments: [
            ...s.appointments,
            { ...apt, id, status: 'Upcoming', bookedAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      cancelAppointment: (id) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status: 'Cancelled' } : a
          ),
        })),

      rescheduleAppointment: (id, date, time) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, date, time, status: 'Upcoming' } : a
          ),
        })),
    }),
    { name: 'doctors-store-v1' }
  )
);
