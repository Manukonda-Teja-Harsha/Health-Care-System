import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { PageTransition } from '../../components/ui/page-transition';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService, type AdminAppointment } from '../../services/admin';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    async function loadAppointments() {
      try {
        setIsLoading(true);
        const data = await adminService.getAppointments();
        setAppointments(data);
      } catch (err) {
        console.error('Failed to load admin appointments:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAppointments();
  }, []);

  const filtered = appointments.filter(a => {
    const matchSearch = !searchTerm ||
      a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    All: appointments.length,
    Upcoming: appointments.filter(a => a.status === 'Upcoming').length,
    Completed: appointments.filter(a => a.status === 'Completed').length,
    Cancelled: appointments.filter(a => a.status === 'Cancelled').length,
  };


  return (
    <PageTransition>
      <div className="px-8 md:px-12 py-10 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-medium tracking-tight mb-3">Appointments</h1>
          <p className="text-xl text-muted-foreground">{appointments.length} total appointments across all doctors</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search by doctor or patient..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-card border border-border rounded-full pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {Object.entries(counts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === status ? 'bg-foreground text-background' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
              >
                {status} ({count})
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading appointments...</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[2rem] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">

                <th className="text-left p-6 text-sm font-medium text-muted-foreground">Patient</th>
                <th className="text-left p-6 text-sm font-medium text-muted-foreground">Doctor</th>
                <th className="text-left p-6 text-sm font-medium text-muted-foreground">Date / Time</th>
                <th className="text-left p-6 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-6 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((apt, i) => {
                  return (
                    <motion.tr
                      key={apt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                            {apt.patientName?.charAt(0) || 'P'}
                          </div>
                          <span className="font-medium">{apt.patientName}</span>
                        </div>
                      </td>
                      <td className="p-6 text-muted-foreground">{apt.doctorName}</td>
                      <td className="p-6 text-sm">
                        <div className="font-medium">{apt.date}</div>
                        <div className="text-muted-foreground">{apt.time}</div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">{apt.type}</span>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                          apt.status === 'Cancelled' ? 'bg-red-500/10 text-red-600' :
                          'bg-accent/10 text-accent'
                        }`}>{apt.status}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">No appointments match your filters.</div>
          )}
        </div>
        )}
      </div>
    </PageTransition>
  );
}

