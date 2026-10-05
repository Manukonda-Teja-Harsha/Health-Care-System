import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Video, Calendar, Clock } from 'lucide-react';
import { useAppStore } from '../../store/app';
import { Button } from '../../components/ui/button';
import { SuccessModal } from '../../components/ui/modal';
import { toast } from '../../components/ui/toast-store';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { appointmentsService } from '../../services/appointments';

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const doctor = useAppStore(state => state.doctors.find(d => d.id === id));

  const [bookingStep, setBookingStep] = useState(0); // 0: none, 1: details, 2: success
  const [isBooking, setIsBooking] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Video Consultation');
  const [reason, setReason] = useState('');

  if (!doctor) return <div className="p-12 text-xl text-center">Doctor not found</div>;

  const handleBook = async () => {
    if (date && time && reason) {
      setIsBooking(true);
      try {
        // Map doctor.id to numeric ID if needed, or send as-is
        const doctorNumericId = id?.startsWith('d') ? parseInt(id.replace('d', ''), 10) : parseInt(id || '1', 10);
        await appointmentsService.bookAppointment({
          doctorId: isNaN(doctorNumericId) ? 1 : doctorNumericId,
          appointmentDate: date,
          startTime: time,
          appointmentType: type,
          reason
        });
        setIsBooking(false);
        setBookingStep(2);
        toast.success('Appointment booked successfully');
      } catch (err: any) {
        setIsBooking(false);
        toast.error(err?.message || 'Failed to book appointment. Time slot may already be reserved.');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 md:p-12 lg:p-16 relative"
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 group transition-colors">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Doctors
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center font-display text-4xl shrink-0">{doctor.name.charAt(4)}</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-medium mb-2">{doctor.name}</h1>
              <p className="text-xl text-accent mb-4">{doctor.specialty}</p>
              <div className="flex flex-wrap gap-6 text-muted-foreground">
                <span className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500 fill-current" /> {doctor.rating} ({doctor.reviews} reviews)</span>
                <span className="flex items-center gap-2"><MapPin className="w-5 h-5" /> {doctor.hospital}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-display">About</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{doctor.about}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">Dr. {doctor.name.split(' ').pop()} has {doctor.experience} of experience treating various conditions related to {doctor.specialty.toLowerCase()}.</p>
          </div>
        </div>

        {/* Booking Widget */}
        <div className="bg-card border border-border rounded-[2rem] p-8 h-fit sticky top-24 hover:border-accent/50 transition-colors">
          <h3 className="text-2xl font-display mb-6">Book Consultation</h3>
          <div className="flex justify-between items-end border-b border-border/50 pb-6 mb-6">
            <span className="text-muted-foreground">Consultation Fee</span>
            <span className="text-3xl font-medium">${doctor.fee}</span>
          </div>
          
          <Button size="lg" className="w-full rounded-xl h-14 text-lg" onClick={() => setBookingStep(1)}>
            Select Date & Time
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {bookingStep === 1 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingStep(0)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border shadow-2xl rounded-[2rem] w-full max-w-2xl p-8 md:p-12 relative overflow-hidden z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-display">Confirm Appointment</h2>
                <button onClick={() => setBookingStep(0)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:ring-2 focus:ring-accent outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:ring-2 focus:ring-accent outline-none" required />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Consultation Type</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setType('Video Consultation')} className={cn("flex-1 h-14 rounded-xl border flex items-center justify-center gap-2 transition-colors", type === 'Video Consultation' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:bg-muted')}>
                    <Video className="w-5 h-5" /> Video
                  </button>
                  <button type="button" onClick={() => setType('In-Person')} className={cn("flex-1 h-14 rounded-xl border flex items-center justify-center gap-2 transition-colors", type === 'In-Person' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:bg-muted')}>
                    <MapPin className="w-5 h-5" /> In-Person
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-sm font-medium">Reason for visit</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 focus:ring-2 focus:ring-accent outline-none resize-none h-24 transition-shadow" placeholder="Briefly describe your symptoms..." required></textarea>
              </div>

              <Button size="lg" className="w-full rounded-xl h-14 text-lg" onClick={handleBook} disabled={!date || !time || !reason} isLoading={isBooking}>
                {isBooking ? 'Checking & Booking...' : 'Confirm Booking'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SuccessModal 
        isOpen={bookingStep === 2} 
        onClose={() => setBookingStep(0)} 
        title="Appointment Confirmed" 
        message={`Your appointment with ${doctor.name} is set.`}
      >
        <div className="w-full bg-muted/30 p-6 rounded-2xl border border-border/50 text-left mb-8">
          <div className="font-medium text-lg mb-1">{doctor.name}</div>
          <div className="text-muted-foreground mb-4">{doctor.specialty}</div>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> {date}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> {time}</span>
          </div>
        </div>
        <div className="flex gap-4 w-full">
          <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => navigate('/patient')}>Back to Dashboard</Button>
          <Button className="flex-1 rounded-xl h-12" onClick={() => navigate('/patient/appointments')}>View Appointment</Button>
        </div>
      </SuccessModal>
    </motion.div>
  );
}
