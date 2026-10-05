import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Search, ArrowRight, Loader2 } from 'lucide-react';
import { appointmentsService, type Appointment } from '../../services/appointments';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled'>('Upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadDoctorAppointments() {
      try {
        setLoading(true);
        const data = await appointmentsService.getDoctorAppointments();
        setAppointments(data);
      } catch (err) {
        console.error('Failed to load doctor appointments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorAppointments();
  }, []);

  const filtered = appointments.filter(a => {
    const matchesFilter = filter === 'Upcoming' 
      ? (a.status === 'Upcoming' || a.rawStatus === 'PENDING' || a.rawStatus === 'CONFIRMED')
      : a.status === filter || a.rawStatus?.toUpperCase() === filter.toUpperCase();
    const patientName = a.patient?.name || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-medium tracking-tight mb-8">Appointments</h1>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-card border border-border rounded-xl pl-12 pr-4 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex gap-4 border-b border-border/50 pb-4 overflow-x-auto">
          {['Upcoming', 'In Progress', 'Completed', 'Cancelled'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${filter === f ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center items-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-xl">
            No {filter.toLowerCase()} appointments found.
          </div>
        ) : (
          filtered.map(apt => {
            const patientName = apt.patient?.name || 'Patient';
            const patientInitial = patientName.charAt(0).toUpperCase();
            return (
              <Link key={apt.id} to={`/doctor/patients/${apt.patientId}`} className="block group">
                <div className="bg-card border border-border rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group-hover:border-accent transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-display text-xl shrink-0">
                      {patientInitial}
                    </div>
                    <div>
                      <h3 className="text-2xl font-medium mb-1">{patientName}</h3>
                      <p className="text-muted-foreground">{apt.reason || 'General Consultation'} • {apt.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                      <span className="flex items-center gap-2 font-medium mb-1"><Calendar className="w-4 h-4" /> {apt.date}</span>
                      <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> {apt.time}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
