import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, Save, Stethoscope, Building, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/button';
import { toast } from '../../components/ui/toast-store';
import { PageTransition } from '../../components/ui/page-transition';
import { patientService } from '../../services/patient';
import { doctorService } from '../../services/doctor';

export default function SharedProfile() {
  const user = useAuthStore(state => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    dob: '',
    blood: '',
    specialty: '',
    experience: '',
    hospital: ''
  });

  useEffect(() => {
    async function loadProfile() {
      if (user?.role === 'patient') {
        setIsLoading(true);
        try {
          const profile = await patientService.getProfile();
          setFormData(prev => ({
            ...prev,
            name: profile.name || user.name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            dob: profile.dateOfBirth || '',
            blood: profile.bloodGroup || '',
          }));
        } catch (err: any) {
          console.error('Failed to load profile:', err);
          toast.error(err?.message || 'Unable to load profile');
        } finally {
          setIsLoading(false);
        }
      } else if (user?.role === 'doctor') {
        setIsLoading(true);
        try {
          const doc = await doctorService.getProfile();
          setFormData(prev => ({
            ...prev,
            name: doc.name || user.name || '',
            email: doc.email || user.email || '',
            phone: doc.phone || '',
            specialty: doc.specialization || doc.department || '',
            experience: doc.experience || '',
            hospital: doc.hospital || '',
          }));
        } catch (err: any) {
          console.error('Failed to load doctor profile:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user?.role === 'patient') {
        const updated = await patientService.updateProfile({
          name: formData.name,
          phone: formData.phone,
          dateOfBirth: formData.dob,
          bloodGroup: formData.blood,
        });
        setFormData(prev => ({
          ...prev,
          name: updated.name,
          phone: updated.phone,
          dob: updated.dateOfBirth || prev.dob,
          blood: updated.bloodGroup || prev.blood,
        }));
      }
      setIsSuccess(true);
      toast.success('Profile updated');
      setTimeout(() => {
        setIsSuccess(false);
        setIsEditing(false);
      }, 1500);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-6 md:p-12 lg:p-16 max-w-4xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight mb-4">My Profile</h1>
            <p className="text-xl text-muted-foreground">Manage your personal information.</p>
          </div>
          {!isEditing ? (
            <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving || isSuccess}>Cancel</Button>
              <Button className="gap-2 min-w-[140px]" onClick={handleSave} isLoading={isSaving} isSuccess={isSuccess}>
                {!isSaving && !isSuccess && <><Save className="w-4 h-4" /> Save Changes</>}
                {isSaving && 'Saving...'}
                {isSuccess && 'Saved'}
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-[2rem] p-16 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading profile...</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[2rem] p-10">
            <div className="flex items-center gap-8 mb-12 border-b border-border/50 pb-12">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center font-display text-4xl shrink-0">
                {formData.name.charAt(0)}
              </div>
          <div>
            <h2 className="text-3xl font-display mb-2">{formData.name}</h2>
            <p className="text-muted-foreground flex items-center gap-2 capitalize"><Shield className="w-4 h-4" /> {user?.role} Account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Full Name</label>
            {isEditing ? (
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:ring-1 focus:ring-accent outline-none" />
            ) : (
              <div className="text-lg font-medium pt-2">{formData.name}</div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</label>
            {isEditing ? (
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:ring-1 focus:ring-accent outline-none" />
            ) : (
              <div className="text-lg font-medium pt-2">{formData.email}</div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</label>
            {isEditing ? (
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:ring-1 focus:ring-accent outline-none" />
            ) : (
              <div className="text-lg font-medium pt-2">{formData.phone}</div>
            )}
          </div>

          {user?.role === 'patient' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Date of Birth</label>
                {isEditing ? (
                  <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:ring-1 focus:ring-accent outline-none" />
                ) : (
                  <div className="text-lg font-medium pt-2">{formData.dob || 'Not specified'}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">Blood Group</label>
                {isEditing ? (
                  <input type="text" placeholder="e.g. O+, A+" value={formData.blood} onChange={(e) => setFormData({...formData, blood: e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:ring-1 focus:ring-accent outline-none" />
                ) : (
                  <div className="text-lg font-medium pt-2">{formData.blood || 'Not specified'}</div>
                )}
              </div>
            </>
          )}

          {user?.role === 'doctor' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Specialty</label>
                {isEditing ? (
                  <input type="text" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:ring-1 focus:ring-accent outline-none" />
                ) : (
                  <div className="text-lg font-medium pt-2">{formData.specialty}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Building className="w-4 h-4" /> Hospital</label>
                {isEditing ? (
                  <input type="text" value={formData.hospital} onChange={(e) => setFormData({...formData, hospital: e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:ring-1 focus:ring-accent outline-none" />
                ) : (
                  <div className="text-lg font-medium pt-2">{formData.hospital}</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      )}
      </div>
    </PageTransition>
  );
}
