import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, CircleCheck as CheckCircle2, FileText, ArrowLeft, X, Share2, Archive, Pencil, Check, MoveVertical as MoreVertical, Trash2, Download } from 'lucide-react';
import { formatBytes, cn } from '../../lib/utils';
import { ImagePreviewModal, type PreviewImage } from './ImagePreviewModal';
import type { ProcessingResult } from '../../engine/types';

interface ResultPanelProps {
  open: boolean;
  results: ProcessingResult[];
  isDownloaded: boolean;
  onDownload: (result?: ProcessingResult) => void;
  onDownloadAll?: () => void;
  onDownloadOne?: (result?: ProcessingResult) => void;
  onDownloadZip?: (zipName: string) => void;
  onShare?: (result: ProcessingResult) => void;
  onRename?: (index: number, newName: string) => void;
  onDelete?: (index: number) => void;
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
  onDownloadOne,
  onDownloadZip,
  onShare,
  onRename,
  onDelete,
  onReset,
  onBack,
  elapsedMs,
  title = 'Process Complete',
}: ResultPanelProps) {
  const [zipName, setZipName] = useState('docbit_results');
  const [zipMode, setZipMode] = useState(false);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  if (!open || results.length === 0) return null;
  const first = results[0];
  const isImage = (m: string) => m.startsWith('image/');
  const hasZip = results.length > 1 && !!onDownloadZip;

  const startRename = (i: number) => {
    setRenamingIndex(i);
    setRenameValue(results[i].filename);
    setMenuIndex(null);
  };

  const confirmRename = () => {
    if (renamingIndex !== null && onRename && renameValue.trim()) {
      onRename(renamingIndex, renameValue.trim());
    }
    setRenamingIndex(null);
    setRenameValue('');
  };

  const handleDownloadOne = (r: ProcessingResult) => {
    if (onDownloadOne) onDownloadOne(r);
    else onDownload(r);
    setMenuIndex(null);
  };

  const handleDelete = (i: number) => {
    onDelete?.(i);
    setMenuIndex(null);
  };

  const previewImages: PreviewImage[] = results.map((r) => ({
    url: r.url,
    filename: r.filename,
    mimeType: r.mimeType,
    size: r.size,
  }));

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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl border border-neutral-200 dark:border-neutral-800 z-10"
      >
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', isDownloaded ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600')}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">{isDownloaded ? 'Downloaded' : title}</h2>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                {results.length} file{results.length !== 1 ? 's' : ''} ready
                {elapsedMs != null && elapsedMs > 0 && ` • ${(elapsedMs / 1000).toFixed(2)}s`}
              </p>
            </div>
          </div>
          <button onClick={onBack} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* ZIP mode toggle */}
          {hasZip && (
            <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
              <button onClick={() => setZipMode(false)} className={cn('flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all', !zipMode ? 'bg-white dark:bg-neutral-700 text-blue-600 shadow-sm' : 'text-neutral-400')}>
                Individual
              </button>
              <button onClick={() => setZipMode(true)} className={cn('flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all', zipMode ? 'bg-white dark:bg-neutral-700 text-blue-600 shadow-sm' : 'text-neutral-400')}>
                Download ZIP
              </button>
            </div>
          )}

          {/* ZIP download */}
          {zipMode && hasZip ? (
            <div className="space-y-3">
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">ZIP Filename</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={zipName}
                    onChange={(e) => setZipName(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white dark:bg-neutral-900 rounded-xl text-sm font-bold border border-neutral-200 dark:border-neutral-700 outline-none focus:border-blue-500"
                    placeholder="docbit_results"
                  />
                  <span className="text-xs font-bold text-neutral-400">.zip</span>
                </div>
              </div>
              <button onClick={() => onDownloadZip?.(zipName)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                <Archive className="w-4 h-4" />
                Download ZIP ({results.length} files)
              </button>
            </div>
          ) : (
            <>
              {/* File list with thumbnails */}
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="group relative bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                    {/* Thumbnail — click to preview */}
                    <button
                      onClick={() => isImage(r.mimeType) && setPreviewIndex(i)}
                      className={cn(
                        'relative w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex-shrink-0 flex items-center justify-center transition-all',
                        isImage(r.mimeType) && 'hover:ring-2 hover:ring-blue-500/40 cursor-pointer'
                      )}
                      title={isImage(r.mimeType) ? 'Click to preview' : r.filename}
                    >
                      {isImage(r.mimeType) ? (
                        <img src={r.url} alt={r.filename} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-6 h-6 text-neutral-400" />
                      )}
                    </button>

                    {/* Filename + size */}
                    <div className="flex-1 min-w-0">
                      {renamingIndex === i ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingIndex(null); }}
                            autoFocus
                            className="flex-1 px-2 py-1 text-xs font-bold bg-white dark:bg-neutral-900 rounded border border-blue-500 outline-none"
                          />
                          <button onClick={confirmRename} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-black truncate text-neutral-900 dark:text-white">{r.filename}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{formatBytes(r.size)}</p>
                        </>
                      )}
                    </div>

                    {/* Actions — 3-dot menu only */}
                    {renamingIndex !== i && (
                      <div className="flex items-center gap-1">
                        {onShare && typeof navigator !== 'undefined' && navigator.share && isImage(r.mimeType) && (
                          <button onClick={() => onShare(r)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all" title="Share">
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className="relative">
                          <button onClick={() => setMenuIndex(menuIndex === i ? null : i)} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all" title="More options">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {menuIndex === i && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setMenuIndex(null)} />
                              <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden min-w-[140px]">
                                <button onClick={() => handleDownloadOne(r)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
                                  <Download className="w-3.5 h-3.5" /> Download
                                </button>
                                {onRename && (
                                  <button onClick={() => startRename(i)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
                                    <Pencil className="w-3.5 h-3.5" /> Rename
                                  </button>
                                )}
                                {onDelete && (
                                  <button onClick={() => handleDelete(i)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Download All / Primary */}
              {results.length > 1 && onDownloadAll && (
                <button onClick={onDownloadAll} className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all">
                  Download All Individually ({results.length})
                </button>
              )}
            </>
          )}

          {/* Footer actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={onBack} className="py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-black rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button onClick={onReset} className="py-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-black rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full-screen image preview */}
      <ImagePreviewModal
        open={previewIndex !== null}
        images={previewImages}
        index={previewIndex ?? 0}
        onClose={() => setPreviewIndex(null)}
        onNavigate={setPreviewIndex}
      />
    </div>,
    document.body
  );
}
