import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, PartyPopper, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderApprovedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  estimatedReadyTime: number; // in minutes
}

export function OrderApprovedPopup({ isOpen, onClose, orderId, estimatedReadyTime }: OrderApprovedPopupProps) {
  const [countdown, setCountdown] = useState(estimatedReadyTime * 60); // convert to seconds

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(estimatedReadyTime * 60);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto close after 15 seconds
    const autoClose = setTimeout(() => onClose(), 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(autoClose);
    };
  }, [isOpen, estimatedReadyTime, onClose]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-background rounded-3xl shadow-2xl p-8 max-w-sm w-full pointer-events-auto relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Animated background circles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.05, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-green-500"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.03, 0.08] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 text-center space-y-5">
                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                  className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </motion.div>
                </motion.div>

                {/* Party emoji */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center gap-2"
                >
                  <motion.span
                    animate={{ rotate: [-10, 10, -10] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🎉
                  </motion.span>
                  <motion.span
                    animate={{ rotate: [10, -10, 10] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                    className="text-2xl"
                  >
                    🎊
                  </motion.span>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Order Approved!
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order #{orderId.slice(-6)} is being prepared
                  </p>
                </motion.div>

                {/* Timer */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-2xl p-5 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Estimated Ready Time
                    </span>
                  </div>
                  
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="font-mono text-4xl font-bold text-green-600 dark:text-green-400"
                  >
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </motion.div>
                  
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                    {estimatedReadyTime} minutes from now
                  </p>
                </motion.div>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-muted-foreground"
                >
                  Sit back and relax! We'll notify you when it's ready 🍽️
                </motion.p>

                {/* Close button */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button onClick={onClose} className="w-full h-11 rounded-xl">
                    Got it!
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
