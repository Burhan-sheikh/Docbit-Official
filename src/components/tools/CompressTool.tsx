import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument } from 'pdf-lib';
import { 
  Zap, 
  Download, 
  Loader2, 
  Shield, 
  CheckCircle2, 
  X,
  Gauge,
  ArrowRight,
  Monitor,
  Info,
  Layers,
  Type,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';
import { DownloadResult } from '../DownloadResult';

type CompressionLevel = 'low' | 'medium' | 'high';

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; size: number } | null>(null);

  // Advanced Smart Controls
  const [downscaleImages, setDownscaleImages] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [optimizeFonts, setOptimizeFonts] = useState(true);

  const handleFiles = async (files: File[]) => {
    if (files.length > 0) {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setFile(files[0]);
      setResult(null);
      setIsProcessing(false);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      
      // Create a new document to ensure we only copy used objects (Structural Optimization)
      const newPdfDoc = await PDFDocument.create();
      const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => newPdfDoc.addPage(page));

      // Rebuild metadata if requested (stripping it often saves bytes)
      if (removeMetadata) {
        newPdfDoc.setTitle('');
        newPdfDoc.setAuthor('');
        newPdfDoc.setSubject('');
        newPdfDoc.setKeywords([]);
        newPdfDoc.setProducer('');
        newPdfDoc.setCreator('');
      } else {
        // Carry over basic metadata if not removing
        newPdfDoc.setTitle(pdfDoc.getTitle() || '');
        newPdfDoc.setAuthor(pdfDoc.getAuthor() || '');
      }

      // Save with Object Streams enabled for maximum structural compression
      const compressedBytes = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ blob, url, size: blob.size });
    } catch (error) {
      console.error('Compression error:', error);
      alert('Failed to compress PDF. The file might be encrypted or corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reductionPercent = result && file ? Math.round(((file.size - result.size) / file.size) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
      {result ? (
        <div className="space-y-8">
           <DownloadResult 
            filename={`compressed_${file?.name}`} 
            size={result.size} 
            onDownload={() => { const link = document.createElement('a'); link.href = result.url; link.download = `compressed_${file?.name}`; link.click(); }} 
            onReset={() => { setFile(null); setResult(null); }} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white dark:bg-neutral-900 p-6 rounded-[24px] border border-neutral-100 dark:border-neutral-800 text-center space-y-2">
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Original Size</p>
                <p className="text-xl font-black text-neutral-900 dark:text-white uppercase">{formatBytes(file?.size || 0)}</p>
             </div>
             <div className="bg-blue-600 p-6 rounded-[24px] text-center space-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
                   <Zap className="w-12 h-12 text-white" />
                </div>
                <p className="text-[10px] font-black uppercase text-blue-100 tracking-widest">Optimized Result</p>
                <p className="text-2xl font-black text-white uppercase">{formatBytes(result.size)}</p>
             </div>
             <div className={cn(
               "p-6 rounded-[24px] border border-neutral-100 dark:border-neutral-800 text-center space-y-2",
               reductionPercent > 10 ? "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20" : "bg-white dark:bg-neutral-900"
             )}>
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Total Savings</p>
                <p className={cn(
                  "text-xl font-black uppercase",
                  reductionPercent > 10 ? "text-green-600" : "text-neutral-900 dark:text-white"
                )}>{reductionPercent}% Less Weight</p>
             </div>
          </div>
        </div>
      ) : !file ? (
        <Dropzone onFilesSelected={handleFiles} isProcessing={isProcessing} label="Optimize PDF Size" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-10">
                 <div className="pb-8 border-b border-neutral-100 dark:border-neutral-800">
                    <motion.div 
                      layout
                      className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 transition-all hover:border-blue-500"
                    >
                      <div className="w-16 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-blue-600/30" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">Active File</span>
                          <p className="text-sm font-bold truncate text-neutral-900 dark:text-neutral-100">{file.name}</p>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{formatBytes(file.size)}</p>
                      </div>

                      <div className="flex items-center pr-2">
                        <button 
                          onClick={() => setFile(null)}
                          className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-600 hover:bg-neutral-50 transition-all rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {[
                     { id: 'low', label: 'Precision Pack', desc: 'Preserve high fidelity', complexity: 'Low Compression' },
                     { id: 'medium', label: 'Balanced Optima', desc: 'Recommended standard', complexity: 'Medium Compression' },
                     { id: 'high', label: 'High Density', desc: 'Maximum byte stripping', complexity: 'High Compression' }
                   ].map((l) => (
                     <button
                       key={l.id}
                       onClick={() => setLevel(l.id as CompressionLevel)}
                       className={cn(
                         "p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group",
                         level === l.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20" 
                          : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 hover:border-neutral-200"
                       )}
                     >
                       <div className="flex justify-between items-start">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            level === l.id ? "bg-white/20 text-white" : "bg-neutral-50 dark:bg-neutral-800 text-blue-600"
                          )}>
                             <Zap className="w-5 h-5 shadow-sm" />
                          </div>
                          {level === l.id && <motion.div layoutId="check" className="p-1 bg-white rounded-full text-blue-600"><CheckCircle2 className="w-4 h-4" /></motion.div>}
                       </div>
                       <div>
                          <p className="font-black text-xs uppercase tracking-tight">{l.label}</p>
                          <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", level === l.id ? "text-white" : "text-neutral-400")}>{l.complexity}</p>
                       </div>
                     </button>
                   ))}
                 </div>

                 {/* Advanced Controls */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Monitor className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Downscale</span>
                       </div>
                       <button onClick={() => setDownscaleImages(!downscaleImages)} className={cn("w-10 h-5 rounded-full p-1 transition-all", downscaleImages ? "bg-blue-600 flex-row-reverse" : "bg-neutral-200 dark:bg-neutral-800 flex-row")}>
                          <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                       </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Info className="w-4 h-4 text-purple-600" />
                          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Metadata</span>
                       </div>
                       <button onClick={() => setRemoveMetadata(!removeMetadata)} className={cn("w-10 h-5 rounded-full p-1 transition-all", removeMetadata ? "bg-purple-600 flex-row-reverse" : "bg-neutral-200 dark:bg-neutral-800 flex-row")}>
                          <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                       </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Layers className="w-4 h-4 text-orange-600" />
                          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Fonts</span>
                       </div>
                       <button onClick={() => setOptimizeFonts(!optimizeFonts)} className={cn("w-10 h-5 rounded-full p-1 transition-all", optimizeFonts ? "bg-orange-600 flex-row-reverse" : "bg-neutral-200 dark:bg-neutral-800 flex-row")}>
                          <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                       </button>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-4 pt-4">
                    <button 
                      onClick={handleCompress}
                      disabled={isProcessing}
                      className="w-full py-6 bg-neutral-900 dark:bg-blue-600 hover:scale-[1.02] text-white font-black rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-4 text-xl tracking-tight"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 text-yellow-400" />}
                      {isProcessing ? 'STRIPPING BYTES...' : 'PROCESS OPTIMIZATION'}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-400 tracking-[0.3em]">
                       <Shield className="w-4 h-4" />
                       Sandbox Processing • Privacy First
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
