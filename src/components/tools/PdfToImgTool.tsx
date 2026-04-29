import React, { useState, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { 
  FileImage, 
  Download, 
  Loader2, 
  Shield, 
  Image as ImageIcon,
  Settings2,
  FileCheck,
  CheckCircle2,
  Archive,
  Menu,
  X,
  Layers,
  Search,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { readFileAsArrayBuffer, cn, formatBytes } from '../../lib/utils';
import JSZip from 'jszip';
import { ImageViewer } from '../ImageViewer';
import { DownloadResult } from '../DownloadResult';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageThumbnail {
  id: string;
  index: number;
  dataUrl: string;
}

export default function PdfToImgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg');
  const [quality, setQuality] = useState(0.9);
  const [pageSizeMode, setPageSizeMode] = useState<'all' | 'specific'>('all');
  const [specificPages, setSpecificPages] = useState('');
  const [outputType, setOutputType] = useState<'individual' | 'zip'>('zip');
  
  const [result, setResult] = useState<{ url: string; size: number; isZip: boolean } | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setIsProcessing(true);
    setPages([]);
    setResult(null);

    try {
      const buffer = await readFileAsArrayBuffer(f);
      const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
      const pdf = await loadingTask.promise;
      
      const thumbs: PageThumbnail[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, canvas, viewport }).promise;
          thumbs.push({
            id: `p-${i}`,
            index: i - 1,
            dataUrl: canvas.toDataURL('image/jpeg', 0.8)
          });
          if (i % 5 === 0) setPages([...thumbs]);
        }
      }
      setPages(thumbs);
    } catch (e) {
      console.error(e);
      alert('Failed to process PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const convertPages = async () => {
    if (!file) return;
    setIsConverting(true);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
      const pdf = await loadingTask.promise;
      
      const zip = new JSZip();
      const targetIndices = new Set<number>();

      if (pageSizeMode === 'all') {
        for (let i = 0; i < pdf.numPages; i++) targetIndices.add(i);
      } else {
        specificPages.split(',').forEach(p => {
          const val = p.trim();
          if (val.includes('-')) {
            const [s, e] = val.split('-').map(Number);
            for (let i = s; i <= e; i++) if (i > 0 && i <= pdf.numPages) targetIndices.add(i - 1);
          } else {
            const num = Number(val);
            if (num > 0 && num <= pdf.numPages) targetIndices.add(num - 1);
          }
        });
      }

      if (targetIndices.size === 0) {
        alert('Please select valid pages.');
        setIsConverting(false);
        return;
      }

      const zipFolder = zip.folder("images");

      for (const index of Array.from(targetIndices).sort((a, b) => a - b)) {
        const page = await pdf.getPage(index + 1);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher quality for final result
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, canvas, viewport }).promise;
          
          const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const ext = format === 'jpg' ? 'jpg' : 'png';
          const dataUrl = canvas.toDataURL(mime, quality);
          const base64 = dataUrl.split(',')[1];
          
          if (outputType === 'zip') {
             zipFolder?.file(`page_${index + 1}.${ext}`, base64, { base64: true });
          } else if (targetIndices.size === 1) {
             // For single page extraction as single file
             const blob = await (await fetch(dataUrl)).blob();
             const url = URL.createObjectURL(blob);
             setResult({ url, size: blob.size, isZip: false });
             setIsConverting(false);
             return;
          } else {
             // If multiple files and individual requested, fallback to zip as it is more UX friendly
             zipFolder?.file(`page_${index + 1}.${ext}`, base64, { base64: true });
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      setResult({ url, size: content.size, isZip: true });
    } catch (e) {
      console.error(e);
      alert('Conversion failed.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
       {result ? (
        <DownloadResult 
          filename={result.isZip ? `extracted_from_${file?.name}.zip` : `extracted_page.${format}`}
          size={result.size}
          onDownload={() => { const link = document.createElement('a'); link.href = result.url; link.download = result.isZip ? 'images.zip' : `image.${format}`; link.click(); }}
          onReset={() => { setFile(null); setPages([]); setResult(null); }}
        />
       ) : !file ? (
        <Dropzone onFilesSelected={handleFiles} isProcessing={isProcessing} label="Extract PDF Pages to Images" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                      <FileImage className="w-7 h-7 text-blue-600" />
                      Visual Extraction
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Preview high-fidelity data</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-4 flex-1">
                 {isProcessing ? (
                   <div className="h-64 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Scraping pages...</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {pages.map((p) => (
                        <motion.div 
                          key={p.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setPreviewImg(p.dataUrl)}
                          className="relative aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 cursor-zoom-in hover:shadow-xl transition-all group ring-offset-2 ring-blue-500 hover:ring-2"
                        >
                           <img src={p.dataUrl} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Search className="w-8 h-8 text-blue-600" />
                           </div>
                           <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                             Page {p.index + 1}
                           </div>
                        </motion.div>
                      ))}
                   </div>
                 )}
              </div>
           </div>

           <ImageViewer src={previewImg || ''} isOpen={!!previewImg} onClose={() => setPreviewImg(null)} />

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8 sticky top-8">
                 <div className="space-y-8">
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
                          onClick={() => { setFile(null); setPages([]); setResult(null); }}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-all rounded-lg border border-neutral-200/50 dark:border-neutral-700/50"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <ImageIcon className="w-4 h-4" />
                        <h3 className="text-[10px] font-black tracking-widest uppercase">Export Configuration</h3>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Target Format</p>
                            <div className="grid grid-cols-2 gap-2">
                               {['jpg', 'png'].map(f => (
                                 <button key={f} onClick={() => setFormat(f as any)} className={cn("py-2.5 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest transition-all", format === f ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400")}>{f}</button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Page Spectrum</p>
                            <div className="grid grid-cols-2 gap-2">
                               {[
                                 { id: 'all', label: 'Entire Doc' },
                                 { id: 'specific', label: 'Selection' }
                               ].map(m => (
                                 <button key={m.id} onClick={() => setPageSizeMode(m.id as any)} className={cn("py-2.5 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest transition-all", pageSizeMode === m.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400")}>{m.label}</button>
                               ))}
                            </div>
                         </div>

                         {pageSizeMode === 'specific' && (
                           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                              <p className="text-[8px] font-bold text-neutral-400 uppercase">Input Sequence (e.g. 1-3, 5)</p>
                              <input type="text" value={specificPages} onChange={(e) => setSpecificPages(e.target.value)} className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border-none font-bold text-sm focus:ring-2 focus:ring-blue-500" />
                           </motion.div>
                         )}

                         <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Bundle Strategy</p>
                            <div className="grid grid-cols-2 gap-2">
                               {[
                                 { id: 'zip', label: 'ZIP Pack', icon: <Archive className="w-3 h-3" /> },
                                 { id: 'individual', label: 'Single File', icon: <Layers className="w-3 h-3" /> }
                               ].map(t => (
                                 <button key={t.id} onClick={() => setOutputType(t.id as any)} className={cn("flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest transition-all", outputType === t.id ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400")}>
                                   {t.icon}
                                   {t.label}
                                 </button>
                               ))}
                            </div>
                            {outputType === 'individual' && <p className="text-[8px] font-bold text-neutral-400 text-center uppercase">Single page extraction only</p>}
                         </div>
                      </div>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      onClick={convertPages}
                      disabled={isConverting || pages.length === 0}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      {isConverting ? 'Ripping Pixels...' : 'Generate Images'}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                       <Shield className="w-3 h-3" />
                       Non-Invasive API 2.0
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
