import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Plus, Loader as Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { ValidationRules } from '../../engine/types';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  validation: ValidationRules;
  label?: string;
  className?: string;
  isProcessing?: boolean;
}

export function UploadZone({
  onFilesSelected,
  validation,
  label = 'Click to upload or drag and drop',
  className,
  isProcessing = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptStr = validation.acceptedExtensions.map((e) => `.${e}`).join(',');

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (isProcessing) return;
      setError(null);
      setSuccess(false);
      const arr = Array.from(files) as File[];
      if (arr.length === 0) {
        setError('No files detected.');
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onFilesSelected(arr);
    },
    [isProcessing, onFilesSelected]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className={cn('w-full transition-all duration-500', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={onKeyDown}
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-[400px] border-2 border-dashed rounded-[32px] cursor-pointer transition-all duration-300 group overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500/30',
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 scale-[0.99] shadow-inner'
            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm',
          isProcessing && 'pointer-events-none opacity-80'
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
              <div className="space-y-2 text-center">
                <p className="text-xl font-black tracking-tight dark:text-white">Reading Files...</p>
                <p className="text-sm text-neutral-500 font-medium">Processing locally for maximum privacy.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-5 pb-6 px-10 text-center"
            >
              <div className="w-24 h-24 mb-8 bg-neutral-100 dark:bg-neutral-800 rounded-[32px] flex items-center justify-center text-neutral-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative">
                {validation.maxFiles > 1 ? <FileText className="w-12 h-12" /> : <Upload className="w-12 h-12" />}
              </div>
              <h3 className="mb-4 text-2xl font-black tracking-tighter text-neutral-900 dark:text-neutral-100 italic">
                {label}
              </h3>
              <div className="flex flex-col gap-3 mb-10">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-xs mx-auto">
                  {validation.maxFiles === 1
                    ? 'Single file mode.'
                    : `Batch mode: up to ${validation.maxFiles} files.`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm mx-auto">
                  {validation.acceptedExtensions.slice(0, 8).map((ext) => (
                    <span
                      key={ext}
                      className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-md"
                    >
                      {ext === 'jpeg' ? 'JPG' : ext.toUpperCase()}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Max {validation.maxFileSizeMb}MB per file
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Private</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Local</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Secure</span>
                </div>
              </div>
              <div className="px-8 py-4 bg-blue-600 group-hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3">
                <Plus className="w-5 h-5" />
                Select Files
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-red-500 text-xs font-bold bg-white dark:bg-neutral-900 border border-red-100 dark:border-red-900/30 px-6 py-2.5 rounded-2xl shadow-xl"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
            {success && !error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-green-500 text-xs font-bold bg-white dark:bg-neutral-900 border border-green-100 dark:border-green-900/30 px-6 py-2.5 rounded-2xl shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                Files added successfully.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptStr}
          multiple={validation.maxFiles > 1}
          onChange={onChange}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
