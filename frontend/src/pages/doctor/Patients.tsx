import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { doctorService, type DoctorPatient } from '../../services/doctor';
import { toast } from '../../components/ui/toast-store';

export default function DoctorPatients() {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadPatients() {
      setIsLoading(true);
      try {
        const data = await doctorService.getPatients();
        setPatients(data);
      } catch (err: any) {
        console.error('Failed to load doctor patients:', err);
        toast.error(err?.message || 'Unable to load patients');
      } finally {
        setIsLoading(false);
      }
    }
    loadPatients();
  }, []);

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-12 lg:p-16">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Patients</h1>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search patients by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-card border border-border rounded-full pl-12 pr-4 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading patients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground text-xl">
            No patients found matching "{searchTerm}".
          </div>
        ) : (
          filtered.map(patient => (
            <div key={patient.id} className="bg-card border border-border rounded-[2rem] p-8 flex flex-col justify-between group hover:border-accent transition-colors">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-display text-xl">{patient.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-xl font-medium">{patient.name}</h3>
                    <p className="text-muted-foreground">{patient.age} yrs • {patient.gender}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Blood Group</span>
                    <span className="font-medium text-red-500">{patient.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Allergies</span>
                    <span className="font-medium">{patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}</span>
                  </div>
                </div>
              </div>
              
              <Link to={`/doctor/patients/${patient.id}`} className="mt-auto">
                <Button variant="outline" className="w-full rounded-xl h-12">View Details</Button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
