import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ArrowUp, ArrowDown, FileText, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';
import { cn, formatBytes } from '../../lib/utils';
import type { QueuedFile } from '../../engine/types';
import { ImageViewer } from '../ImageViewer';

interface FileQueueProps {
  queue: QueuedFile[];
  onRemove: (id: string) => void;
  onReorder?: (id: string, direction: 'up' | 'down') => void;
  showReorder?: boolean;
}

export function FileQueue({ queue, onRemove, onReorder, showReorder }: FileQueueProps) {
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-3">
      <AnimatePresence>
        {queue.map((item, idx) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              'group relative bg-white dark:bg-neutral-900 rounded-3xl p-4 border flex items-center gap-4 transition-all',
              item.status === 'invalid'
                ? 'border-red-200 dark:border-red-900/40'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:shadow-lg'
            )}
          >
            <button
              onClick={() => item.previewUrl && setViewerSrc(item.previewUrl)}
              disabled={!item.previewUrl}
              className={cn(
                'relative w-16 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center transition-all',
                item.previewUrl && 'hover:ring-2 hover:ring-blue-500/40 cursor-zoom-in'
              )}
            >
              {item.previewUrl ? (
                <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-8 h-8 text-neutral-300" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                  #{idx + 1}
                </span>
                <p className="text-sm font-bold truncate text-neutral-900 dark:text-neutral-100">
                  {item.file.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  {formatBytes(item.size)}
                </span>
                {item.status === 'invalid' && item.error && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase">
                    <AlertCircle className="w-3 h-3" />
                    {item.error}
                  </span>
                )}
                {item.status === 'processing' && (
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 pr-2">
              {showReorder && onReorder && (
                <>
                  <button
                    disabled={idx === 0}
                    onClick={() => onReorder(item.id, 'up')}
                    className="p-2 text-neutral-400 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl"
                    aria-label="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === queue.length - 1}
                    onClick={() => onReorder(item.id, 'down')}
                    className="p-2 text-neutral-400 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => onRemove(item.id)}
                className="w-10 h-10 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-neutral-400 hover:bg-red-500 hover:text-white transition-all rounded-xl"
                aria-label="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <ImageViewer
        src={viewerSrc ?? ''}
        isOpen={!!viewerSrc}
        onClose={() => setViewerSrc(null)}
      />
    </div>
  );
}
