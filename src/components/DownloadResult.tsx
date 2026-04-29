import React from 'react';
import { Download, RotateCcw, CheckCircle2, FileText, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatBytes } from '../lib/utils';

interface DownloadResultProps {
  filename: string;
  size: number;
  onDownload: () => void;
  onReset: () => void;
  title?: string;
}

export function DownloadResult({ filename, size, onDownload, onReset, title = "Process Complete" }: DownloadResultProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="max-w-xl mx-auto w-full"
    >
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl shadow-blue-500/10">
        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
             <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-3xl flex items-center justify-center shadow-inner">
               <CheckCircle2 className="w-10 h-10" />
             </div>
             <div>
               <h2 className="text-2xl font-black tracking-tight">{title}</h2>
               <p className="text-neutral-500 dark:text-neutral-400 font-medium">Your file is ready for download.</p>
             </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl space-y-4 border border-neutral-100 dark:border-neutral-800">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold truncate text-lg">{filename}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[8px] font-black uppercase tracking-widest rounded-md">Verified Size</span>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest truncate">{formatBytes(size)}</p>
                  </div>
                </div>
             </div>
             
             <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700/50 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <span>Exact File Size</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{size.toLocaleString()} Bytes</span>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <button 
               onClick={onDownload}
               className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
               <Download className="w-6 h-6" />
               Download Document
             </button>
             <button 
               onClick={onReset}
               className="w-full py-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white font-bold transition-all flex items-center justify-center gap-2"
             >
               <RotateCcw className="w-4 h-4" />
               Process Another File
             </button>
          </div>
        </div>

        <div className="bg-neutral-900 p-4 flex items-center justify-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-wider">
           <Zap className="w-3 h-3" />
           Instant Client-Side Export
        </div>
      </div>
    </motion.div>
  );
}
