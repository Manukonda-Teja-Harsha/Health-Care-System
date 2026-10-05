import { useToastStore } from './toast-store';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            layout
            className={`pointer-events-auto flex gap-4 p-4 rounded-2xl shadow-xl border backdrop-blur-md overflow-hidden relative ${
              toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' :
              toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' :
              'bg-card border-border text-foreground'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{toast.message}</h4>
              {toast.description && <p className="text-sm opacity-80 mt-1">{toast.description}</p>}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Progress bar effect */}
            <motion.div 
              className={`absolute bottom-0 left-0 h-1 w-full ${toast.type === 'success' ? 'bg-green-500/50' : toast.type === 'error' ? 'bg-red-500/50' : 'bg-foreground/20'}`}
              initial={{ x: 0 }}
              animate={{ x: '-100%' }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
