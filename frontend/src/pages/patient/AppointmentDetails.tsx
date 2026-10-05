import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Video, MapPin, FileText } from 'lucide-react';
import { appointmentsService, type Appointment } from '../../services/appointments';
import { Button } from '../../components/ui/button';
import { toast } from '../../components/ui/toast-store';

export default function AppointmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const fetchAppointment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await appointmentsService.getPatientAppointments();
      const found = all.find(a => String(a.id) === String(id));
      if (found) {
        setAppointment(found);
      } else {
        setError('Appointment not found.');
      }
    } catch {
      setError('Failed to load appointment details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleCancel = async () => {
    if (!appointment) return;
    setIsCancelling(true);
    try {
      await appointmentsService.cancelAppointment(appointment.id);
      toast.success('Appointment cancelled successfully.');
      setAppointment(prev => prev ? { ...prev, status: 'Cancelled', rawStatus: 'CANCELLED' } : null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel appointment.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!appointment || !newDate || !newTime) return;
    setIsSubmittingReschedule(true);
    try {
      const res = await appointmentsService.rescheduleAppointment(appointment.id, {
        appointmentDate: newDate,
        startTime: newTime,
      });
      toast.success('Appointment rescheduled successfully.');
      setIsRescheduling(false);
      setAppointment(prev => prev ? {
        ...prev,
        date: res?.date || newDate,
        time: res?.time || newTime,
        status: 'Upcoming',
      } : null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reschedule. Slot may already be booked.');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">Loading appointment details...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="p-12 text-xl text-center">
        <p className="text-red-500 mb-4">{error || 'Appointment not found'}</p>
        <Button onClick={() => navigate('/patient/appointments')} variant="outline">
          ← Back to Appointments
        </Button>
      </div>
    );
  }

  const docName = appointment.doctor?.name || 'Specialist Physician';
  const docSpecialty = appointment.doctor?.specialty || appointment.doctor?.department || 'Medical Care';
  const hospitalLocation = appointment.doctor?.hospital || 'City General Hospital';
  const avatarChar = docName.replace('Dr. ', '').charAt(0) || 'D';

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-4xl relative">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12">
        <ArrowLeft className="w-5 h-5" /> Back to Appointments
      </button>

      <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm">
        <div className="flex justify-between items-start mb-12 border-b border-border/50 pb-8">
          <div>
            <h1 className="text-4xl font-display font-medium mb-4">Consultation Details</h1>
            <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-medium ${
              appointment.status === 'Completed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
              appointment.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
              'bg-accent/10 text-accent'
            }`}>
              {appointment.status}
            </div>
          </div>
          
          {appointment.type === 'Video Consultation' && appointment.status === 'Upcoming' && (
            <Button size="lg" className="rounded-xl gap-2 h-14">
              <Video className="w-5 h-5" /> Join Consultation
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-8">
            <div>
              <span className="text-muted-foreground block mb-2">Doctor</span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-display">{avatarChar}</div>
                <div>
                  <div className="font-medium text-xl">{docName}</div>
                  <div className="text-muted-foreground">{docSpecialty}</div>
                </div>
              </div>
            </div>

            <div>
               <span className="text-muted-foreground block mb-2">Reason for Visit</span>
               <div className="flex items-start gap-3">
                 <FileText className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                 <p className="text-lg">{appointment.reason || 'General checkup'}</p>
               </div>
            </div>
          </div>

          <div className="space-y-8 bg-muted/30 p-8 rounded-2xl border border-border/50">
            <div>
              <span className="text-muted-foreground block mb-2">Date & Time</span>
              <div className="flex items-center gap-6 text-lg font-medium">
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-accent" /> {appointment.date}</span>
                <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-accent" /> {appointment.time}</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block mb-2">Location</span>
              <div className="flex items-center gap-3 text-lg font-medium">
                {appointment.type === 'Video Consultation' ? (
                  <><Video className="w-5 h-5 text-accent" /> Online Video Link</>
                ) : (
                  <><MapPin className="w-5 h-5 text-accent" /> {hospitalLocation}</>
                )}
              </div>
            </div>
          </div>
        </div>

        {appointment.status === 'Upcoming' && (
          <div className="flex gap-4 border-t border-border/50 pt-8">
            <Button variant="outline" size="lg" className="rounded-xl border-border" onClick={() => setIsRescheduling(true)}>
              Reschedule
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500" 
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </div>
        )}
      </div>

      {isRescheduling && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] w-full max-w-md p-8 relative overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display">Reschedule</h2>
              <button onClick={() => setIsRescheduling(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Date</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:ring-2 focus:ring-accent outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Time</label>
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:ring-2 focus:ring-accent outline-none" required />
              </div>
              <Button 
                size="lg" 
                className="w-full rounded-xl h-14 text-lg mt-4" 
                onClick={handleReschedule} 
                disabled={!newDate || !newTime || isSubmittingReschedule}
              >
                {isSubmittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
