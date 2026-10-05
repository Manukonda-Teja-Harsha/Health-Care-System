import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from '../../components/ui/toast-store';
import { doctorService, type DoctorRecord, type DoctorPatient } from '../../services/doctor';

export default function DoctorNotes() {
  const [records, setRecords] = useState<DoctorRecord[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    content: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [recData, ptData] = await Promise.all([
        doctorService.getRecords(),
        doctorService.getPatients(),
      ]);
      setRecords(recData);
      setPatients(ptData);
    } catch (err: any) {
      console.error('Failed to load doctor notes:', err);
      toast.error('Failed to load notes', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return records.filter(n => {
      const matchTitle = n.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPatient = n.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = n.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTitle || matchPatient || matchDesc;
    });
  }, [records, searchTerm]);

  const handleSave = async () => {
    if (!formData.patientId || !formData.title) return;
    try {
      setIsSaving(true);
      const created = await doctorService.createRecord({
        patientId: formData.patientId,
        title: formData.title,
        description: formData.content,
      });
      setRecords(prev => [created, ...prev]);
      setIsCreating(false);
      setFormData({ patientId: '', title: '', content: '' });
      toast.success('Clinical note created', 'Saved to medical records.');
      // Refresh to ensure full joins
      doctorService.getRecords().then(setRecords).catch(() => {});
    } catch (err: any) {
      console.error('Failed to save clinical note:', err);
      toast.error('Could not save note', err.message || 'Error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Clinical Notes</h1>
          <p className="text-xl text-muted-foreground">Your patient observation history.</p>
        </div>
        <Button size="lg" className="rounded-xl h-14 gap-2" onClick={() => setIsCreating(true)}>
          <Plus className="w-5 h-5" /> New Note
        </Button>
      </div>

      <div className="mb-8 relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search notes or patient names..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 bg-card border border-border rounded-full pl-12 pr-4 focus:outline-none focus:border-accent"
        />
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p className="text-lg">Loading clinical notes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map(note => {
            return (
              <div key={note.id} className="bg-card border border-border rounded-[2rem] p-8 hover:border-accent transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-medium">{note.title}</h3>
                  <span className="text-sm text-muted-foreground">{note.date}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">Patient: <span className="font-medium text-foreground">{note.patientName}</span></p>
                <p className="line-clamp-3 text-muted-foreground">{note.description || note.notes}</p>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No clinical notes found.
            </div>
          )}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] w-full max-w-2xl p-8 md:p-12 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display">Create Note</h2>
              <button onClick={() => !isSaving && setIsCreating(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient</label>
                <select value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-accent">
                  <option value="">Select a patient...</option>
                  {patients.map(p => <option key={p.patientId || p.id} value={p.patientId || p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-accent" placeholder="e.g. Follow-up consultation" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-48 bg-background border border-border rounded-xl p-4 focus:outline-none focus:border-accent resize-none" placeholder="Observations, diagnosis, or treatment plan..."></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14 rounded-xl" onClick={() => setIsCreating(false)} disabled={isSaving}>Cancel</Button>
                <Button className="flex-1 h-14 rounded-xl" onClick={handleSave} disabled={!formData.patientId || !formData.title} isLoading={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

