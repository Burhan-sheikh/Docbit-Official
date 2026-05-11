import React, { useState, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { NavigationConfirmModal } from '../NavigationConfirmModal';
import { 
  Scissors, 
  Download, 
  Loader2,
  Settings2,
  Layers,
  FileText,
  X,
  Shield,
  FileBox,
  LayoutGrid,
  Check,
  Plus,
  Zap,
  ShieldCheck,
  Globe,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { readFileAsArrayBuffer, cn, formatBytes } from '../../lib/utils';
import JSZip from 'jszip';
import { DownloadResult } from '../DownloadResult';
import { ImageViewer } from '../ImageViewer';
import { SEO } from '../SEO';
import { ToolInfo } from '../ToolInfo';
import { ToolContent } from '../ToolContent';
import { TOOLS } from '../../constants/tools';
import { SEO_CONFIG, APP_DOMAIN } from '../../seo/seoConfig';
import { 
  getWebApplicationSchema, 
  getBreadcrumbSchema,
  getHowToSchema
} from '../../seo/structuredData';
import { getFAQSchema } from '../../utils/schema/faqSchema';

import { TOOL_SEO_CONTENT } from '../../constants/toolSeoContent';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type SplitMode = 'all' | 'range' | 'extract';

export default function SplitTool() {
  const tool = TOOLS.find(t => t.id === 'split')!;
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>('all');
  const [rangeStr, setRangeStr] = useState('');
  const [rangeError, setRangeError] = useState<string | null>(null);
  
  const [result, setResult] = useState<{ url: string; size: number; isZip: boolean; name: string } | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [highResViewerImage, setHighResViewerImage] = useState<string | null>(null);
  const [isRenderingViewer, setIsRenderingViewer] = useState(false);

  const blocker = useFileExitConfirm({ isDirty: !!file && !result });

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setIsLoadingFile(true);
    setFile(f);
    setResult(null);
    setThumbnails([]);
    setPdfProxy(null);
    setPdfDoc(null);
    setSelectedPages(new Set());
    setRangeStr('');
    setRangeError(null);

    try {
      const buffer = await readFileAsArrayBuffer(f);
      const doc = await PDFDocument.load(buffer);
      setPdfDoc(doc);
      setTotalPages(doc.getPageCount());

      const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
      const pdf = await loadingTask.promise;
      setPdfProxy(pdf);
      
      const thumbs: string[] = [];
      const numToThumbnail = Math.min(24, pdf.numPages);
      
      for (let i = 1; i <= numToThumbnail; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, canvas, viewport }).promise;
          thumbs.push(canvas.toDataURL('image/jpeg', 0.8));
          setThumbnails([...thumbs]);
        }
      }
    } catch (e) {
      console.error('File load failed:', e);
      setFile(null);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const togglePageSelection = (index: number) => {
    const next = new Set(selectedPages);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedPages(next);
  };

  const handleViewPage = async (index: number) => {
    if (splitMode === 'extract') {
      togglePageSelection(index);
      return;
    }
    
    if (!pdfProxy) return;
    setViewerImage(thumbnails[index] || '');
    setHighResViewerImage(null);
    setIsRenderingViewer(true);

    try {
      const page = await pdfProxy.getPage(index + 1);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, canvas, viewport }).promise;
        setHighResViewerImage(canvas.toDataURL('image/jpeg', 0.9));
      }
    } catch (e) {
      console.error('Thumbnail generation failed:', e);
    } finally {
      setIsRenderingViewer(false);
    }
  };

  const validateRange = (str: string): number[] => {
    const pages: number[] = [];
    const ranges = str.split(',').map(r => r.trim()).filter(Boolean);
    
    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start <= 0 || end > totalPages || start > end) {
          throw new Error(`Invalid range: ${range}`);
        }
        for (let i = start; i <= end; i++) pages.push(i - 1);
      } else {
        const val = Number(range);
        if (isNaN(val) || val <= 0 || val > totalPages) {
          throw new Error(`Invalid page number: ${range}`);
        }
        pages.push(val - 1);
      }
    }
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  };

  useEffect(() => {
    if (splitMode === 'range' && rangeStr) {
      try {
        validateRange(rangeStr);
        setRangeError(null);
      } catch (e: any) {
        setRangeError(e.message);
      }
    } else {
      setRangeError(null);
    }
  }, [rangeStr, splitMode]);

  const processSplit = async () => {
    if (!file || !pdfDoc) return;
    setIsSplitting(true);

    try {
      if (splitMode === 'all') {
        const zip = new JSZip();
        for (let i = 0; i < totalPages; i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(pdfDoc, [i]);
          newDoc.addPage(page);
          const bytes = await newDoc.save();
          zip.file(`${file.name.replace('.pdf', '')}_p${i + 1}.pdf`, bytes);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        setResult({ url, size: content.size, isZip: true, name: `split_${file.name.replace('.pdf', '')}.zip` });
      } else if (splitMode === 'range') {
        let indices: number[];
        try {
          indices = validateRange(rangeStr);
          if (indices.length === 0) throw new Error('No pages defined');
        } catch (e: any) {
          alert(e.message);
          setIsSplitting(false);
          return;
        }

        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(pdfDoc, indices);
        copied.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResult({ url, size: blob.size, isZip: false, name: `extracted_${file.name}` });
      } else if (splitMode === 'extract') {
        if (selectedPages.size === 0) {
          alert('Please select at least one page.');
          setIsSplitting(false);
          return;
        }
        const indices = Array.from(selectedPages).sort((a, b) => a - b);
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(pdfDoc, indices);
        copied.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResult({ url, size: blob.size, isZip: false, name: `selected_${file.name}` });
      }
    } catch (error) {
      console.error('Split error:', error);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40 px-4">
      <SEO 
        {...SEO_CONFIG.split}
        schema={[
          getWebApplicationSchema(
            SEO_CONFIG.split.title,
            SEO_CONFIG.split.description,
            SEO_CONFIG.split.canonical
          ),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: 'Split PDF', item: SEO_CONFIG.split.canonical }
          ]),
          getFAQSchema(tool.faqs || []),
          tool.steps && getHowToSchema(tool.name, tool.description, tool.steps)
        ].filter(Boolean)}
      />

       {result ? (
        <DownloadResult 
          filename={result.name}
          size={result.size}
          onDownload={() => { const link = document.createElement('a'); link.href = result.url; link.download = result.name; link.click(); }}
          onReset={() => { setFile(null); setPdfDoc(null); setResult(null); setThumbnails([]); setSelectedPages(new Set()); setRangeStr(''); }}
        />
       ) : !file ? (
        <Dropzone onFilesSelected={handleFiles} isProcessing={isLoadingFile} label="Split PDF Document" />
       ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h1 className="text-2xl font-black flex items-center gap-3">
                      Split PDF Pages
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Divide a PDF into separate files or extract specific pages easily.</p>
                 </div>
                 <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95 text-sm uppercase italic tracking-tighter">
                    <Plus className="w-4 h-4" />
                    ADD
                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
                  </label>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">
                      {splitMode === 'extract' ? 'Select Thumbnails' : 'Page Structure'}
                    </h3>
                  </div>
                  {splitMode === 'extract' && (
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      {selectedPages.size} Selected / {totalPages} Total
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {thumbnails.map((p, i) => (
                    <motion.div 
                      key={i} 
                      layout
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewPage(i)} 
                      className={cn(
                        "group relative aspect-[3/4] bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-md",
                        splitMode !== 'extract' ? "border-neutral-200 dark:border-neutral-700 cursor-zoom-in" : 
                        selectedPages.has(i) ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md cursor-pointer" : "border-neutral-100 dark:border-neutral-800 opacity-60 hover:opacity-100 cursor-pointer"
                      )}
                    >
                      <img src={p} className="w-full h-full object-cover" alt={`Page ${i+1}`} />
                      
                      <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 dark:bg-black/90 backdrop-blur shadow-sm rounded-lg text-[10px] font-black text-neutral-600 dark:text-neutral-400">
                        P{i+1}
                      </div>

                      {splitMode === 'extract' && (
                        <div className={cn(
                          "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                          selectedPages.has(i) ? "bg-blue-600 text-white" : "bg-black/20 text-white/0 border border-white/20"
                        )}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      
                      {splitMode !== 'extract' && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      )}
                    </motion.div>
                  ))}
                  {totalPages > thumbnails.length && (
                    <div className="aspect-[3/4] flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 p-4 text-center">
                      <FileBox className="w-6 h-6 text-neutral-300 mb-2" />
                      <p className="text-[10px] font-black uppercase text-neutral-400 leading-tight">
                        +{totalPages - thumbnails.length} More Pages
                      </p>
                    </div>
                  )}
                </div>
              </div>
           </div>

           <ImageViewer 
             src={highResViewerImage || viewerImage || ''} 
             isOpen={!!viewerImage} 
             onClose={() => { setViewerImage(null); setHighResViewerImage(null); }} 
             loading={isRenderingViewer}
           />

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8 sticky top-8">
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Settings2 className="w-4 h-4" />
                      <h3 className="text-[10px] font-black tracking-widest uppercase">Split Strategy</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                       {[
                         { id: 'all', label: 'Split into files', icon: <Layers className="w-4 h-4" />, sub: 'Each page as separate PDF' },
                         { id: 'range', label: 'Custom Range', icon: <Scissors className="w-4 h-4" />, sub: 'e.g. 1-5, 10, 15-20' },
                         { id: 'extract', label: 'Extract Selected', icon: <LayoutGrid className="w-4 h-4" />, sub: 'Select pages from grid' }
                       ].map((mode) => (
                         <button
                           key={mode.id}
                           onClick={() => setSplitMode(mode.id as SplitMode)}
                           className={cn(
                             "group flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all text-left w-full",
                             splitMode === mode.id 
                               ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                               : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm"
                           )}
                         >
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                             splitMode === mode.id ? "bg-white/20" : "bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-200"
                           )}>
                             {React.cloneElement(mode.icon as React.ReactElement, { className: "w-5 h-5 transition-transform group-hover:scale-110" })}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{mode.label}</p>
                             <p className={cn(
                               "text-[8px] font-bold uppercase tracking-widest transition-colors",
                               splitMode === mode.id ? "text-blue-100" : "text-neutral-400"
                             )}>{mode.sub}</p>
                           </div>
                         </button>
                       ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {splitMode === 'range' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Page Range</label>
                            {rangeError && (
                              <div className="flex items-center gap-1 text-[8px] font-black uppercase text-red-500">
                                <AlertCircle className="w-3 h-3" />
                                {rangeError}
                              </div>
                            )}
                          </div>
                          <input 
                            type="text" 
                            placeholder="e.g. 1-5, 8, 12-15"
                            value={rangeStr} 
                            onChange={(e) => setRangeStr(e.target.value)} 
                            className={cn(
                              "w-full px-4 py-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border-2 font-black text-lg transition-all shadow-inner",
                              rangeError ? "border-red-500/50" : "border-transparent focus:border-blue-500"
                            )}
                          />
                          <p className="text-[9px] font-bold text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg italic border border-neutral-100 dark:border-neutral-800">
                            Separate ranges with commas. Max page: {totalPages}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Document Info</p>
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                          {totalPages} Total Pages
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-blue-600">
                            <FileText className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-black text-neutral-900 dark:text-white truncate">{file.name}</p>
                           <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{formatBytes(file.size)}</p>
                         </div>
                      </div>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      onClick={processSplit}
                      disabled={isSplitting || (splitMode === 'range' && (!!rangeError || !rangeStr)) || (splitMode === 'extract' && selectedPages.size === 0)}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSplitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scissors className="w-5 h-5" />}
                      {isSplitting ? 'PROCESSING...' : splitMode === 'range' || splitMode === 'extract' ? 'GENERATE PDF' : 'SPLIT ALL PAGES'}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                       <Shield className="w-3 h-3" />
                       Privacy-First Logic
                    </div>
                 </div>
              </div>
           </div>
        </div>
       )}
       <ToolContent 
         toolId={tool.id}
        toolName="Split PDF"
        toolType="Split"
        description="Extract specific pages, split giant documents into separate files, or select pages visually from thumbnails. Everything runs in-browser for complete data security."
        longContent={TOOL_SEO_CONTENT.split}
      />

      <NavigationConfirmModal 
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
