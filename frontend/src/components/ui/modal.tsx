import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="bg-card border border-border shadow-2xl rounded-[2rem] w-full max-w-md p-8 relative overflow-hidden z-10"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SuccessModal({ isOpen, onClose, title, message, children }: { isOpen: boolean, onClose: () => void, title: string, message: string, children?: React.ReactNode }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1, bounce: 0.5 }}
          className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
             <Check className="w-10 h-10" />
          </motion.div>
        </motion.div>
        <h3 className="text-3xl font-display font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground text-lg mb-8">{message}</p>
        {children}
      </div>
    </Modal>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false, isProcessing = false }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmText?: string, cancelText?: string, isDestructive?: boolean, isProcessing?: boolean }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        {isDestructive && (
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
        )}
        <h3 className="text-2xl font-display font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-8">{message}</p>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={onClose} disabled={isProcessing}>
            {cancelText}
          </Button>
          <Button 
            className={`flex-1 rounded-xl h-12 ${isDestructive ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`} 
            onClick={onConfirm} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
