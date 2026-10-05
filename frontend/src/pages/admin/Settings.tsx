import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { PageTransition } from '../../components/ui/page-transition';
import { toast } from '../../components/ui/toast-store';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'MediFlow Health',
    supportEmail: 'support@mediflow.health',
    maintenanceMode: false,
    twoFactorRequired: true,
    sessionTimeout: '60',
    maxAppointmentsPerDay: '20',
    allowSelfRegistration: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      toast.success('Settings saved', 'Platform configuration has been updated.');
      setTimeout(() => setIsSuccess(false), 2000);
    }, 1200);
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PageTransition>
      <div className="px-8 md:px-12 py-10 max-w-3xl">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight mb-3">Settings</h1>
            <p className="text-xl text-muted-foreground">Configure platform-wide settings.</p>
          </div>
          <Button className="gap-2 h-12 rounded-xl min-w-[140px]" onClick={handleSave} isLoading={isSaving} isSuccess={isSuccess}>
            {!isSaving && !isSuccess && <><Save className="w-4 h-4" /> Save Changes</>}
            {isSaving && 'Saving...'}
            {isSuccess && 'Saved'}
          </Button>
        </div>

        <div className="space-y-8">
          {/* General */}
          <div className="bg-card border border-border rounded-[2rem] p-8">
            <h3 className="text-xl font-display mb-6">General</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={e => setSettings(s => ({ ...s, platformName: e.target.value }))}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={e => setSettings(s => ({ ...s, sessionTimeout: e.target.value }))}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Appointments Per Day (per doctor)</label>
                <input
                  type="number"
                  value={settings.maxAppointmentsPerDay}
                  onChange={e => setSettings(s => ({ ...s, maxAppointmentsPerDay: e.target.value }))}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-card border border-border rounded-[2rem] p-8">
            <h3 className="text-xl font-display mb-6">Security & Access</h3>
            <div className="space-y-4">
              {[
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Block all non-admin access during maintenance' },
                { key: 'twoFactorRequired', label: 'Require 2FA', desc: 'Force two-factor authentication for all users' },
                { key: 'allowSelfRegistration', label: 'Self Registration', desc: 'Allow patients to create accounts without admin approval' },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-4 border-b border-border/50 last:border-0"
                >
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                  <button
                    onClick={() => toggle(key as any)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      settings[key as keyof typeof settings] ? 'bg-accent' : 'bg-muted'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                      settings[key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border border-red-500/20 rounded-[2rem] p-8">
            <h3 className="text-xl font-display text-red-500 mb-6">Danger Zone</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-border/50">
                <div>
                  <div className="font-medium">Clear All Appointments</div>
                  <div className="text-sm text-muted-foreground">Permanently delete all appointment records</div>
                </div>
                <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl h-10" onClick={() => toast.error?.('Danger', 'This action is disabled in demo mode.')}>
                  Clear
                </Button>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium">Reset Platform Data</div>
                  <div className="text-sm text-muted-foreground">Reset all data to factory defaults</div>
                </div>
                <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl h-10" onClick={() => toast.success('Demo mode', 'Actions disabled in demo.')}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
