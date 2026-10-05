import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, FileText, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/app';
import { Button } from '../../components/ui/button';
import { SuccessModal } from '../../components/ui/modal';
import { toast } from '../../components/ui/toast-store';
import { motion, AnimatePresence } from 'framer-motion';
import { doctorService, type DoctorPatient } from '../../services/doctor';

export default function DoctorPatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const storePatient = useAppStore(state => state.patients.find(p => p.id === id));
  const [patient, setPatient] = useState<DoctorPatient | any>(storePatient || null);
  const [isLoading, setIsLoading] = useState(!storePatient);
  const { appointments, prescriptions, labs, updateAppointmentStatus, addNote } = useAppStore();

  useEffect(() => {
    async function loadPatient() {
      if (!patient) {
        setIsLoading(true);
        try {
          const list = await doctorService.getPatients();
          const found = list.find(p => String(p.id) === String(id) || String(p.patientId) === String(id));
          if (found) {
            setPatient(found);
          }
        } catch (err) {
          console.error('Failed to load patient:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadPatient();
  }, [id, patient]);
  
  const [activeTab, setActiveTab] = useState<'Overview' | 'Consultation'>('Overview');
  const [isConsulting, setIsConsulting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  if (isLoading) {
    return (
      <div className="p-24 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-lg">Loading patient details...</p>
      </div>
    );
  }

  if (!patient) return <div className="p-12 text-center text-xl">Patient not found</div>;

  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
  const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id);
  const patientLabs = labs.filter(l => l.patientId === patient.id);
  
  const activeAppointment = patientAppointments.find(a => a.status === 'Upcoming' || a.status === 'In Progress');

  const handleCompleteConsultation = async () => {
    setIsConsulting(true);
    try {
      if (activeAppointment) {
        updateAppointmentStatus(activeAppointment.id, 'Completed');
      }
      await doctorService.createRecord({
        patientId: patient.patientId || patient.id,
        appointmentId: activeAppointment?.id,
        title: diagnosis || 'General Consultation',
        description: notes,
      });
      addNote({
        doctorId: 'd1',
        patientId: patient.id,
        title: diagnosis || 'General Consultation',
        content: notes,
        date: new Date().toISOString().split('T')[0]
      });
      setShowSuccess(true);
      toast.success('Consultation Completed', 'Patient records have been updated.');
    } catch (err: any) {
      console.error('Failed to save consultation record:', err);
      toast.error('Failed to complete consultation', err.message || 'Error occurred');
    } finally {
      setIsConsulting(false);
    }
  };


  const closeSuccess = () => {
    setShowSuccess(false);
    setActiveTab('Overview');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 md:p-12 lg:p-16 max-w-6xl relative"
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 group transition-colors">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Patients
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center font-display text-4xl shrink-0 text-foreground">
          {patient.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-medium mb-2">{patient.name}</h1>
              <p className="text-xl text-muted-foreground mb-4">{patient.age} years • {patient.gender}</p>
            </div>
            {activeAppointment && activeTab === 'Overview' && (
              <Button size="lg" className="rounded-xl h-14" onClick={() => setActiveTab('Consultation')}>
                Start Consultation
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="px-4 py-2 rounded-full bg-red-500/10 text-red-600 font-medium">Blood: {patient.bloodGroup}</span>
            <span className="px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">Allergies: {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border/50 mb-8">
        {['Overview', 'Consultation'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-lg font-medium transition-colors border-b-2 px-2 ${activeTab === tab ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-card border border-border rounded-[2rem] p-8 hover:border-accent/30 transition-colors">
              <h3 className="text-2xl font-display mb-6 flex items-center gap-2"><Pill className="w-5 h-5" /> Active Prescriptions</h3>
              <div className="space-y-4">
                {patientPrescriptions.filter(p => p.status === 'Active').map(p => (
                  <div key={p.id} className="p-4 border border-border rounded-xl">
                    <h4 className="font-medium text-lg">{p.medicine}</h4>
                    <p className="text-muted-foreground text-sm">{p.dosage} • {p.frequency}</p>
                  </div>
                ))}
                {patientPrescriptions.length === 0 && <p className="text-muted-foreground">No active prescriptions.</p>}
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-[2rem] p-8 hover:border-accent/30 transition-colors">
              <h3 className="text-2xl font-display mb-6 flex items-center gap-2"><FileText className="w-5 h-5" /> Recent Labs</h3>
              <div className="space-y-4">
                {patientLabs.map(l => (
                  <div key={l.id} className="p-4 border border-border rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{l.test}</h4>
                      <p className="text-muted-foreground text-sm">{l.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${l.status === 'Completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{l.status}</span>
                  </div>
                ))}
                {patientLabs.length === 0 && <p className="text-muted-foreground">No recent lab reports.</p>}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'Consultation' && (
          <motion.div 
            key="consultation"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="bg-card border border-border rounded-[2rem] p-8 md:p-12"
          >
            <h2 className="text-3xl font-display mb-8">Consultation Notes</h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnosis</label>
                <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow" placeholder="E.g., Hypertension Stage 1" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Clinical Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full h-48 bg-background border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-shadow" placeholder="Enter detailed consultation notes..."></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
                <Button variant="outline" className="h-14 rounded-xl px-8" onClick={() => setActiveTab('Overview')} disabled={isConsulting}>Cancel</Button>
                <Button className="h-14 rounded-xl px-8 gap-2" onClick={handleCompleteConsultation} disabled={!notes} isLoading={isConsulting}>
                  {isConsulting ? 'Saving Consultation...' : 'Complete Consultation'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal
        isOpen={showSuccess}
        onClose={closeSuccess}
        title="Consultation Completed"
        message="The patient's records and appointment status have been updated successfully."
      >
        <Button className="w-full rounded-xl h-12" onClick={closeSuccess}>View Patient Overview</Button>
      </SuccessModal>
    </motion.div>
  );
}
