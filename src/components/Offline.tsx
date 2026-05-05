import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { WifiOff, X, RefreshCw } from 'lucide-react';

export default function Offline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsVisible(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (
      Math.abs(info.offset.x) > threshold || 
      Math.abs(info.offset.y) > threshold
    ) {
      handleDismiss();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={onDragEnd}
          className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm cursor-grab active:cursor-grabbing"
        >
          <div className="bg-neutral-900/90 dark:bg-neutral-800/90 backdrop-blur-xl text-white p-4 md:p-5 rounded-[28px] shadow-2xl flex items-center gap-4 border border-white/10 ring-1 ring-black/50">
            <div className="w-11 h-11 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
              <WifiOff className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/90">Browsing Offline</p>
              <p className="text-[10px] font-bold text-neutral-400 truncate">DocBit works without internet.</p>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => window.location.reload()}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-neutral-400" />
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-0.5" />
              
              <button 
                onClick={handleDismiss}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-neutral-400 hover:text-white active:scale-90"
                aria-label="Close message"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gesture Hint Line */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 rounded-full md:hidden" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
