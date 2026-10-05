import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CalendarX2 } from 'lucide-react';
import { appointmentsService, type Appointment } from '../../services/appointments';
import { PageTransition } from '../../components/ui/page-transition';
import { EmptyState } from '../../components/ui/empty-state';
import { motion, AnimatePresence } from 'framer-motion';

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.getPatientAppointments();
      setAppointments(data);
    } catch {
      setError('Unable to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(a => a.status === filter);

  return (
    <PageTransition>
      <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-medium tracking-tight mb-8">Appointments</h1>
          
          <div className="flex gap-4 border-b border-border/50 pb-4 overflow-x-auto relative">
            {['Upcoming', 'Completed', 'Cancelled'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`relative px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${filter === f ? 'text-background' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {filter === f && (
                  <motion.div layoutId="apt-tab-pill" className="absolute inset-0 bg-foreground rounded-full -z-10" />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <button onClick={fetchAppointments} className="px-6 py-2.5 rounded-xl bg-card border border-border hover:border-accent text-sm font-medium transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <motion.div layout className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filtered.map(apt => {
                const docName = apt.doctor?.name || 'Specialist Doctor';
                const docSpecialty = apt.doctor?.specialty || apt.doctor?.department || 'Medical Consultation';
                const avatarChar = docName.replace('Dr. ', '').charAt(0) || 'D';

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={apt.id}
                  >
                    <Link to={`/patient/appointments/${apt.id}`} className="block group">
                      <div className="bg-card border border-border rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group-hover:border-accent transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-display text-xl shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                            {avatarChar}
                          </div>
                          <div>
                            <h3 className="text-2xl font-medium mb-1">{docName}</h3>
                            <p className="text-muted-foreground">{docSpecialty} • {apt.type}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col items-end">
                            <span className="flex items-center gap-2 font-medium mb-1"><Calendar className="w-4 h-4" /> {apt.date}</span>
                            <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> {apt.time}</span>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            apt.status === 'Completed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                            apt.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                            'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'
                          }`}>
                            {apt.status}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filtered.length === 0 && (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState 
                  icon={CalendarX2}
                  title={`No ${filter.toLowerCase()} appointments`}
                  description={filter === 'Upcoming' ? "You don't have any appointments scheduled right now." : `You have no ${filter.toLowerCase()} appointments in your history.`}
                  actionLabel={filter === 'Upcoming' ? "Find a Doctor" : undefined}
                  onAction={filter === 'Upcoming' ? () => navigate('/patient/doctors') : undefined}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
