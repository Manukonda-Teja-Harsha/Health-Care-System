import { useState, useEffect, useMemo } from 'react';
import { Pill, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Modal, SuccessModal } from '../../components/ui/modal';
import { toast } from '../../components/ui/toast-store';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/ui/page-transition';
import { doctorService, type DoctorPrescription, type DoctorPatient } from '../../services/doctor';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    medicine: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rxData, ptData] = await Promise.all([
        doctorService.getPrescriptions(),
        doctorService.getPatients(),
      ]);
      setPrescriptions(rxData);
      setPatients(ptData);
    } catch (err: any) {
      console.error('Failed to load prescriptions data:', err);
      toast.error('Failed to load prescriptions', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return prescriptions.filter(p => {
      const matchPatient = p.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMed = p.medicine?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchPatient || matchMed;
    });
  }, [prescriptions, searchTerm]);

  const handleSave = async () => {
    if (!formData.patientId || !formData.medicine) return;
    try {
      setIsSaving(true);
      const created = await doctorService.createPrescription({
        patientId: formData.patientId,
        medication: formData.medicine,
        dosage: formData.dosage || 'As directed',
        frequency: formData.frequency || 'Daily',
        duration: formData.duration || '30 days',
        instructions: formData.instructions || '',
      });
      setPrescriptions(prev => [created, ...prev]);
      setIsCreating(false);
      setShowSuccess(true);
      toast.success('Prescription created');
      setFormData({ patientId: '', medicine: '', dosage: '', frequency: '', duration: '', instructions: '' });
      // Refresh full list in background to ensure all joins match
      doctorService.getPrescriptions().then(setPrescriptions).catch(() => {});
    } catch (err: any) {
      console.error('Failed to create prescription:', err);
      toast.error('Could not create prescription', err.message || 'Error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Prescriptions</h1>
            <p className="text-xl text-muted-foreground">Manage patient medications.</p>
          </div>
          <Button size="lg" className="rounded-xl h-14 gap-2 transition-transform hover:scale-105" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5" /> New Prescription
          </Button>
        </div>

        <div className="mb-8 relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search prescriptions by patient name or medicine..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-card border border-border rounded-full pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
          />
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading prescriptions...</p>
          </div>
        ) : (
          <motion.div layout className="space-y-6">
            <AnimatePresence>
              {filtered.map(p => {
                return (
                  <motion.div 
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-card border border-border rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-foreground">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-medium mb-1">{p.medicine} <span className="text-muted-foreground text-base font-normal">for {p.patientName}</span></h3>
                        <p className="text-accent">{p.dosage} • {p.frequency}{p.duration ? ` • ${p.duration}` : ''}</p>
                        {p.instructions && (
                          <p className="text-sm text-muted-foreground mt-1">{p.instructions}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${p.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                       {p.startDate && (
                         <p className="text-xs text-muted-foreground mt-2">Started: {p.startDate}</p>
                       )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                No prescriptions found.
              </div>
            )}
          </motion.div>
        )}

        <Modal isOpen={isCreating} onClose={() => !isSaving && setIsCreating(false)}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display">Create Prescription</h2>
            <button onClick={() => !isSaving && setIsCreating(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient</label>
              <select value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow">
                <option value="">Select a patient...</option>
                {patients.map(p => <option key={p.patientId || p.id} value={p.patientId || p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Medicine Name</label>
                <input type="text" value={formData.medicine} onChange={e => setFormData({...formData, medicine: e.target.value})} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow" placeholder="e.g., Amoxicillin" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dosage</label>
                <input type="text" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow" placeholder="e.g., 500mg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <input type="text" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow" placeholder="e.g., Twice daily" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow" placeholder="e.g., 7 days" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Special Instructions</label>
              <textarea value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} className="w-full h-24 bg-background border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-shadow" placeholder="Take after meals..."></textarea>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 h-14 rounded-xl" onClick={() => setIsCreating(false)} disabled={isSaving}>Cancel</Button>
              <Button className="flex-1 h-14 rounded-xl" onClick={handleSave} disabled={!formData.patientId || !formData.medicine} isLoading={isSaving}>
                {isSaving ? 'Creating...' : 'Save Prescription'}
              </Button>
            </div>
          </div>
        </Modal>

        <SuccessModal 
          isOpen={showSuccess} 
          onClose={() => setShowSuccess(false)}
          title="Prescription Created"
          message="The new prescription has been added to the patient's records."
        >
          <Button className="w-full rounded-xl h-12" onClick={() => setShowSuccess(false)}>Continue</Button>
        </SuccessModal>
      </div>
    </PageTransition>
  );
}

