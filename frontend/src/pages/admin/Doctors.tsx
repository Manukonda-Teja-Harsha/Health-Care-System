import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Modal, SuccessModal } from '../../components/ui/modal';
import { toast } from '../../components/ui/toast-store';
import { PageTransition } from '../../components/ui/page-transition';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService, type AdminDoctor } from '../../services/admin';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getDoctors();
      setDoctors(data);
    } catch (err: any) {
      console.error('Failed to load admin doctors:', err);
      toast.error('Failed to load doctors', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleToggleStatus = async (doc: AdminDoctor) => {
    const nextStatus = doc.status === 'Active' ? 'inactive' : 'active';
    try {
      await adminService.updateDoctorStatus(doc.id, nextStatus);
      setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, status: nextStatus === 'active' ? 'Active' : 'Inactive', isActive: nextStatus === 'active' } : d));
      if (selectedDoctor?.id === doc.id) {
        setSelectedDoctor(prev => prev ? { ...prev, status: nextStatus === 'active' ? 'Active' : 'Inactive', isActive: nextStatus === 'active' } : null);
      }
      toast.success('Status updated', `${doc.name} is now ${nextStatus}`);
    } catch (err: any) {
      console.error('Failed to update doctor status:', err);
      toast.error('Could not update status', err.message);
    }
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialty || d.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = () => {
    if (!inviteEmail) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowInviteModal(false);
      setShowSuccess(true);
      toast.success('Invitation sent', `Invite sent to ${inviteEmail}`);
      setInviteEmail('');
    }, 1200);
  };

  return (
    <PageTransition>
      <div className="px-8 md:px-12 py-10 max-w-6xl">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight mb-3">Doctors</h1>
            <p className="text-xl text-muted-foreground">{doctors.length} registered physicians</p>
          </div>
          <Button size="lg" className="rounded-xl h-14 gap-2 hover:scale-105 transition-transform" onClick={() => setShowInviteModal(true)}>
            <Plus className="w-5 h-5" /> Invite Doctor
          </Button>
        </div>


        <div className="mb-8 relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
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

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading doctors...</p>
          </div>
        ) : (
          <>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filtered.map((doc, i) => (


              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedDoctor(doc)}
                className="bg-card border border-border rounded-[2rem] p-8 cursor-pointer hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-display text-2xl shrink-0">
                    {doc.name.charAt(4)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-1">{doc.name}</h3>
                    <p className="text-accent mb-3">{doc.specialty}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> {doc.rating}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {doc.hospital}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${doc.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {doc.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground text-xl">No doctors match your search.</div>
        )}
        </>
        )}


        {/* Doctor Detail Modal */}
        <Modal isOpen={!!selectedDoctor} onClose={() => setSelectedDoctor(null)}>
          {selectedDoctor && (
            <>
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center font-display text-3xl">{selectedDoctor.name.charAt(4)}</div>
                  <div>
                    <h2 className="text-3xl font-display mb-1">{selectedDoctor.name}</h2>
                    <p className="text-accent text-lg">{selectedDoctor.specialty || selectedDoctor.specialization}</p>
                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium ${selectedDoctor.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {selectedDoctor.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedDoctor(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Rating', value: `${selectedDoctor.rating}/5.0` },
                  { label: 'Reviews', value: selectedDoctor.reviews },
                  { label: 'Experience', value: selectedDoctor.experience },
                  { label: 'Fee', value: `$${selectedDoctor.fee || selectedDoctor.consultationFee}` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="text-sm text-muted-foreground mb-1">{label}</div>
                    <div className="font-medium">{value}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border border-border/50 mb-6">
                <div className="text-sm text-muted-foreground mb-2">About</div>
                <p className="text-sm leading-relaxed">{selectedDoctor.about || selectedDoctor.bio}</p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className={`flex-1 h-12 rounded-xl ${selectedDoctor.status === 'Active' ? 'text-red-500 border-red-500/30 hover:bg-red-500/10' : 'text-green-500 border-green-500/30 hover:bg-green-500/10'}`} 
                  onClick={() => handleToggleStatus(selectedDoctor)}
                >
                  {selectedDoctor.status === 'Active' ? 'Deactivate Doctor' : 'Activate Doctor'}
                </Button>
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setSelectedDoctor(null)}>Close</Button>
              </div>
            </>
          )}
        </Modal>


        {/* Invite Modal */}
        <Modal isOpen={showInviteModal} onClose={() => !isSending && setShowInviteModal(false)}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display">Invite a Doctor</h2>
            <button onClick={() => !isSending && setShowInviteModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="doctor@hospital.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow">
                <option>Attending Physician</option>
                <option>Resident</option>
                <option>Specialist</option>
                <option>Consultant</option>
              </select>
            </div>
            <div className="flex gap-4 pt-2">
              <Button variant="outline" className="flex-1 h-14 rounded-xl" onClick={() => setShowInviteModal(false)} disabled={isSending}>Cancel</Button>
              <Button className="flex-1 h-14 rounded-xl" onClick={handleInvite} isLoading={isSending} disabled={!inviteEmail}>
                {isSending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </Modal>

        <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Invitation Sent" message="The doctor will receive an email with instructions to join the platform.">
          <Button className="w-full rounded-xl h-12" onClick={() => setShowSuccess(false)}>Done</Button>
        </SuccessModal>
      </div>
    </PageTransition>
  );
}
