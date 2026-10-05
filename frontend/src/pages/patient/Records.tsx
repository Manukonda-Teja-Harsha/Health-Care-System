import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Loader2 } from 'lucide-react';
import { patientService, type MedicalRecord } from '../../services/patient';
import { toast } from '../../components/ui/toast-store';

export default function Records() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadRecords() {
      setIsLoading(true);
      try {
        const data = await patientService.getRecords();
        setRecords(data);
      } catch (err: any) {
        console.error('Failed to load medical records:', err);
        toast.error(err?.message || 'Unable to load records');
      } finally {
        setIsLoading(false);
      }
    }
    loadRecords();
  }, []);

  const filtered = records.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Medical Records</h1>
          <p className="text-xl text-muted-foreground">Your complete medical history.</p>
        </div>
        <div className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-card border border-border rounded-xl pl-10 pr-4 focus:outline-none focus:border-accent"
            />
          </div>
          <button className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-lg">
            No medical records found.
          </div>
        ) : (
          filtered.map(record => (
            <div key={record.id} className="bg-card border border-border rounded-[1.5rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-accent transition-colors cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">{record.title}</h3>
                  <p className="text-sm text-muted-foreground">{record.type} • {record.doctor}</p>
                </div>
              </div>
              <div className="text-right text-muted-foreground">
                {record.date}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
