import { RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PageTransition } from '../../components/ui/page-transition';
import { toast } from '../../components/ui/toast-store';
import { motion } from 'framer-motion';
import { useState } from 'react';

const services = [
  { name: 'Authentication API', status: 'Operational', uptime: '99.9%', latency: '42ms', color: 'bg-green-500', textColor: 'text-green-600' },
  { name: 'Patient Records DB', status: 'Operational', uptime: '99.8%', latency: '85ms', color: 'bg-green-500', textColor: 'text-green-600' },
  { name: 'Appointment Scheduler', status: 'Degraded', uptime: '97.2%', latency: '312ms', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { name: 'Billing Gateway', status: 'Operational', uptime: '99.9%', latency: '67ms', color: 'bg-green-500', textColor: 'text-green-600' },
  { name: 'Notification Service', status: 'Operational', uptime: '100%', latency: '28ms', color: 'bg-green-500', textColor: 'text-green-600' },
  { name: 'Lab Results API', status: 'Operational', uptime: '99.6%', latency: '95ms', color: 'bg-green-500', textColor: 'text-green-600' },
  { name: 'Medical Image Storage', status: 'Operational', uptime: '99.9%', latency: '150ms', color: 'bg-green-500', textColor: 'text-green-600' },
];

export default function AdminSystem() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Status refreshed', 'All service statuses have been updated.');
    }, 1500);
  };

  const operational = services.filter(s => s.status === 'Operational').length;
  const degraded = services.filter(s => s.status === 'Degraded').length;

  return (
    <PageTransition>
      <div className="px-8 md:px-12 py-10 max-w-5xl">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight mb-3">System Status</h1>
            <p className="text-xl text-muted-foreground">Monitor health and performance of all platform services.</p>
          </div>
          <Button variant="outline" className="gap-2 h-12 rounded-xl" onClick={handleRefresh} isLoading={isRefreshing}>
            {!isRefreshing && <RefreshCw className="w-4 h-4" />}
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-10 p-6 rounded-2xl border flex items-center gap-4 ${degraded > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-green-500/30 bg-green-500/5'}`}
        >
          <div className={`w-3 h-3 rounded-full ${degraded > 0 ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
          <div>
            <div className={`font-medium ${degraded > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {degraded > 0 ? `Partial Outage — ${degraded} service degraded` : 'All Systems Operational'}
            </div>
            <div className="text-sm text-muted-foreground">{operational} of {services.length} services fully operational</div>
          </div>
        </motion.div>

        <div className="space-y-4">
          {services.map((svc, i) => (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${svc.color} ${svc.status === 'Operational' ? 'animate-pulse' : ''}`}></div>
                <div>
                  <div className="font-medium">{svc.name}</div>
                  <div className="text-sm text-muted-foreground">Uptime {svc.uptime}</div>
                </div>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="text-right hidden md:block">
                  <div className="text-muted-foreground text-xs">Latency</div>
                  <div className="font-medium">{svc.latency}</div>
                </div>
                <span className={`px-4 py-1.5 rounded-full font-medium text-xs ${svc.status === 'Operational' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                  {svc.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
