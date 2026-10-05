// ── 6-Step Appointment Booking Modal ─────────────────────────────────────────
// Fully functional: type → date → time → details → review → success
// Persists appointments to useDoctorsStore (localStorage-backed Zustand)

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, X, ChevronLeft, ChevronRight, Calendar, Clock, User, Video, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import type { Doctor, DayKey } from '../../data/doctors';
import { useAuthStore } from '../../store/auth';
import { appointmentsService } from '../../services/appointments';
import { toast } from '../ui/toast-store';

const DAY_LABELS: Record<DayKey, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday',
  THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday',
};

// Generate next 14 days that match a doctor's availability schedule
function getAvailableDates(availability: Doctor['availability']) {
  const dates: { iso: string; label: string; dayKey: DayKey }[] = [];
  const availDays = Object.keys(availability) as DayKey[];
  const today = new Date();

  for (let i = 0; i < 30 && dates.length < 14; i++) {
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

interface Props {
  doctor: Doctor;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { num: 1, label: 'Type' },
  { num: 2, label: 'Date' },
  { num: 3, label: 'Time' },
  { num: 4, label: 'Details' },
  { num: 5, label: 'Review' },
];

export function BookingModal({ doctor, onClose }: Props) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<'In-Person' | 'Video Consultation'>('In-Person');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDayKey, setSelectedDayKey] = useState<DayKey | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName]   = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [reason, setReason] = useState('');
  const [bookedId, setBookedId] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const availableDates = useMemo(() => getAvailableDates(doctor.availability), [doctor.id]);

  const daySchedule = selectedDayKey ? doctor.availability[selectedDayKey] : null;
  const freeSlots  = daySchedule ? daySchedule.slots.filter(s => !daySchedule.bookedSlots.includes(s)) : [];

  const canNext = () => {
    if (isBooking) return false;
    if (step === 1) return doctor.consultationTypes.includes(type);
    if (step === 2) return !!selectedDate;
    if (step === 3) return !!selectedTime;
    if (step === 4) return name.trim() && phone.trim() && email.trim() && reason.trim();
    return true;
  };

  const handleNext = () => {
    if (step < 5) setStep((s) => (s + 1) as Step);
    else handleConfirm();
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in as a patient to complete your appointment booking.');
      onClose();
      navigate('/login', { state: { from: `/doctors/${doctor.id}` } });
      return;
    }

    if (user?.role !== 'patient') {
      toast.error('Only patient accounts can book appointments.');
      return;
    }

    setIsBooking(true);
    try {
      const res = await appointmentsService.bookAppointment({
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        appointmentType: type,
        reason: reason || 'Consultation',
      });

      setBookedId(String(res?.id || res?.data?.id || Math.floor(1000 + Math.random() * 9000)));
      setStep(6);
      toast.success('Appointment booked successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to book appointment. Please try another slot.');
    } finally {
      setIsBooking(false);
    }
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={step < 6 ? undefined : onClose}
      />

      {/* Modal panel */}
      <motion.div
        className="relative bg-card border border-border rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col z-10"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        {step < 6 && (
          <div className="flex-shrink-0 px-8 pt-8 pb-4">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display font-medium">Book Appointment</h2>
                <p className="text-sm text-muted-foreground mt-1">{doctor.name} · {doctor.specialty}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex items-center gap-1">
                  <div className={cn(
                    'w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all',
                    step > s.num
                      ? 'bg-accent text-white'
                      : step === s.num
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground'
                  )}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('h-[2px] flex-1 min-w-[16px] rounded transition-colors', step > s.num ? 'bg-accent' : 'bg-border')} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto sidebar-no-scroll px-8 pb-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepPane key="1">
                <StepTitle>Choose consultation type</StepTitle>
                <div className="space-y-3 mt-6">
                  {(['In-Person', 'Video Consultation'] as const).map((t) => {
                    const supported = doctor.consultationTypes.includes(t);
                    return (
                      <button
                        key={t}
                        disabled={!supported}
                        onClick={() => setType(t)}
                        className={cn(
                          'w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left',
                          !supported && 'opacity-40 cursor-not-allowed',
                          type === t && supported
                            ? 'border-accent bg-accent/8 text-accent'
                            : 'border-border hover:border-foreground'
                        )}
                      >
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', type === t ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground')}>
                          {t === 'In-Person' ? <MapPin className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t === 'In-Person'
                              ? `${doctor.location.building} · ${doctor.location.room}`
                              : 'Secure video link sent after booking'}
                          </p>
                          {!supported && <p className="text-xs text-muted-foreground mt-1">Not offered by this doctor</p>}
                        </div>
                        {type === t && supported && <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs">✓</div>}
                      </button>
                    );
                  })}
                </div>
              </StepPane>
            )}

            {step === 2 && (
              <StepPane key="2">
                <StepTitle>Choose date</StepTitle>
                <p className="text-sm text-muted-foreground mt-1">Showing dates when {doctor.name.split(' ')[1]} is available</p>
                <div className="grid grid-cols-2 gap-2 mt-6">
                  {availableDates.map((d) => (
                    <button
                      key={d.iso}
                      onClick={() => { setSelectedDate(d.iso); setSelectedDayKey(d.dayKey); setSelectedTime(''); }}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all',
                        selectedDate === d.iso
                          ? 'border-accent bg-accent/8 text-accent'
                          : 'border-border hover:border-foreground'
                      )}
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{DAY_LABELS[d.dayKey]}</p>
                      <p className="font-semibold mt-1">{d.label}</p>
                      {doctor.availability[d.dayKey] && (
                        <p className="text-xs text-muted-foreground mt-1">{doctor.availability[d.dayKey]!.label}</p>
                      )}
                    </button>
                  ))}
                  {availableDates.length === 0 && (
                    <p className="col-span-2 text-muted-foreground text-sm py-8 text-center">No available dates in the next 30 days.</p>
                  )}
                </div>
              </StepPane>
            )}

            {step === 3 && (
              <StepPane key="3">
                <StepTitle>Choose a time slot</StepTitle>
                <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
                <div className="grid grid-cols-3 gap-2 mt-6">
                  {daySchedule?.slots.map((slot) => {
                    const booked = daySchedule.bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() => setSelectedTime(slot)}
                        className={cn(
                          'py-3 rounded-xl border text-sm font-medium transition-all',
                          booked && 'opacity-40 cursor-not-allowed line-through',
                          selectedTime === slot && !booked
                            ? 'border-accent bg-accent/8 text-accent'
                            : !booked && 'border-border hover:border-foreground'
                        )}
                      >
                        {slot}
                        {booked && <span className="block text-[10px] text-muted-foreground">Booked</span>}
                      </button>
                    );
                  })}
                </div>
                {freeSlots.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm mt-6">All slots are booked for this day. Please choose another date.</p>
                )}
              </StepPane>
            )}

            {step === 4 && (
              <StepPane key="4">
                <StepTitle>Your details</StepTitle>
                <div className="space-y-4 mt-6">
                  {[
                    { label: 'Full Name *', value: name, onChange: setName, type: 'text', placeholder: 'John Smith' },
                    { label: 'Phone *', value: phone, onChange: setPhone, type: 'tel', placeholder: '+1 (555) 000-0000' },
                    { label: 'Email *', value: email, onChange: setEmail, type: 'email', placeholder: 'john@example.com' },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                      <input
                        required
                        type={f.type}
                        placeholder={f.placeholder}
                        value={f.value}
                        onChange={(e) => f.onChange(e.target.value)}
                        className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Reason for Visit *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Brief description of your symptoms or concern…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                </div>
              </StepPane>
            )}

            {step === 5 && (
              <StepPane key="5">
                <StepTitle>Review & Confirm</StepTitle>
                <div className="mt-6 space-y-3 bg-muted/30 border border-border rounded-2xl p-6 text-sm">
                  {[
                    { icon: <User className="w-4 h-4" />, label: 'Doctor', value: `${doctor.name} · ${doctor.specialty}` },
                    { icon: type === 'In-Person' ? <MapPin className="w-4 h-4" /> : <Video className="w-4 h-4" />, label: 'Type', value: type },
                    { icon: <Calendar className="w-4 h-4" />, label: 'Date', value: formattedDate },
                    { icon: <Clock className="w-4 h-4" />, label: 'Time', value: selectedTime },
                    { icon: <User className="w-4 h-4" />, label: 'Patient', value: name },
                    { icon: <User className="w-4 h-4" />, label: 'Reason', value: reason },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <div className="text-muted-foreground mt-0.5">{row.icon}</div>
                      <div>
                        <p className="text-xs text-muted-foreground">{row.label}</p>
                        <p className="font-medium text-sm">{row.value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-muted-foreground">Consultation fee</span>
                    <span className="font-display font-semibold text-lg">${doctor.fee}</span>
                  </div>
                </div>
              </StepPane>
            )}

            {step === 6 && (
              <StepPane key="6">
                <div className="flex flex-col items-center text-center gap-6 py-8">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-3xl font-display font-medium mb-2">Appointment Confirmed!</h2>
                    <p className="text-muted-foreground">
                      {doctor.name} · {doctor.specialty}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="bg-muted/40 border border-border rounded-2xl p-6 w-full text-left space-y-2.5 text-sm"
                  >
                    <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold">{formattedDate}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-semibold">{selectedTime}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-semibold">{type}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-semibold">{name}</span></div>
                    {type === 'In-Person' && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-semibold">{doctor.location.room}</span></div>
                    )}
                    <div className="pt-2 border-t border-border flex justify-between">
                      <span className="text-muted-foreground">Booking ID</span>
                      <span className="font-mono text-xs">{bookedId.toUpperCase()}</span>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="w-full space-y-2">
                    <Button
                      className="w-full h-12 rounded-xl"
                      onClick={() => {
                        onClose();
                        navigate(user?.role === 'patient' ? '/patient/appointments' : '/my-appointments');
                      }}
                    >
                      View My Appointments
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-xl" onClick={onClose}>
                      Back to Doctors
                    </Button>
                  </motion.div>
                </div>
              </StepPane>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        {step < 6 && (
          <div className="flex-shrink-0 px-8 pb-8 pt-2 flex items-center gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="h-12 rounded-xl px-5 flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canNext()}
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2"
            >
              {step === 5 ? (
                isBooking ? 'Booking...' : 'Confirm Appointment'
              ) : (
                <><span>Continue</span><ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StepPane({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="pt-2"
    >
      {children}
    </motion.div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}
