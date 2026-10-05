import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { toast } from '../../components/ui/toast-store';
import { doctorService, type DoctorLab, type DoctorPatient } from '../../services/doctor';

export default function DoctorLabs() {
  const [labs, setLabs] = useState<DoctorLab[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState<DoctorLab | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    testName: '',
    result: '',
    notes: '',
    status: 'NORMAL',
  });

  const fetchLabsData = async () => {
    try {
      setIsLoading(true);
      const [labData, patientData] = await Promise.all([
        doctorService.getLabs(),
        doctorService.getPatients(),
      ]);
      setLabs(labData);
      setPatients(patientData);
    } catch (err: any) {
      console.error('Failed to load doctor labs:', err);
      toast.error('Failed to load lab reports', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabsData();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'Attention' | 'Completed') => {
    try {
      await doctorService.updateLabStatus(id, status);
      setLabs(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      setSelectedLab(null);
      toast.success('Lab report updated');
    } catch (err: any) {
      console.error('Failed to update lab status:', err);
      toast.error('Could not update status', err.message);
    }
  };

  const handleCreateLab = async () => {
    if (!formData.patientId || !formData.testName) return;
    try {
      setIsSaving(true);
      const created = await doctorService.createLab({
        patientId: formData.patientId,
        testName: formData.testName,
        result: formData.result,
        notes: formData.notes,
        status: formData.status,
      });
      setLabs(prev => [created, ...prev]);
      setIsCreating(false);
      setFormData({ patientId: '', testName: '', result: '', notes: '', status: 'NORMAL' });
      toast.success('Lab report created');
      doctorService.getLabs().then(setLabs).catch(() => {});
    } catch (err: any) {
      console.error('Failed to create lab report:', err);
      toast.error('Could not create lab report', err.message || 'Error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Lab Reports</h1>
          <p className="text-xl text-muted-foreground">Review and manage patient test results.</p>
        </div>
        <Button size="lg" className="rounded-xl h-14 gap-2 transition-transform hover:scale-105" onClick={() => setIsCreating(true)}>
          <Plus className="w-5 h-5" /> New Lab Report
        </Button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p className="text-lg">Loading lab reports...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {labs.map(lab => {
            return (
              <div 
                key={lab.id} 
                className="bg-card border border-border rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-accent transition-colors cursor-pointer" 
                onClick={() => setSelectedLab(lab)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium mb-1">{lab.test || lab.testName}</h3>
                    <p className="text-muted-foreground">Patient: {lab.patientName} • {lab.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    lab.status === 'Completed' ? 'bg-green-500/10 text-green-600' : 
                    lab.status === 'Attention' ? 'bg-red-500/10 text-red-600' :
                    'bg-yellow-500/10 text-yellow-600'
                  }`}>{lab.status}</span>
                </div>
              </div>
            );
          })}
          {labs.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              No lab reports found.
            </div>
          )}
        </div>
      )}

      {/* Lab Details Modal */}
      {selectedLab && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] w-full max-w-2xl p-8 md:p-12 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-display mb-2">{selectedLab.test || selectedLab.testName}</h2>
                <p className="text-muted-foreground">Patient: {selectedLab.patientName} • {selectedLab.date}</p>
              </div>
              <button onClick={() => setSelectedLab(null)} className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:text-foreground">✕</button>
            </div>
            
            <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 mb-8 space-y-3">
              <h4 className="font-medium text-muted-foreground uppercase text-sm">Result Overview</h4>
              <p className="text-xl">{selectedLab.result}</p>
              {selectedLab.notes && (
                <p className="text-sm text-muted-foreground border-t border-border/50 pt-2">{selectedLab.notes}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 rounded-xl h-14" onClick={() => handleUpdateStatus(selectedLab.id, 'Attention')}>
                Mark for Attention
              </Button>
              <Button className="flex-1 rounded-xl h-14 gap-2" onClick={() => handleUpdateStatus(selectedLab.id, 'Completed')}>
                <CheckCircle className="w-5 h-5" /> Mark Reviewed
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Lab Report Modal */}
      <Modal isOpen={isCreating} onClose={() => !isSaving && setIsCreating(false)}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-display">New Lab Report</h2>
          <button onClick={() => !isSaving && setIsCreating(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Patient</label>
            <select 
              value={formData.patientId} 
              onChange={e => setFormData({ ...formData, patientId: e.target.value })} 
              className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
            >
              <option value="">Select a patient...</option>
              {patients.map(p => <option key={p.patientId || p.id} value={p.patientId || p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Name</label>
            <input 
              type="text" 
              value={formData.testName} 
              onChange={e => setFormData({ ...formData, testName: e.target.value })} 
              className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow" 
              placeholder="e.g. Complete Blood Count (CBC)" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Result Overview</label>
            <textarea 
              value={formData.result} 
              onChange={e => setFormData({ ...formData, result: e.target.value })} 
              className="w-full h-24 bg-background border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-shadow" 
              placeholder="e.g. Hemoglobin: 14.2 g/dL, WBC: 6.8 K/uL. Normal reference range." 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Clinical Notes</label>
            <input 
              type="text" 
              value={formData.notes} 
              onChange={e => setFormData({ ...formData, notes: e.target.value })} 
              className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow" 
              placeholder="Optional notes or lab facility name..." 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({ ...formData, status: e.target.value })} 
              className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
            >
              <option value="NORMAL">Normal / Completed</option>
              <option value="ATTENTION">Attention Needed</option>
              <option value="PENDING">Pending Analysis</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-14 rounded-xl" onClick={() => setIsCreating(false)} disabled={isSaving}>Cancel</Button>
            <Button className="flex-1 h-14 rounded-xl" onClick={handleCreateLab} disabled={!formData.patientId || !formData.testName} isLoading={isSaving}>
              {isSaving ? 'Creating...' : 'Save Report'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

