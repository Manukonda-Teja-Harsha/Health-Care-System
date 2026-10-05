import { useState, useEffect } from 'react';
import { Search, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { toast } from '../../components/ui/toast-store';
import { PageTransition } from '../../components/ui/page-transition';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService, type AdminPatient } from '../../services/admin';

export default function AdminPatients() {
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<AdminPatient | null>(null);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getPatients();
      setPatients(data);
    } catch (err: any) {
      console.error('Failed to load admin patients:', err);
      toast.error('Failed to load patients', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleDeleteUser = async (patient: AdminPatient) => {
    if (!confirm(`Are you sure you want to deactivate/delete ${patient.name}?`)) return;
    try {
      await adminService.deleteUser(patient.userId);
      setPatients(prev => prev.filter(p => p.userId !== patient.userId));
      setSelectedPatient(null);
      toast.success('Patient record processed', `${patient.name} removed/deactivated.`);
    } catch (err: any) {
      console.error('Failed to delete/deactivate patient user:', err);
      toast.error('Action failed', err.message);
    }
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="px-8 md:px-12 py-10 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-medium tracking-tight mb-3">Patients</h1>
          <p className="text-xl text-muted-foreground">{patients.length} registered patients</p>
        </div>

        <div className="mb-8 relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search patients..."
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

        <div className="bg-card border border-border rounded-[2rem] overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p>Loading patient records...</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-6 text-sm font-medium text-muted-foreground">Patient</th>
                    <th className="text-left p-6 text-sm font-medium text-muted-foreground">Age / Gender</th>
                    <th className="text-left p-6 text-sm font-medium text-muted-foreground">Blood Group</th>
                    <th className="text-left p-6 text-sm font-medium text-muted-foreground">Appointments</th>
                    <th className="text-left p-6 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((patient, i) => {
                      return (
                        <motion.tr
                          key={patient.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => setSelectedPatient(patient)}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-medium">
                                {patient.name.charAt(0)}
                              </div>
                              <span className="font-medium">{patient.name}</span>
                            </div>
                          </td>
                          <td className="p-6 text-muted-foreground">{patient.age} • {patient.gender}</td>
                          <td className="p-6">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600">{patient.bloodGroup}</span>
                          </td>
                          <td className="p-6 text-muted-foreground">{patient.appointmentCount}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{patient.status}</span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">No patients match your search.</div>
              )}
            </>
          )}
        </div>

        {/* Patient Detail Modal */}
        <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)}>
          {selectedPatient && (
            <>
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center font-display text-3xl">{selectedPatient.name.charAt(0)}</div>
                  <div>
                    <h2 className="text-3xl font-display mb-1">{selectedPatient.name}</h2>
                    <p className="text-muted-foreground">{selectedPatient.age} years old • {selectedPatient.gender}</p>
                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium ${selectedPatient.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {selectedPatient.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Blood Group', value: selectedPatient.bloodGroup },
                  { label: 'Allergies', value: selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(', ') : 'None' },
                  { label: 'Total Appointments', value: selectedPatient.appointmentCount },
                  { label: 'Emergency Contact', value: selectedPatient.emergencyContact || 'None' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="text-sm text-muted-foreground mb-1">{label}</div>
                    <div className="font-medium">{value}</div>
                  </div>
                ))}
              </div>

              {selectedPatient.address && (
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 mb-6">
                  <div className="text-sm text-muted-foreground mb-1">Address</div>
                  <div className="font-medium text-sm">{selectedPatient.address}</div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl text-red-500 border-red-500/30 hover:bg-red-500/10 gap-2"
                  onClick={() => handleDeleteUser(selectedPatient)}
                >
                  <Trash2 className="w-4 h-4" /> Deactivate / Delete User
                </Button>
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setSelectedPatient(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
}

