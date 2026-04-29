import React, { useState, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { 
  Scissors, 
  Download, 
  Loader2,
  Settings,
  Split,
  FileBox,
  Shield,
  Layers,
  FileText,
  Search,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { readFileAsArrayBuffer, cn, formatBytes } from '../../lib/utils';
import JSZip from 'jszip';
import { DownloadResult } from '../DownloadResult';
import { ImageViewer } from '../ImageViewer';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type SplitMode = 'range' | 'every-page' | 'every-x-pages' | 'specific-pages';

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>('every-page');
  const [rangeStr, setRangeStr] = useState('');
  const [everyX, setEveryX] = useState(1);
  const [outputFormat, setOutputFormat] = useState<'individual' | 'zip'>('zip');
  
  const [result, setResult] = useState<{ url: string; size: number; isZip: boolean } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setIsSplitting(true);
    setFile(f);
    setResult(null);

    try {
      const buffer = await readFileAsArrayBuffer(f);
      const doc = await PDFDocument.load(buffer);
      setPdfDoc(doc);
      setTotalPages(doc.getPageCount());

      // Generate first few previews - use a copy to avoid detaching
      const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
      const pdf = await loadingTask.promise;
      const prevs: string[] = [];
      const numToPreview = Math.min(6, doc.getPageCount());
      
      for (let i = 1; i <= numToPreview; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, canvas, viewport }).promise;
          prevs.push(canvas.toDataURL('image/jpeg', 0.8));
          if (i % 2 === 0) setPreviews([...prevs]);
        }
      }
      setPreviews(prevs);
    } catch (e) {
      console.error(e);
      alert('Failed to load PDF.');
    } finally {
      setIsSplitting(false);
    }
  };

  const processSplit = async () => {
    if (!file || !pdfDoc) return;
    setIsSplitting(true);

    try {
      const zip = new JSZip();
      let blobs: { blob: Blob; name: string }[] = [];

      const saveBlob = async (doc: PDFDocument, name: string) => {
        const bytes = await doc.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        if (outputFormat === 'zip') zip.file(name, blob);
        else blobs.push({ blob, name });
      };

      if (splitMode === 'every-page') {
        for (let i = 0; i < totalPages; i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(pdfDoc, [i]);
          newDoc.addPage(page);
          await saveBlob(newDoc, `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`);
        }
      } else if (splitMode === 'range' || splitMode === 'specific-pages') {
        const ranges = rangeStr.split(',').map(r => r.trim());
        const newDoc = await PDFDocument.create();
        
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
            const copied = await newDoc.copyPages(pdfDoc, indices.filter(idx => idx >= 0 && idx < totalPages));
            copied.forEach(p => newDoc.addPage(p));
          } else {
            const idx = Number(range) - 1;
            if (idx >= 0 && idx < totalPages) {
              const [page] = await newDoc.copyPages(pdfDoc, [idx]);
              newDoc.addPage(page);
            }
          }
        }
        await saveBlob(newDoc, `split_${file.name}`);
      } else if (splitMode === 'every-x-pages') {
        for (let i = 0; i < totalPages; i += everyX) {
          const newDoc = await PDFDocument.create();
          const indices = Array.from({ length: Math.min(everyX, totalPages - i) }, (_, k) => i + k);
          const copied = await newDoc.copyPages(pdfDoc, indices);
          copied.forEach(p => newDoc.addPage(p));
          await saveBlob(newDoc, `${file.name.replace('.pdf', '')}_part_${Math.floor(i / everyX) + 1}.pdf`);
        }
      }

      if (outputFormat === 'zip') {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        setResult({ url, size: content.size, isZip: true });
      } else {
        // Individual downloads are tricky for many files, usually we'd zip them anyway
        // or trigger multiple downloads. ZIP is more professional for splitting multi-page.
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        setResult({ url, size: content.size, isZip: true });
      }
    } catch (error) {
      console.error('Split error:', error);
      alert('Error splitting PDF. Check parameters.');
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
       {result ? (
        <DownloadResult 
          filename={result.isZip ? `split_${file?.name.replace('.pdf', '')}.zip` : `extracted_${file?.name}`}
          size={result.size}
          onDownload={() => { const link = document.createElement('a'); link.href = result.url; link.download = result.isZip ? 'split.zip' : 'split.pdf'; link.click(); }}
          onReset={() => { setFile(null); setPdfDoc(null); setResult(null); setPreviews([]); }}
        />
       ) : !file ? (
        <Dropzone onFilesSelected={handleFiles} isProcessing={isSplitting} label="Split PDF Document" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                      <Scissors className="w-7 h-7 text-blue-600" />
                      Split Strategy
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Total {totalPages} Pages Detected</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'every-page', label: 'Single-Page PDFs', icon: <Layers className="w-5 h-5" />, desc: 'Convert every page into its own file' },
                    { id: 'range', label: 'Custom Page Range', icon: <Settings className="w-5 h-5" />, desc: 'Define range like "1-5" or chunks' },
                    { id: 'every-x-pages', label: 'Fixed Chunks', icon: <FileBox className="w-5 h-5" />, desc: 'Split into files containing X pages' },
                    { id: 'specific-pages', label: 'Extract Selection', icon: <Search className="w-5 h-5" />, desc: 'Extract specific pages like "2, 5, 10"' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSplitMode(m.id as SplitMode)}
                      className={cn(
                        "flex items-center gap-6 p-6 rounded-[28px] border-2 transition-all text-left group",
                        splitMode === m.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20" 
                          : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        splitMode === m.id ? "bg-white/20 text-white" : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400"
                      )}>
                        {m.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase tracking-tight">{m.label}</p>
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-widest opacity-60",
                          splitMode === m.id ? "text-white" : "text-neutral-400"
                        )}>{m.desc}</p>
                      </div>
                    </button>
                  ))}
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 px-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Page Preview</h3>
                 </div>
                 <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                   {previews.map((p, i) => (
                     <div key={i} onClick={() => setPreviewImage(p)} className="aspect-[1/1.414] bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 cursor-zoom-in hover:shadow-lg transition-all">
                       <img src={p} className="w-full h-full object-cover" alt={`Preview ${i+1}`} />
                     </div>
                   ))}
                 </div>
              </div>
           </div>

           <ImageViewer src={previewImage || ''} isOpen={!!previewImage} onClose={() => setPreviewImage(null)} />

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8 sticky top-8">
                 <div className="space-y-6">
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
                        <p className="text-[10px] font-bold text-neutral-400 uppercase">{formatBytes(file.size)}</p>
                      </div>

                      <div className="flex items-center pr-2">
                        <button 
                          onClick={() => { setFile(null); setPdfDoc(null); setResult(null); setPreviews([]); }}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-600 transition-all rounded-lg border border-neutral-200/50 dark:border-neutral-700/50"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>

                    <div className="space-y-4">
                       {(splitMode === 'range' || splitMode === 'specific-pages') && (
                         <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Range Input</p>
                           <input 
                             type="text" 
                             placeholder={splitMode === 'range' ? "e.g. 1-5, 8-10" : "e.g. 2, 5, 9"}
                             value={rangeStr} 
                             onChange={(e) => setRangeStr(e.target.value)} 
                             className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border-none font-black text-lg focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                       )}
                       {splitMode === 'every-x-pages' && (
                         <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Pages per File</p>
                           <input 
                             type="number" 
                             min="1"
                             value={everyX} 
                             onChange={(e) => setEveryX(parseInt(e.target.value) || 1)} 
                             className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border-none font-black text-2xl focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                       )}

                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Output Container</p>
                          <div className="grid grid-cols-2 gap-2">
                             {['zip', 'individual'].map(fmt => (
                               <button 
                                 key={fmt} 
                                 onClick={() => setOutputFormat(fmt as any)}
                                 className={cn(
                                   "py-2 rounded-xl border-2 font-bold text-[8px] uppercase tracking-widest transition-all",
                                   outputFormat === fmt ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400"
                                 )}
                               >{fmt === 'zip' ? 'Bundled ZIP' : 'Loose PDFs'}</button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      onClick={processSplit}
                      disabled={isSplitting}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isSplitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      {isSplitting ? 'Segmenting...' : 'Export Splitted Data'}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                       <Shield className="w-3 h-3" />
                       Instant Sandbox Logic
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
