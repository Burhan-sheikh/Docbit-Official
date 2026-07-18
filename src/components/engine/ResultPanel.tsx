import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Download, RotateCcw, CircleCheck as CheckCircle2, FileText, ArrowLeft, X, Share2, Clock } from 'lucide-react';
import { formatBytes } from '../../lib/utils';
import type { ProcessingResult } from '../../engine/types';

interface ResultPanelProps {
  open: boolean;
  results: ProcessingResult[];
  isDownloaded: boolean;
  onDownload: (result?: ProcessingResult) => void;
  onDownloadAll?: () => void;
  onShare?: (result: ProcessingResult) => void;
  onReset: () => void;
  onBack: () => void;
  elapsedMs?: number;
  title?: string;
}

export function ResultPanel({
  open,
  results,
  isDownloaded,
  onDownload,
  onDownloadAll,
  onShare,
  onReset,
  onBack,
  elapsedMs,
  title = 'Process Complete',
}: ResultPanelProps) {
  if (!open || results.length === 0) return null;
  const first = results[0];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 h-[100dvh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBack}
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm h-[100dvh] w-full"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-[32px] overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 z-10"
      >
        <div className="p-6 space-y-6">
          <button
            onClick={onBack}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className={
              isDownloaded
                ? 'w-16 h-16 rounded-2xl flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-600'
                : 'w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600'
            }>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase italic">
                {isDownloaded ? 'Downloaded' : title}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-tighter">
                {isDownloaded ? 'Saved to device' : 'Your file is ready'}
              </p>
            </div>
          </div>

          {results.length === 1 ? (
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl space-y-3 border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black truncate text-sm uppercase italic">{first.filename}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                    {formatBytes(first.size)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">
                {results.length} files ready
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {results.map((r, i) => (
                  <p key={i} className="text-[10px] font-bold truncate text-neutral-600 dark:text-neutral-300">
                    {r.filename} — {formatBytes(r.size)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {elapsedMs != null && elapsedMs > 0 && (
            <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase text-neutral-400 tracking-widest">
              <Clock className="w-3 h-3" />
              Completed in {(elapsedMs / 1000).toFixed(2)}s
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => onDownload()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
            >
              <Download className="w-4 h-4" />
              {isDownloaded ? 'Download Again' : 'Download File'}
            </button>

            {results.length > 1 && onDownloadAll && (
              <button
                onClick={onDownloadAll}
                className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-black rounded-xl text-[10px] uppercase tracking-widest"
              >
                Download All ({results.length})
              </button>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onBack}
                className="py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-black rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              {onShare && typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={() => onShare(first)}
                  className="py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-black rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              )}
              <button
                onClick={onReset}
                className="py-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-black rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
