import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/auth';
import { Moon, Sun, Bell, Menu, X, Check } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { notificationService, type NotificationItem } from '../../services/notifications';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      // quiet fail for navbar
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Scrollspy on homepage to highlight active section (Services, Health, About)
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(null);
      return;
    }

    const handleScroll = () => {
      const sections = ['services', 'health', 'about'];
      const scrollPosition = window.scrollY + 200;

      let currentSection: string | null = null;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Handle hash scrolling with navigation logic
  const handleSectionClick = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    } else {
      navigate(`/#${sectionId}`);
      // Wait for homepage component mount then scroll
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, [location.pathname, navigate]);

  // Listen for hash changes if arrived on homepage with hash
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const isDoctorsActive = location.pathname.startsWith('/doctors');

  return (
    <nav className="fixed top-0 w-full z-[70] bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link 
            to="/" 
            onClick={() => {
              setMobileMenuOpen(false);
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="text-xl font-display font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            HEALTHCARE
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">

            <Link 
              to="/doctors" 
              className={cn(
                "relative py-1 transition-colors",
                isDoctorsActive 
                  ? "text-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Doctors
              {isDoctorsActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent rounded-full animate-in fade-in" />
              )}
            </Link>

            <a 
              href="/#services" 
              onClick={(e) => handleSectionClick(e, 'services')}
              className={cn(
                "relative py-1 transition-colors",
                location.pathname === '/' && activeSection === 'services'
                  ? "text-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Services
              {location.pathname === '/' && activeSection === 'services' && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent rounded-full animate-in fade-in" />
              )}
            </a>

            <a 
              href="/#health" 
              onClick={(e) => handleSectionClick(e, 'health')}
              className={cn(
                "relative py-1 transition-colors",
                location.pathname === '/' && activeSection === 'health'
                  ? "text-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Health
              {location.pathname === '/' && activeSection === 'health' && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent rounded-full animate-in fade-in" />
              )}
            </a>

            <a 
              href="/#about" 
              onClick={(e) => handleSectionClick(e, 'about')}
              className={cn(
                "relative py-1 transition-colors",
                location.pathname === '/' && activeSection === 'about'
                  ? "text-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              About
              {location.pathname === '/' && activeSection === 'about' && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent rounded-full animate-in fade-in" />
              )}
            </a>
          </div>
        </div>

        {/* Right side controls & Auth */}
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsDark(!isDark)} 
            aria-label="Toggle theme"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {isAuthenticated && user && (
            <div className="hidden sm:flex items-center gap-3 relative">
              {/* Notification Bell Button & Popover */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(prev => !prev)}
                  aria-label="Notifications"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Popover Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-medium text-lg">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 8).map(notif => (
                          <div 
                            key={notif.id}
                            onClick={() => !notif.read && handleMarkRead(notif.id)}
                            className={cn(
                              "p-3 rounded-xl transition-colors cursor-pointer text-left border",
                              notif.read 
                                ? "bg-muted/20 border-border/30 opacity-70" 
                                : "bg-card border-border hover:border-accent/40 shadow-sm"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-xs font-semibold leading-snug", !notif.read ? "text-foreground" : "text-muted-foreground")}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to={`/${user.role}/profile`} className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-medium font-display text-lg hover:opacity-90 transition-opacity">
                {user.name.charAt(0).toUpperCase()}
              </Link>
            </div>
          )}


          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to={`/${user?.role}`}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Book Appointment</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-muted/60 text-foreground hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-6 py-6 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-4">

            <Link 
              to="/doctors" 
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                isDoctorsActive 
                  ? "bg-accent/10 text-accent font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Doctors
            </Link>

            <a 
              href="/#services" 
              onClick={(e) => handleSectionClick(e, 'services')}
              className={cn(
                "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                location.pathname === '/' && activeSection === 'services'
                  ? "bg-accent/10 text-accent font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Services
            </a>

            <a 
              href="/#health" 
              onClick={(e) => handleSectionClick(e, 'health')}
              className={cn(
                "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                location.pathname === '/' && activeSection === 'health'
                  ? "bg-accent/10 text-accent font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Health
            </a>

            <a 
              href="/#about" 
              onClick={(e) => handleSectionClick(e, 'about')}
              className={cn(
                "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                location.pathname === '/' && activeSection === 'about'
                  ? "bg-accent/10 text-accent font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              About
            </a>

            <div className="pt-4 border-t border-border/60 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={`/${user?.role}`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="ghost" className="w-full justify-start">Login</Button>
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full">Book Appointment</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
