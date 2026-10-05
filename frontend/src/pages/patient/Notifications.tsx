import { useAppStore } from '../../store/app';
import { Bell, Trash2, Check, Calendar, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function Notifications() {
  const notifications = useAppStore(state => state.notifications);
  const { markNotificationRead, clearNotifications } = useAppStore();

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-4xl">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Notifications</h1>
          <p className="text-xl text-muted-foreground">Stay updated on your health journey.</p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" className="gap-2" onClick={clearNotifications}>
            <Trash2 className="w-4 h-4" /> Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map(notif => (
          <div key={notif.id} className={`bg-card border border-border rounded-[1.5rem] p-6 flex items-start justify-between gap-4 transition-colors ${!notif.read ? 'border-l-4 border-l-accent' : ''}`}>
            <div className="flex items-start gap-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                {notif.type === 'appointment' ? <Calendar className="w-5 h-5" /> : 
                 notif.type === 'lab' ? <FileText className="w-5 h-5" /> : 
                 <Bell className="w-5 h-5" />}
              </div>
              <div>
                <p className={`text-lg mb-1 ${!notif.read ? 'font-medium' : 'text-muted-foreground'}`}>{notif.message}</p>
                <span className="text-sm text-muted-foreground">Just now</span>
              </div>
            </div>
            {!notif.read && (
              <button 
                onClick={() => markNotificationRead(notif.id)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Mark as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-20 text-center text-muted-foreground text-xl">
            You're all caught up!
          </div>
        )}
      </div>
    </div>
  );
}
