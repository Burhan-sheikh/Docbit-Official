import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-full max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Container */}
            <div className="relative group bg-neutral-900/50 rounded-2xl shadow-2xl ring-1 ring-white/10 flex items-center justify-center p-4 min-h-[300px] min-w-[300px]">
              <motion.img
                src={src}
                alt={alt || "Image preview"}
                animate={{ 
                  rotate: rotation,
                  scale: (rotation / 90) % 2 !== 0 ? 0.7 : 1
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  maxWidth: 'min(90vw, 1200px)',
                  maxHeight: 'min(80vh, 800px)',
                }}
                className="object-contain select-none shadow-2xl rounded-xl"
              />
              
              {/* Optional: Status/Zoom indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] pointer-events-none">Safe Preview Mode</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
