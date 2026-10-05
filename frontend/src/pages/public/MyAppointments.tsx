// ── My Appointments Page ─────────────────────────────────────────────────────
// Route: /my-appointments — public, no auth required
// Shows public booking appointments stored in useDoctorsStore (localStorage)

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, X, RefreshCw, CheckCircle2,
  ChevronRight, ArrowLeft, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { DOCTORS } from '../../data/doctors';
import type { Doctor, DayKey } from '../../data/doctors';
import { useDoctorsStore } from '../../store/doctors';
import type { PublicAppointment } from '../../store/doctors';
import { toast } from '../../components/ui/toast-store';

function getDoctorById(id: string): Doctor | undefined {
  return DOCTORS.find(d => d.id === id);
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getAvailableDates(doc: Doctor) {
  const dates: { iso: string; label: string; dayKey: DayKey }[] = [];
  const today = new Date();
  const availDays = Object.keys(doc.availability) as DayKey[];
  for (let i = 1; i < 30 && dates.length < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() as DayKey;
    if (availDays.includes(dayName)) {
      dates.push({
        iso: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        dayKey: dayName,
      });
    }
  }
  return dates;
}

type TabKey = 'Upcoming' | 'Completed' | 'Cancelled';

export default function MyAppointments() {
  const { appointments, cancelAppointment, rescheduleAppointment } = useDoctorsStore();

  const [tab,            setTab]            = useState<TabKey>('Upcoming');
  const [cancelTarget,   setCancelTarget]   = useState<PublicAppointment | null>(null);
  const [reschedTarget,  setReschedTarget]  = useState<PublicAppointment | null>(null);

  // Reschedule state
  const [reschedDate,    setReschedDate]    = useState('');
  const [reschedDayKey,  setReschedDayKey]  = useState<DayKey | null>(null);
  const [reschedTime,    setReschedTime]    = useState('');
  const [reschedSuccess, setReschedSuccess] = useState(false);

  const filtered = appointments.filter(a => {
    if (tab === 'Upcoming')   return a.status === 'Upcoming' || a.status === 'Rescheduled';
    if (tab === 'Completed')  return a.status === 'Completed';
    if (tab === 'Cancelled')  return a.status === 'Cancelled';
    return false;
  });

  const handleCancel = () => {
    if (!cancelTarget) return;
    cancelAppointment(cancelTarget.id);
    toast.info('Appointment cancelled.');
    setCancelTarget(null);
  };

  const handleReschedule = () => {
    if (!reschedTarget || !reschedDate || !reschedTime) return;
    rescheduleAppointment(reschedTarget.id, reschedDate, reschedTime);
    setReschedSuccess(true);
    toast.success('Appointment rescheduled.');
  };

  const closeResched = () => {
    setReschedTarget(null);
    setReschedDate('');
    setReschedDayKey(null);
    setReschedTime('');
    setReschedSuccess(false);
  };

  const tabCounts: Record<TabKey, number> = {
    Upcoming:  appointments.filter(a => a.status === 'Upcoming' || a.status === 'Rescheduled').length,
    Completed: appointments.filter(a => a.status === 'Completed').length,
    Cancelled: appointments.filter(a => a.status === 'Cancelled').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Doctors
          </Link>
          <h1 className="text-5xl font-display font-medium tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground mt-2">Manage and track your booked appointments.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {(['Upcoming', 'Completed', 'Cancelled'] as TabKey[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                tab === t ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t}
              {tabCounts[t] > 0 && (
                <span className={cn('w-5 h-5 rounded-full text-xs flex items-center justify-center',
                  tab === t ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                )}>
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-2xl font-display mb-3">No {tab.toLowerCase()} appointments</h3>
            <p className="text-muted-foreground mb-6">
              {tab === 'Upcoming'
                ? 'Browse our doctors and book your first appointment.'
                : `You have no ${tab.toLowerCase()} appointments yet.`}
            </p>
            <Link to="/doctors"><Button>Find a Doctor</Button></Link>
          </div>
        )}

        {/* Appointment cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((apt, i) => {
              const doc = getDoctorById(apt.doctorId);
              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-[2rem] p-8"
                >
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Doctor avatar */}
                    {doc && (
                      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white font-display font-semibold text-base shrink-0', doc.avatarColor)}>
                        {doc.avatar}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{apt.doctorName}</h3>
                          <p className="text-accent text-sm font-medium">{apt.specialty}</p>
                        </div>
                        <StatusBadge status={apt.status} />
                      </div>
                      {/* Appointment details */}
                      <div className="flex flex-wrap gap-5 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(apt.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {apt.time}
                        </span>
                        <span className="flex items-center gap-1.5 capitalize">
                          {apt.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium text-foreground">Reason:</span> {apt.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {(apt.status === 'Upcoming' || apt.status === 'Rescheduled') && (
                    <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-border">
                      <Link to={`/doctors/${apt.doctorId}`}>
                        <Button variant="ghost" className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm">
                          View Doctor <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm"
                        onClick={() => { setReschedTarget(apt); setReschedSuccess(false); }}
                      >
                        <RefreshCw className="w-4 h-4" /> Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm border-red-500/40 text-red-500 hover:bg-red-500/5"
                        onClick={() => setCancelTarget(apt)}
                      >
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Cancel Confirmation Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {cancelTarget && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCancelTarget(null)} />
            <motion.div
              className="relative bg-card border border-border rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center z-10"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-display mb-2">Cancel Appointment?</h3>
              <p className="text-muted-foreground text-sm mb-2">{cancelTarget.doctorName}</p>
              <p className="text-muted-foreground text-sm mb-8">
                {formatDate(cancelTarget.date)} · {cancelTarget.time}
              </p>
              <div className="space-y-3">
                <Button className="w-full h-11 rounded-xl" variant="outline" onClick={() => setCancelTarget(null)}>
                  Keep Appointment
                </Button>
                <Button
                  className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white border-0"
                  onClick={handleCancel}
                >
                  Cancel Appointment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reschedule Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {reschedTarget && (() => {
          const doc = getDoctorById(reschedTarget.doctorId);
          const availDates = doc ? getAvailableDates(doc) : [];
          const daySchedule = doc && reschedDayKey ? doc.availability[reschedDayKey] : null;
          const freeSlots = daySchedule ? daySchedule.slots.filter(s => !daySchedule.bookedSlots.includes(s)) : [];

          return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <motion.div className="absolute inset-0 bg-background/70 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={reschedSuccess ? closeResched : undefined} />
              <motion.div
                className="relative bg-card border border-border rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto sidebar-no-scroll z-10"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {reschedSuccess ? (
                  <div className="p-10 flex flex-col items-center text-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-medium mb-2">Rescheduled!</h3>
                      <p className="text-muted-foreground text-sm">
                        {reschedTarget.doctorName}<br />
                        {formatDate(reschedDate)} at {reschedTime}
                      </p>
                    </div>
                    <Button className="w-full h-11 rounded-xl" onClick={closeResched}>Done</Button>
                  </div>
                ) : (
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-display font-medium">Reschedule</h3>
                        <p className="text-muted-foreground text-sm mt-1">{reschedTarget.doctorName}</p>
                      </div>
                      <button onClick={closeResched} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Date selection */}
                    <div>
                      <p className="text-sm font-medium mb-3">Choose new date</p>
                      <div className="grid grid-cols-2 gap-2">
                        {availDates.map(d => (
                          <button key={d.iso} onClick={() => { setReschedDate(d.iso); setReschedDayKey(d.dayKey); setReschedTime(''); }}
                            className={cn('p-3 rounded-xl border text-left text-sm transition-colors',
                              reschedDate === d.iso ? 'border-accent bg-accent/8 text-accent' : 'border-border hover:border-foreground'
                            )}>
                            <p className="text-xs text-muted-foreground">{d.dayKey}</p>
                            <p className="font-medium">{d.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time slots */}
                    {reschedDate && (
                      <div>
                        <p className="text-sm font-medium mb-3">Choose time</p>
                        <div className="grid grid-cols-3 gap-2">
                          {freeSlots.map(slot => (
                            <button key={slot} onClick={() => setReschedTime(slot)}
                              className={cn('py-2.5 rounded-xl border text-xs font-medium transition-colors',
                                reschedTime === slot ? 'border-accent bg-accent/8 text-accent' : 'border-border hover:border-foreground'
                              )}>
                              {slot}
                            </button>
                          ))}
                          {freeSlots.length === 0 && <p className="col-span-3 text-sm text-muted-foreground text-center py-4">No slots available on this day.</p>}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full h-11 rounded-xl"
                      disabled={!reschedDate || !reschedTime}
                      onClick={handleReschedule}
                    >
                      Confirm Reschedule
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: PublicAppointment['status'] }) {
  const map: Record<PublicAppointment['status'], string> = {
    Upcoming:    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Rescheduled: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Completed:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Cancelled:   'bg-red-500/10 text-red-500',
  };
  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold shrink-0', map[status])}>
      {status}
    </span>
  );
}
