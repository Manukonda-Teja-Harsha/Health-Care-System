import { useState, useEffect } from 'react';
import { FileText, Download, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { PageTransition } from '../../components/ui/page-transition';
import { motion } from 'framer-motion';
import { toast } from '../../components/ui/toast-store';
import { patientService, type LabReport } from '../../services/patient';

export default function Labs() {
  const [labs, setLabs] = useState<LabReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState<LabReport | null>(null);

  useEffect(() => {
    async function loadLabs() {
      setIsLoading(true);
      try {
        const data = await patientService.getLabs();
        setLabs(data);
      } catch (err: any) {
        console.error('Failed to load lab reports:', err);
        toast.error(err?.message || 'Unable to load lab reports');
      } finally {
        setIsLoading(false);
      }
    }
    loadLabs();
  }, []);

  return (
    <PageTransition>
      <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Lab Reports</h1>
          <p className="text-xl text-muted-foreground">Access and download your laboratory test results.</p>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading lab reports...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-xl">
            No lab reports found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {labs.map((lab, i) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedLab(lab)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-foreground shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium mb-1">{lab.name}</h3>
                    <p className="text-muted-foreground">{lab.lab} • {lab.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
                    lab.status === 'Normal' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    lab.status === 'Attention' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                    'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {lab.status === 'Normal' ? <Activity className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {lab.status}
                  </span>
                  <button
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                    onClick={e => { e.stopPropagation(); toast.success('Download started', 'Your PDF report will be ready shortly.'); }}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={!!selectedLab} onClose={() => setSelectedLab(null)}>
          {selectedLab && (
            <>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-display mb-2">{selectedLab.name}</h2>
                  <p className="text-muted-foreground">{selectedLab.date} • {selectedLab.lab}</p>
                </div>
                <button onClick={() => setSelectedLab(null)} className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">✕</button>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <h4 className="font-medium mb-4 text-muted-foreground uppercase text-sm tracking-wider">Test Results</h4>
                  
                  {selectedLab.result ? (
                    <div className="space-y-3">
                      <p className="text-base text-foreground leading-relaxed font-sans">{selectedLab.result}</p>
                      <div className="flex items-center gap-2 text-sm pt-2 text-muted-foreground border-t border-border/40">
                        <span>Reported by: {selectedLab.doctor}</span>
                      </div>
                    </div>
                  ) : selectedLab.name === 'Lipid Panel' ? (
                    <div className="space-y-4">
                      {[
                        { label: 'Total Cholesterol', value: '215 mg/dL', range: '<200 mg/dL', ok: false },
                        { label: 'LDL (Bad)', value: '140 mg/dL', range: '<100 mg/dL', ok: false },
                        { label: 'HDL (Good)', value: '55 mg/dL', range: '>40 mg/dL', ok: true },
                      ].map((r, i, arr) => (
                        <div key={r.label} className={`flex justify-between items-center ${i < arr.length - 1 ? 'border-b border-border/50 pb-4' : ''}`}>
                          <span>{r.label}</span>
                          <div className="text-right">
                            <span className={`font-medium mr-2 ${r.ok ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{r.value}</span>
                            <span className="text-xs text-muted-foreground">({r.range})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { label: 'White Blood Cells', value: '6.8 10³/uL', range: '4.0-11.0', ok: true },
                        { label: 'Red Blood Cells', value: '5.1 10⁶/uL', range: '4.3-5.9', ok: true },
                        { label: 'Hemoglobin', value: '15.2 g/dL', range: '13.5-17.5', ok: true },
                      ].map((r, i, arr) => (
                        <div key={r.label} className={`flex justify-between items-center ${i < arr.length - 1 ? 'border-b border-border/50 pb-4' : ''}`}>
                          <span>{r.label}</span>
                          <div className="text-right">
                            <span className="text-green-600 dark:text-green-400 font-medium mr-2">{r.value}</span>
                            <span className="text-xs text-muted-foreground">({r.range})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-4 border-t border-border/50">
                  <button
                    onClick={() => { toast.success('Download started', 'Your PDF report will be ready shortly.'); setSelectedLab(null); }}
                    className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Full PDF
                  </button>
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
}
