import { Moon, Bell, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';

export default function Settings() {
  const logout = useAuthStore(state => state.logout);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [notifs, setNotifs] = useState(true);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Settings</h1>
        <p className="text-xl text-muted-foreground">Manage your app preferences.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-card border border-border rounded-[2rem] p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground"><Moon className="w-5 h-5" /></div>
            <h2 className="text-2xl font-display">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-lg mb-1">Dark Mode</h4>
              <p className="text-muted-foreground">Switch between light and dark themes.</p>
            </div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`w-14 h-8 rounded-full flex items-center transition-colors px-1 ${isDark ? 'bg-accent justify-end' : 'bg-muted justify-start'}`}
            >
              <div className="w-6 h-6 bg-background rounded-full shadow-sm"></div>
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground"><Bell className="w-5 h-5" /></div>
            <h2 className="text-2xl font-display">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-lg mb-1">Push Notifications</h4>
              <p className="text-muted-foreground">Receive alerts for appointments and labs.</p>
            </div>
            <button 
              onClick={() => setNotifs(!notifs)}
              className={`w-14 h-8 rounded-full flex items-center transition-colors px-1 ${notifs ? 'bg-accent justify-end' : 'bg-muted justify-start'}`}
            >
              <div className="w-6 h-6 bg-background rounded-full shadow-sm"></div>
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground"><Shield className="w-5 h-5" /></div>
            <h2 className="text-2xl font-display">Account</h2>
          </div>
          <div className="flex flex-col gap-4">
            <Button variant="outline" className="w-full md:w-auto self-start gap-2 h-12 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={logout}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
