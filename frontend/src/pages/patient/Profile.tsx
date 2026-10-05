import { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Save } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/button';

export default function Profile() {
  const user = useAuthStore(state => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    dob: '1990-05-15',
    blood: 'O+',
    emergency: 'Sarah Smith (Sister) - 555-9876'
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-4xl">
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
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-10">
        <div className="flex items-center gap-8 mb-12 border-b border-border/50 pb-12">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center font-display text-4xl shrink-0">
            {formData.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-display mb-2">{formData.name}</h2>
            <p className="text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4" /> Patient Account</p>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Date of Birth</label>
            {isEditing ? (
              <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:ring-1 focus:ring-accent outline-none" />
            ) : (
              <div className="text-lg font-medium pt-2">{formData.dob}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
