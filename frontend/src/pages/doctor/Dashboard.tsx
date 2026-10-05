import { Users, FileText, Calendar as CalendarIcon, ArrowRight, Search, Activity, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageTransition } from '../../components/ui/page-transition';
import { DoctorBackground } from '../../components/backgrounds/DoctorBackground';
import { doctorService, type DoctorAppointment, type DoctorPatient, type AvailabilitySlot, type DoctorLab } from '../../services/doctor';

export default function DoctorDashboard() {
  const user = useAuthStore(state => state.user);
  const [labs, setLabs] = useState<DoctorLab[]>([]);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    async function loadDoctorData() {
      setIsLoading(true);
      try {
        const [apts, pats, avail, labData] = await Promise.all([
          doctorService.getAppointments(),
          doctorService.getPatients(),
          doctorService.getAvailability(),
          doctorService.getLabs(),
        ]);
        setAppointments(apts);
        setPatients(pats);
        setAvailabilitySlots(avail);
        setLabs(labData);
      } catch (err) {
        console.error('Failed to load doctor dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDoctorData();
  }, []);

  // Filter for doctor's own data
  const myAppointments = appointments.filter(a => {
    const isNotCompleted = a.status !== 'Completed' && a.rawStatus !== 'COMPLETED';
    const patientName = a.patient?.name || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotCompleted && matchesSearch;
  });
  const myLabs = labs.filter(l => l.status !== 'Completed');


  return (
    <PageTransition>
      <div className="relative min-h-full px-6 md:px-12 lg:px-16 py-12 overflow-hidden">
        {/* Layer 0 & 1: Digital Clinical / Medical Technology Animated Background */}
        <DoctorBackground />

        {/* Layer 2: Clinical Workspace Content */}
        <div className="relative z-10">
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tight mb-4">
                Workspace
              </h1>
              <p className="text-xl text-muted-foreground">Dr. {user?.name || 'Doctor'}, here is your schedule for today.</p>
            </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search patients, records..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-card border border-border rounded-full pl-12 pr-4 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Today\'s Patients', value: isLoading ? '-' : myAppointments.length.toString(), icon: Users, path: '/doctor/appointments' },
            { label: 'Pending Reports', value: myLabs.length.toString(), icon: FileText, path: '/doctor/labs' },
            { label: 'Available Slots', value: isLoading ? '-' : (availabilitySlots.length || 4).toString(), icon: CalendarIcon, path: '/doctor/schedule' },
          ].map((stat, idx) => (
             <Link to={stat.path} key={idx} className="bg-card border border-border rounded-[2rem] p-8 flex items-center justify-between group hover:border-foreground transition-colors cursor-pointer">
               <div>
                 <span className="text-muted-foreground block mb-2">{stat.label}</span>
                 <span className="text-4xl font-display font-medium">{stat.value}</span>
               </div>
               <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                 <stat.icon className="w-6 h-6" />
               </div>
             </Link>
          ))}
        </div>

        {/* Schedule */}
        <div className="lg:col-span-2 bg-card border border-border rounded-[2rem] p-10">
          <h2 className="text-3xl font-display mb-10 flex items-center justify-between">
            <span>Schedule</span>
            <Link to="/doctor/appointments" className="text-base text-accent hover:underline font-sans">View All</Link>
          </h2>
          
          <div className="space-y-6">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading schedule...</p>
              </div>
            ) : myAppointments.length === 0 ? (
              <p className="text-muted-foreground">No upcoming appointments.</p>
            ) : (
              myAppointments.map((apt) => {
                const patientName = apt.patient?.name || 'Patient';
                return (
                  <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-border rounded-2xl hover:bg-muted/30 transition-colors gap-4 group">
                    <div className="flex items-center gap-6">
                      <div className="w-24 text-muted-foreground font-medium">{apt.time}</div>
                      <div>
                        <h4 className="text-xl font-medium">{patientName}</h4>
                        <p className="text-muted-foreground">{apt.reason || 'General Consultation'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        apt.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                        apt.status === 'Upcoming' ? 'bg-accent/10 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {apt.status}
                      </span>
                      <Link to={`/doctor/patients/${apt.patientId}`} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-foreground text-background rounded-[2rem] p-10">
          <h2 className="text-3xl font-display mb-10">Recent Labs</h2>
          <div className="space-y-8">
             {labs.slice(0,4).map((lab) => {
               const p = patients.find(p => p.id === lab.patientId);
               return (
                 <Link to="/doctor/labs" key={lab.id} className="block border-b border-background/20 pb-6 last:border-0 group">
                   <h4 className="text-lg font-medium group-hover:text-accent transition-colors mb-1">{lab.patientName || p?.name}</h4>
                   <p className="text-background/60 mb-2">{lab.test || lab.testName}</p>
                   <span className="flex items-center gap-2 text-xs font-mono uppercase">
                     <Activity className="w-3 h-3" /> {lab.status}
                   </span>
                 </Link>
               );
             })}
             {labs.length === 0 && (
               <p className="text-background/50">No recent lab reports.</p>
             )}
          </div>
        </div>

      </div>
      </div>
      </div>
    </PageTransition>
  );
}
