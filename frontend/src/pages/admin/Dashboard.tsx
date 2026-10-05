import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { Settings, Activity, Users, UserCog, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/ui/page-transition';
import { motion } from 'framer-motion';
import { adminService, type AdminStats, type AdminAppointment } from '../../services/admin';

export default function AdminOverview() {
  const user = useAuthStore(state => state.user);
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<AdminAppointment[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [stats, apts] = await Promise.all([
          adminService.getStats(),
          adminService.getAppointments(),
        ]);
        setStatsData(stats);
        setRecentAppointments(apts);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Total Patients', val: statsData?.totalPatients ?? 0, icon: Users, trend: '+12%', to: '/admin/patients', color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Active Doctors', val: statsData?.totalDoctors ?? 0, icon: UserCog, trend: '+2%', to: '/admin/doctors', color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Upcoming Appts', val: statsData?.upcomingAppointments ?? 0, icon: Calendar, trend: 'Scheduled', to: '/admin/appointments', color: 'text-accent bg-accent/10' },
    { label: 'Completed Appts', val: statsData?.completedAppointments ?? 0, icon: Activity, trend: 'Total', to: '/admin/appointments', color: 'text-green-500 bg-green-500/10' },
  ];



  const barData = [30, 45, 25, 60, 50, 80, 75, 90, 85, 100, 95, 110];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <PageTransition>
      <div className="px-8 md:px-12 py-10 max-w-7xl">
        <header className="mb-12">
          <h1 className="text-6xl md:text-7xl font-display font-medium tracking-tight mb-3">
            System Overview
          </h1>
          <p className="text-xl text-muted-foreground">Welcome back, {user?.name}. Here's what's happening.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <Link to={stat.to} className="block group">
                <div className="bg-card border border-border p-8 rounded-3xl hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-4xl font-display font-medium mb-2">{stat.val}</p>
                  <span className="text-xs text-accent font-medium">{stat.trend}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-[2rem] p-10"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-display">Patient Registrations</h3>
                <p className="text-muted-foreground text-sm">Monthly growth this year</p>
              </div>
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            
            <div className="flex items-end gap-2 h-40">
              {barData.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="flex-1 bg-foreground/10 hover:bg-accent transition-colors rounded-t-sm cursor-pointer group relative"
                  style={{ height: `${(h / 110) * 100}%`, transformOrigin: 'bottom' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h} patients
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between text-muted-foreground text-xs mt-3">
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-[2rem] p-10"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-display">System Status</h3>
                <p className="text-muted-foreground text-sm">All services health</p>
              </div>
              <Settings className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {[
                { service: 'Authentication API', status: 'Operational', uptime: '99.9%', color: 'bg-green-500' },
                { service: 'Patient Records DB', status: 'Operational', uptime: '99.8%', color: 'bg-green-500' },
                { service: 'Appointment Scheduler', status: 'Degraded', uptime: '97.2%', color: 'bg-yellow-500' },
                { service: 'Billing Gateway', status: 'Operational', uptime: '99.9%', color: 'bg-green-500' },
                { service: 'Notification Service', status: 'Operational', uptime: '100%', color: 'bg-green-500' },
              ].map((svc, idx) => (
                <motion.div
                  key={svc.service}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.06 }}
                  className="flex justify-between items-center p-4 rounded-xl border border-border hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${svc.color} animate-pulse`}></div>
                    <span className="font-medium text-sm">{svc.service}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{svc.uptime}</span>
                    <span className={`${svc.color === 'bg-green-500' ? 'text-green-600' : 'text-yellow-600'} font-medium`}>{svc.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-[2rem] p-10"
        >
          <h3 className="text-2xl font-display mb-8">Recent Appointments</h3>
          <div className="space-y-4">
            {recentAppointments.slice(0, 5).map((apt) => {
              return (
                <div key={apt.id} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-medium text-sm">
                      {apt.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="font-medium">{apt.patientName}</div>
                      <div className="text-sm text-muted-foreground">with {apt.doctorName} · {apt.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{apt.date}</span>
                    <span className={`px-3 py-1 rounded-full font-medium text-xs ${
                      apt.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                      apt.status === 'Cancelled' ? 'bg-red-500/10 text-red-600' :
                      'bg-accent/10 text-accent'
                    }`}>{apt.status}</span>
                  </div>
                </div>
              );
            })}
            {recentAppointments.length === 0 && (
              <p className="text-muted-foreground py-4">No recent appointments recorded.</p>
            )}
          </div>

        </motion.div>
      </div>
    </PageTransition>
  );
}
