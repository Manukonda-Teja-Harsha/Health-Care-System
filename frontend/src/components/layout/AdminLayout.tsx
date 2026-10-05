import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, Calendar, Settings,
  Shield, LogOut, ChevronRight, Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/doctors', icon: UserCog, label: 'Doctors' },
  { to: '/admin/patients', icon: Users, label: 'Patients' },
  { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/admin/system', icon: Activity, label: 'System Status' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col py-8 px-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-background" />
          </div>
          <div>
            <div className="font-display text-lg leading-tight">Admin Panel</div>
            <div className="text-xs text-muted-foreground truncate">{user?.name}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
