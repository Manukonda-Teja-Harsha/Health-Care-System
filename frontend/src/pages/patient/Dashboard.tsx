import { Activity, Heart, Moon, Wind, Clock, ArrowRight, Pill } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { PatientBackground } from '../../components/backgrounds/PatientBackground';
import { PageTransition } from '../../components/ui/page-transition';
import { appointmentsService, type Appointment } from '../../services/appointments';
import { patientService, type Prescription } from '../../services/patient';

export default function PatientDashboard() {
  const user = useAuthStore(state => state.user);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [apts, rxs] = await Promise.all([
          appointmentsService.getPatientAppointments(),
          patientService.getPrescriptions(),
        ]);
        setAppointments(apts);
        setPrescriptions(rxs);
      } catch (err) {
        console.error('Failed to load patient dashboard data:', err);
      }
    }
    loadDashboardData();
  }, []);
  
  const upcomingAppointments = appointments
    .filter(a => a.status === 'Upcoming' || a.rawStatus === 'PENDING' || a.rawStatus === 'CONFIRMED')
    .slice(0, 2);
  const activePrescriptions = prescriptions.filter(p => p.status === 'Active');

  const handleMarkTaken = (id: string) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, takenToday: true } : p));
  };

  return (
    <PageTransition>
      <div className="relative min-h-full px-6 md:px-12 lg:px-24 py-12 overflow-hidden">
        {/* Layer 0 & 1: Cinematic Patient Healthcare Background & Adaptive Overlays */}
        <PatientBackground />

        {/* Layer 2: Dashboard Content */}
        <div className="relative z-10">
          <header className="mb-20">
            <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tight mb-4">
              Hello, {user?.name || 'Patient'}
            </h1>
            <p className="text-xl text-muted-foreground">Here is your health overview.</p>
          </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-card border border-border rounded-[2rem] p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden group hover:border-accent transition-colors cursor-pointer">
            <Link to="/patient/health" className="absolute inset-0 z-20"></Link>
            <div className="z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent"><Heart /></div>
                 <span className="font-medium text-lg tracking-wide uppercase">Cardio Health</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-medium mb-4">72 <span className="text-3xl text-muted-foreground">bpm</span></h2>
              <p className="text-muted-foreground text-lg">Resting heart rate is optimal.</p>
            </div>
            <div className="w-full md:w-1/2 h-40 flex items-end gap-2 z-10 pointer-events-none">
              {[40, 60, 45, 80, 50, 70, 40].map((h, i) => (
                <div key={i} className="flex-1 bg-accent/20 rounded-t-lg transition-all duration-500 group-hover:bg-accent" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-1000"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/patient/health" className="bg-card border border-border rounded-[2rem] p-8 hover:border-accent transition-colors">
              <div className="flex items-center justify-between mb-8">
                <span className="text-muted-foreground">Sleep</span>
                <Moon className="text-muted-foreground" />
              </div>
              <div className="text-4xl font-display font-medium">7h 20m</div>
            </Link>
            <Link to="/patient/health" className="bg-card border border-border rounded-[2rem] p-8 hover:border-accent transition-colors">
              <div className="flex items-center justify-between mb-8">
                <span className="text-muted-foreground">Activity</span>
                <Activity className="text-muted-foreground" />
              </div>
              <div className="text-4xl font-display font-medium">2,400 <span className="text-lg text-muted-foreground">kcal</span></div>
            </Link>
            <Link to="/patient/health" className="bg-card border border-border rounded-[2rem] p-8 hover:border-accent transition-colors">
              <div className="flex items-center justify-between mb-8">
                <span className="text-muted-foreground">Oxygen</span>
                <Wind className="text-muted-foreground" />
              </div>
              <div className="text-4xl font-display font-medium">98%</div>
            </Link>
          </div>

          {/* Medications Today */}
          {activePrescriptions.length > 0 && (
            <div className="bg-card border border-border rounded-[2rem] p-10">
              <h3 className="text-2xl font-display mb-8">Medication Today</h3>
              <div className="space-y-4">
                {activePrescriptions.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground"><Pill className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-medium text-lg">{p.medicine}</h4>
                        <p className="text-muted-foreground text-sm">{p.dosage} • {p.frequency}</p>
                      </div>
                    </div>
                    <Button 
                      variant={p.takenToday ? 'default' : 'outline'} 
                      onClick={() => handleMarkTaken(p.id)}
                      disabled={p.takenToday}
                      className={p.takenToday ? 'bg-green-500 hover:bg-green-600 text-white border-none' : ''}
                    >
                      {p.takenToday ? 'Taken' : 'Mark Taken'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-foreground text-background rounded-[2rem] p-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-display mb-8">Upcoming</h3>
              
              <div className="space-y-6">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt, i) => {
                    const doctorName = apt.doctor?.name || 'Doctor';
                    const dateObj = new Date(apt.date);
                    const month = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleString('default', { month: 'short' });
                    const day = isNaN(dateObj.getTime()) ? apt.date : dateObj.getDate();
                    
                    return (
                      <Link to={`/patient/appointments/${apt.id}`} key={apt.id} className={`flex gap-4 group ${i > 0 ? 'opacity-80 hover:opacity-100' : ''}`}>
                        <div className="w-14 h-14 bg-background/10 rounded-2xl flex flex-col items-center justify-center shrink-0 group-hover:bg-background/20 transition-colors">
                          <span className="text-xs font-bold uppercase">{month}</span>
                          <span className="text-xl font-display">{day}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-medium mb-1 group-hover:text-accent transition-colors">{doctorName}</h4>
                          <p className="text-background/60 flex items-center gap-2"><Clock className="w-4 h-4" /> {apt.time}</p>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <p className="text-background/60">No upcoming appointments.</p>
                )}
              </div>
            </div>
            
            <Link to="/patient/appointments" className="flex items-center justify-between w-full mt-12 py-4 border-t border-background/20 group hover:border-background/40 transition-colors">
              <span className="text-lg">All Appointments</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      </div>
      </div>
    </PageTransition>
  );
}
