import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
  rotation?: number;
}

export function ImageViewer({ src, isOpen, onClose, alt, rotation = 0 }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1); // Reset zoom when opening
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[90vw] max-h-[90vh] md:max-w-4xl flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Controls */}
            <div className="absolute -top-14 md:-top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 ring-1 ring-black/20">
               <button 
                 onClick={handleZoomOut}
                 className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                 title="Zoom Out"
               >
                 <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
               </button>
               <div className="w-px h-4 bg-white/10" />
               <span className="px-2 md:px-3 text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest min-w-[50px] md:min-w-[60px] text-center">
                 {Math.round(zoom * 100)}%
               </span>
               <div className="w-px h-4 bg-white/10" />
               <button 
                 onClick={handleZoomIn}
                 className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                 title="Zoom In"
               >
                 <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
               </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-14 md:-top-16 right-0 p-2.5 md:p-3 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-red-500 rounded-2xl border border-white/10"
              aria-label="Close preview"
            >
              <X className="w-5 h-5 md:w-6 h-6" />
            </button>

            {/* Image Container */}
            <div className="relative group w-full h-full min-h-[200px] bg-neutral-900/50 rounded-[24px] md:rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex items-center justify-center p-4 md:p-8 overflow-hidden">
              <div className="relative transition-all duration-500 flex items-center justify-center w-full h-full">
                <motion.img
                  src={src}
                  alt={alt || "Image preview"}
                  animate={{ 
                    rotate: rotation,
                    scale: ((rotation / 90) % 2 !== 0 ? 0.7 : 1) * zoom
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '75vh',
                  }}
                  className="object-contain select-none shadow-2xl rounded-sm ring-1 ring-white/5"
                />
              </div>
              
              {/* Optional: Status indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] pointer-events-none">Safe Preview</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
