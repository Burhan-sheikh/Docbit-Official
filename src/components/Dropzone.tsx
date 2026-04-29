import React, { useCallback, useState } from 'react';
import { Upload, File, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  label?: string;
  className?: string;
  isProcessing?: boolean;
}

export function Dropzone({ 
  onFilesSelected, 
  accept = { 'application/pdf': ['.pdf'] }, 
  maxFiles = 1,
  label = "Click to upload or drag and drop",
  className,
  isProcessing = false
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setSuccess(false);
    
    const files = Array.from(e.dataTransfer.files) as File[];
    validateAndProcess(files);
  };

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      validateAndProcess(files);
    }
  };

  const validateAndProcess = (files: File[]) => {
    if (isProcessing) return;

    if (files.length > maxFiles) {
      setError(`Max limit is ${maxFiles} files. Only first ${maxFiles} taken.`);
    }

    const allowedTypes = Object.keys(accept);
    const validFiles = files.filter(file => {
      // Basic check for type or extension
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAllowedType = allowedTypes.includes(file.type);
      const isAllowedExt = Object.values(accept).flat().includes(extension);
      
      return isAllowedType || isAllowedExt;
    });

    if (validFiles.length === 0) {
      setError("No valid files detected. Please check file formats.");
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

    if (maxFiles === 1 && validFiles.length > 1) {
      onFilesSelected([validFiles[0]]);
    } else {
      onFilesSelected(validFiles.slice(0, maxFiles));
    }
  };

  return (
    <div className={cn("w-full transition-all duration-500", className)}>
      <label 
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-[400px] border-2 border-dashed rounded-[32px] cursor-pointer transition-all duration-300 group overflow-hidden",
          isDragging 
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 scale-[0.99] shadow-inner" 
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm",
          isProcessing && "pointer-events-none opacity-80"
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
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin relative z-10" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-xl font-black tracking-tight dark:text-white">Reading Files...</p>
                <p className="text-sm text-neutral-500 font-medium">Processing objects locally for maximum privacy.</p>
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
                {maxFiles > 1 ? <FileText className="w-12 h-12" /> : <File className="w-12 h-12" />}
                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="mb-4 text-2xl font-black tracking-tighter text-neutral-900 dark:text-neutral-100 italic">
                {label}
              </h3>
              
              <div className="flex flex-col gap-2 mb-10">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-xs mx-auto">
                  {maxFiles === 1 ? 'Single file mode enabled.' : `Batch mode: up to ${maxFiles} files allowed.`}
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                   <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Private</span>
                   <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Secured</span>
                   <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Local</span>
                </div>
              </div>
              
              <div className="px-8 py-4 bg-blue-600 group-hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all active:scale-95 flex items-center gap-3">
                <Upload className="w-5 h-5" />
                Select Files
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Messages */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-red-500 text-xs font-bold bg-white dark:bg-neutral-900 border border-red-100 dark:border-red-900/30 px-6 py-2.5 rounded-2xl shadow-xl shadow-red-500/10"
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
                className="flex items-center gap-2 text-green-500 text-xs font-bold bg-white dark:bg-neutral-900 border border-green-100 dark:border-green-900/30 px-6 py-2.5 rounded-2xl shadow-xl shadow-green-500/10"
              >
                <CheckCircle2 className="w-4 h-4" />
                Files analyzed successfully.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input 
          type="file" 
          className="hidden" 
          accept={Object.values(accept).flat().join(',')} 
          multiple={maxFiles > 1}
          onChange={onHandleChange}
        />
      </label>
    </div>
  );
}
