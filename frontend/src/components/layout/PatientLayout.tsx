import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, Pill, Activity, User, Settings, LogOut, Menu, X } from 'lucide-react';

import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/app';
import { useAuthStore } from '../../store/auth';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',      path: '/patient' },
  { icon: Users,          label: 'Doctors',        path: '/patient/doctors' },
  { icon: Calendar,       label: 'Appointments',   path: '/patient/appointments' },
  { icon: FileText,       label: 'Records',        path: '/patient/records' },
  { icon: Pill,           label: 'Prescriptions',  path: '/patient/prescriptions' },
  { icon: FileText,       label: 'Lab Reports',    path: '/patient/labs' },
  { icon: Activity,       label: 'Health',         path: '/patient/health' },
  { icon: User,           label: 'Profile',        path: '/patient/profile' },
  { icon: Settings,       label: 'Settings',       path: '/patient/settings' },
];


export default function PatientLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const logout    = useAuthStore(s => s.logout);
  const user      = useAuthStore(s => s.user);
  const unreadCount = useAppStore(s => s.notifications.filter(n => !n.read).length);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const active =
      location.pathname === item.path ||
      (location.pathname.startsWith(item.path) && item.path !== '/patient');
    return (
      <Link
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm',
          active
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        <span>{item.label}</span>
        {item.label === 'Notifications' && unreadCount > 0 && (
          <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    // ── Outermost shell: fills below Navbar ──
    <div className="flex min-h-[calc(100vh-5rem)] bg-background">

      {/* ────────────────────────────────────────────────
          SIDEBAR — desktop
          • position: fixed so it stays while main scrolls
          • z-50 ensures it ALWAYS sits above the video
          • bg-card gives it a solid opaque surface
      ──────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col',
          'fixed left-0 top-[5rem] bottom-0 w-64',
          'bg-card border-r border-border',
          'overflow-y-auto overflow-x-hidden sidebar-no-scroll',
          'z-50',                      // ← above the absolute-positioned video
        )}
      >
        {/* User identity chip */}
        <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
              {user?.name?.charAt(0) ?? 'P'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name ?? 'Patient'}</p>
              <p className="text-xs text-muted-foreground truncate">Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(item => <NavLink key={item.path} item={item} />)}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6 pt-2 border-t border-border shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────
          MOBILE HAMBURGER BUTTON
      ──────────────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-[5.75rem] left-4 z-50 w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-md"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ────────────────────────────────────────────────
          MOBILE DRAWER
          z-[60] so it sits above everything incl. video
      ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-[55] bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-[60] bg-card border-r border-border flex flex-col shadow-2xl overflow-y-auto sidebar-no-scroll">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-semibold text-sm">
                  {user?.name?.charAt(0) ?? 'P'}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user?.name ?? 'Patient'}</p>
                  <p className="text-xs text-muted-foreground">Patient Portal</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map(item => <NavLink key={item.path} item={item} />)}
            </nav>

            {/* Mobile logout */}
            <div className="px-4 pb-6 pt-2 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ────────────────────────────────────────────────
          MAIN CONTENT AREA
          • ml-64 on desktop to clear the fixed sidebar
          • position: relative + overflow-hidden REQUIRED
            so the absolute-positioned video is clipped
            exactly to this container
      ──────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 w-full relative overflow-hidden min-h-[calc(100vh-5rem)]">
        <Outlet />
      </main>
    </div>
  );
}
