import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Starting...');

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Update status messages based on progress
        if (next > 70) setStatus('Optimizing engine...');
        else if (next > 40) setStatus('Preparing tools...');
        else if (next > 15) setStatus('Loading modules...');
        
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-neutral-900"
    >
      <div className="flex flex-col items-center max-w-xs w-full gap-8 px-6">
        
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            duration: 0.6 
          }}
          className="relative"
        >
          <div className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/10 rotate-3 p-4 border border-neutral-100 dark:border-neutral-700">
            <img src="/icon.svg" alt="DocBit Logo" className="w-full h-full object-contain" />
          </div>
          {/* Animated Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-blue-400 blur-3xl -z-10 rounded-full"
          />
        </motion.div>

        {/* App Name & Tagline */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <span className="text-4xl font-black tracking-tighter">
              <span className="text-neutral-900 dark:text-white">Doc</span>
              <span className="text-blue-600">Bit</span>
              <span className="text-blue-600">.</span>
            </span>
          </motion.div>
          
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm font-bold uppercase tracking-widest text-neutral-400 text-center leading-tight"
          >
            Free PDF Tools, <br className="sm:hidden" /> On Your Device
          </motion.p>
        </div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full space-y-4"
        >
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-200/50 dark:border-neutral-700/50">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 animate-pulse">
              {status}
            </span>
          </div>
        </motion.div>

      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-20 pointer-events-none opacity-20 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full" />
      </div>

    </motion.div>
  );
}
