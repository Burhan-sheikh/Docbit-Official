import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export interface PreviewImage {
  url: string;
  filename: string;
  mimeType?: string;
  size?: number;
}

interface ImagePreviewModalProps {
  open: boolean;
  images: PreviewImage[];
  index: number;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export function ImagePreviewModal({ open, images, index, onClose, onNavigate }: ImagePreviewModalProps) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const current = images[index];

  const goPrev = useCallback(() => {
    if (index > 0) {
      setZoomed(false);
      setPan({ x: 0, y: 0 });
      onNavigate?.(index - 1);
    }
  }, [index, onNavigate]);

  const goNext = useCallback(() => {
    if (index < images.length - 1) {
      setZoomed(false);
      setPan({ x: 0, y: 0 });
      onNavigate?.(index + 1);
    }
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, goPrev, goNext]);

  useEffect(() => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [index]);

  if (!open || !current) return null;

  const isImage = current.mimeType?.startsWith('image/') || true;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomed) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => setDragging(false);

  const toggleZoom = () => {
    setZoomed((z) => !z);
    setPan({ x: 0, y: 0 });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center h-[100dvh]"
        >
          <div className="absolute inset-0 bg-black/95" onClick={onClose} />

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white truncate">{current.filename}</p>
              {current.size != null && (
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  {index + 1} / {images.length}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleZoom}
                className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title={zoomed ? 'Fit to screen' : 'Actual size'}
              >
                {zoomed ? <Maximize2 className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                disabled={index === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-0 disabled:cursor-default rounded-full transition-all"
                title="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goNext}
                disabled={index === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-0 disabled:cursor-default rounded-full transition-all"
                title="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative z-10 flex items-center justify-center w-full h-full overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoomed ? (dragging ? 'grabbing' : 'grab') : 'default' }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !zoomed) onClose();
            }}
          >
            <motion.img
              key={current.url}
              src={current.url}
              alt={current.filename}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[85vh] object-contain select-none pointer-events-none"
              style={{
                transform: zoomed
                  ? `scale(2) translate(${pan.x / 2}px, ${pan.y / 2}px)`
                  : `translate(${pan.x}px, ${pan.y}px)`,
                transition: dragging ? 'none' : 'transform 0.2s ease-out',
              }}
              draggable={false}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
