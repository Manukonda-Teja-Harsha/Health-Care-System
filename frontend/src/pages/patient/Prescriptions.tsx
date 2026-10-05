import { useState, useEffect } from 'react';
import { Pill, Clock, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from '../../components/ui/toast-store';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/ui/page-transition';
import { patientService, type Prescription } from '../../services/patient';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'Active' | 'Completed'>('Active');
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadPrescriptions() {
      setIsLoading(true);
      try {
        const data = await patientService.getPrescriptions();
        setPrescriptions(data);
      } catch (err: any) {
        console.error('Failed to load prescriptions:', err);
        toast.error(err?.message || 'Unable to load prescriptions');
      } finally {
        setIsLoading(false);
      }
    }
    loadPrescriptions();
  }, []);

  const filtered = prescriptions.filter(p => p.status === filter);

  const handleMarkTaken = (id: string) => {
    setLoadingItems(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, takenToday: true } : p));
      setLoadingItems(prev => ({ ...prev, [id]: false }));
      toast.success('Medication Taken', 'Your adherence has been logged.');
    }, 800);
  };

  return (
    <PageTransition>
      <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-medium tracking-tight mb-8">Prescriptions</h1>
          
          <div className="flex gap-4 border-b border-border/50 pb-4 overflow-x-auto">
            {['Active', 'Completed'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${filter === f ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading prescriptions...</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
              {filtered.map(prescription => {
                const doctorName = prescription.doctor?.name || 'Dr. Sarah Jenkins';
                const isItemLoading = loadingItems[prescription.id];
                return (
                  <motion.div 
                    key={prescription.id} 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card border border-border rounded-[2rem] p-8 flex flex-col justify-between group hover:border-accent transition-colors relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-foreground shrink-0">
                          <Pill className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-500 ${prescription.takenToday ? 'bg-green-500/10 text-green-500' : prescription.status === 'Active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                          {prescription.takenToday ? 'Taken' : prescription.status}
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-display mb-2">{prescription.medicine}</h3>
                      <p className="text-xl text-accent mb-6">{prescription.dosage}</p>
                      
                      <div className="space-y-4 mb-8 text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5" /> {prescription.frequency}
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5" /> {prescription.startDate} - {prescription.endDate}
                        </div>
                        <div className="flex items-center gap-3 text-sm pt-2 border-t border-border/50">
                          Prescribed by: {doctorName}
                        </div>
                      </div>
                    </div>
                    
                    {prescription.status === 'Active' && (
                      <div className="mt-auto relative z-10">
                        <Button 
                          className={`w-full rounded-xl h-14 text-lg flex items-center gap-2 transition-all`}
                          variant={prescription.takenToday ? 'default' : 'outline'}
                          onClick={() => handleMarkTaken(prescription.id)}
                          disabled={prescription.takenToday || isItemLoading}
                          isLoading={isItemLoading}
                          isSuccess={prescription.takenToday}
                        >
                          {prescription.takenToday ? 'Taken Today' : 'Mark as Taken'}
                        </Button>
                      </div>
                    )}
                    
                    <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl z-0 transition-colors duration-700 ${prescription.takenToday ? 'bg-green-500/20' : 'bg-muted/20 group-hover:bg-accent/5'}`}></div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground text-xl">
                No {filter.toLowerCase()} prescriptions found.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
