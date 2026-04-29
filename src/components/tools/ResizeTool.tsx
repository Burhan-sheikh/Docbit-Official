import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { 
  Fullscreen, 
  Download, 
  Loader2,
  FileText,
  Settings,
  Shield,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { readFileAsArrayBuffer, cn, formatBytes } from '../../lib/utils';
import { DownloadResult } from '../DownloadResult';

type Presets = 'A4' | 'A5' | 'Letter' | 'Custom';

export default function ResizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Presets>('A4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customWidth, setCustomWidth] = useState(595);
  const [customHeight, setCustomHeight] = useState(842);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length > 0) {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setFile(files[0]);
      setResult(null);
      setIsProcessing(false);
    }
  };

  const processResize = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const bytes = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(bytes);
      const newPdfDoc = await PDFDocument.create();

      let targetSize: [number, number];
      switch (preset) {
        case 'A4': targetSize = PageSizes.A4; break;
        case 'A5': targetSize = PageSizes.A5; break;
        case 'Letter': targetSize = PageSizes.Letter; break;
        case 'Custom': targetSize = [customWidth, customHeight]; break;
      }

      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const originalPage = pages[i];
        const { width, height } = originalPage.getSize();
        const newPage = newPdfDoc.addPage([targetSize[0], targetSize[1]]);
        const [embeddedPage] = await newPdfDoc.embedPdf(pdfDoc, [i]);
        const scale = Math.min(targetSize[0] / width, targetSize[1] / height);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const x = (targetSize[0] - scaledWidth) / 2;
        const y = (targetSize[1] - scaledHeight) / 2;
        newPage.drawPage(embeddedPage, { x, y, width: scaledWidth, height: scaledHeight });
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (e) {
      console.error(e);
      alert('Error resizing PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `resized_${file.name}`;
    link.click();
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
       {result ? (
        <DownloadResult 
          filename={`resized_${file?.name}`} 
          size={result.size} 
          onDownload={handleDownload} 
          onReset={handleReset} 
        />
       ) : !file ? (
        <Dropzone onFilesSelected={handleFiles} isProcessing={isProcessing} label="PDF Page Scale Engine" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                      <Fullscreen className="w-7 h-7 text-blue-600" />
                      Geometry Presets
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Standardize your document dimensions</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'A4', label: 'Standard A4', sub: '210 × 297 mm' },
                    { id: 'Letter', label: 'US Letter', sub: '8.5 × 11.0 in' },
                    { id: 'A5', label: 'Compact A5', sub: '148 × 210 mm' },
                    { id: 'Custom', label: 'Custom Canvas', sub: 'Defined by User' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p.id as Presets)}
                      className={cn(
                        "flex items-center gap-4 p-6 rounded-[28px] border-2 transition-all text-left",
                        preset === p.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20" 
                          : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        preset === p.id ? "bg-white/20" : "bg-neutral-50 dark:bg-neutral-800"
                      )}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{p.label}</p>
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-widest opacity-60",
                          preset === p.id ? "text-white" : "text-neutral-400"
                        )}>{p.sub}</p>
                      </div>
                    </button>
                  ))}
              </div>

              {preset === 'Custom' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded-[32px] border border-neutral-100 dark:border-neutral-800"
                >
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Width (Points)</label>
                        <input 
                          type="number" 
                          value={customWidth} 
                          onChange={(e) => setCustomWidth(Number(e.target.value))} 
                          className="w-full px-6 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-black"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Height (Points)</label>
                        <input 
                          type="number" 
                          value={customHeight} 
                          onChange={(e) => setCustomHeight(Number(e.target.value))} 
                          className="w-full px-6 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-black"
                        />
                      </div>
                   </div>
                </motion.div>
              )}
           </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8 sticky top-8">
                 <div className="space-y-4">
                    <motion.div 
                      layout
                      className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 transition-all hover:border-blue-500 mb-6"
                    >
                      <div className="w-16 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-blue-600/30" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">Active</span>
                        </div>
                        <p className="text-xs font-black uppercase text-neutral-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{formatBytes(file.size)}</p>
                      </div>

                      <div className="flex items-center pr-2">
                        <button 
                          onClick={handleReset}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-all rounded-lg border border-neutral-200/50 dark:border-neutral-700/50"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                    
                    <div className="flex items-center gap-3 text-blue-600">
                       <Shield className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Local Render Only</span>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      onClick={processResize}
                      disabled={isProcessing}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      {isProcessing ? 'Adjusting...' : 'Apply Resizing'}
                    </button>
                    <button 
                      onClick={handleReset}
                      className="w-full mt-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600"
                    >Discard Changes</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
