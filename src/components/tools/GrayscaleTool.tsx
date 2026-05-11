import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { NavigationConfirmModal } from '../NavigationConfirmModal';
import { 
  Palette, 
  Download, 
  Loader2,
  Settings2,
  FileText,
  Shield,
  LayoutGrid,
  Check,
  Printer,
  Zap,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { readFileAsArrayBuffer, cn, formatBytes } from '../../lib/utils';
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

type GrayscaleMode = 'all' | 'selected';
type ConversionType = 'grayscale' | 'pure-bw';

export default function GrayscaleTool() {
  const tool = TOOLS.find(t => t.id === 'grayscale-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [pdfProxy, setPdfProxy] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<GrayscaleMode>('all');
  const [conversionType, setConversionType] = useState<ConversionType>('grayscale');
  const [bwThreshold, setBwThreshold] = useState(128);
  
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
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
    setSelectedPages(new Set());

    try {
      const buffer = await readFileAsArrayBuffer(f);
      const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
      const pdf = await loadingTask.promise;
      setPdfProxy(pdf);
      setTotalPages(pdf.numPages);

      const thumbs: string[] = [];
      const numToThumbnail = Math.min(12, pdf.numPages);
      
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
    if (mode === 'selected') {
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
      console.error('Thumbnail high-res failed:', e);
    } finally {
      setIsRenderingViewer(false);
    }
  };

  const applyGrayscaleToContext = (ctx: CanvasRenderingContext2D, width: number, height: number, type: ConversionType, threshold: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Use Rec. 709 luminance formula for better professional accuracy
      // 0.2126 R + 0.7152 G + 0.0722 B
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      
      if (type === 'pure-bw') {
        const bw = gray > threshold ? 255 : 0;
        data[i] = bw;
        data[i+1] = bw;
        data[i+2] = bw;
      } else {
        data[i] = gray;
        data[i+1] = gray;
        data[i+2] = gray;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const processGrayscale = async () => {
    if (!file || !pdfProxy) return;
    setIsProcessing(true);

    try {
      const outPdf = await PDFDocument.create();
      const pagesToProcess = mode === 'all' 
        ? Array.from({ length: totalPages }, (_, i) => i + 1)
        : Array.from(selectedPages).sort((a, b) => a - b).map(idx => idx + 1);

      if (pagesToProcess.length === 0 && mode === 'selected') {
        alert('Please select at least one page.');
        setIsProcessing(false);
        return;
      }

      for (const pageNum of pagesToProcess) {
        const page = await pdfProxy.getPage(pageNum);
        
        // Professional 300 DPI setting
        const targetDPI = 300;
        const scaleFactor = targetDPI / 72;
        
        const originalViewport = page.getViewport({ scale: 1.0 });
        const { width: originalWidth, height: originalHeight } = originalViewport;
        const renderViewport = page.getViewport({ scale: scaleFactor });
        
        const canvas = document.createElement('canvas');
        canvas.width = renderViewport.width;
        canvas.height = renderViewport.height;
        
        const ctx = canvas.getContext('2d', { 
            willReadFrequently: true,
            alpha: false
        });
        
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          await (page as any).render({ 
            canvasContext: ctx, 
            viewport: renderViewport,
            intent: 'print'
          }).promise;

          applyGrayscaleToContext(ctx, canvas.width, canvas.height, conversionType, bwThreshold);
          
          // Using High-Quality PNG for Pure B&W to preserve sharp text, 
          // and ultra-high quality JPEG for grayscale.
          let imgBytes: ArrayBuffer;
          if (conversionType === 'pure-bw') {
             const imgData = canvas.toDataURL('image/png');
             imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
          } else {
             const imgData = canvas.toDataURL('image/jpeg', 0.98);
             imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
          }
          
          const embeddedImg = (conversionType === 'pure-bw') 
             ? await outPdf.embedPng(imgBytes)
             : await outPdf.embedJpg(imgBytes);
          
          const newPage = outPdf.addPage([originalWidth, originalHeight]);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: originalWidth,
            height: originalHeight,
          });
        }
        canvas.width = 0;
        canvas.height = 0;
      }

      const bytes = await outPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (e) {
      console.error('Grayscale processing error:', e);
      alert('An error occurred during processing. Please try a smaller file or different document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40 px-4">
      <SEO 
        {...SEO_CONFIG.grayscalePdf}
        schema={[
          getWebApplicationSchema(
            SEO_CONFIG.grayscalePdf.title,
            SEO_CONFIG.grayscalePdf.description,
            SEO_CONFIG.grayscalePdf.canonical
          ),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: 'Grayscale PDF', item: SEO_CONFIG.grayscalePdf.canonical }
          ]),
          getFAQSchema(tool.faqs || []),
          tool.steps && getHowToSchema(tool.name, tool.description, tool.steps)
        ].filter(Boolean)}
      />

       {result ? (
        <DownloadResult 
          filename={`grayscale_${file?.name}`}
          size={result.size}
          onDownload={() => { const link = document.createElement('a'); link.href = result.url; link.download = `grayscale_${file?.name}`; link.click(); }}
          onReset={() => { setFile(null); setPdfProxy(null); setResult(null); setThumbnails([]); setSelectedPages(new Set()); }}
        />
       ) : !file ? (
        <Dropzone onFilesSelected={handleFiles} isProcessing={isLoadingFile} label="Select PDF to Grayscale" />
       ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h1 className="text-2xl font-black flex items-center gap-3">
                      Grayscale Configuration
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Transform color PDF pages into print-friendly monochrome.</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Page Selection</h3>
                  </div>
                  {mode === 'selected' && (
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
                        "group relative aspect-[3/4] bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden border transition-all cursor-pointer shadow-sm",
                        mode === 'all' ? "border-neutral-200 dark:border-neutral-700 cursor-zoom-in" : 
                        selectedPages.has(i) ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md" : "border-neutral-100 dark:border-neutral-800 opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={p} className="w-full h-full object-cover" alt={`Page ${i+1}`} />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 dark:bg-black/90 backdrop-blur shadow-sm rounded-lg text-[10px] font-black text-neutral-600 dark:text-neutral-400">
                        P{i+1}
                      </div>
                      
                      {mode === 'selected' && (
                        <div className={cn(
                          "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                          selectedPages.has(i) ? "bg-blue-600 text-white" : "bg-black/20 text-white/0 border border-white/20"
                        )}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {totalPages > 12 && (
                    <div className="aspect-[3/4] flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 p-4 text-center">
                       <FileText className="w-6 h-6 text-neutral-300 mb-2" />
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
                      <h3 className="text-[10px] font-black tracking-widest uppercase">Grayscale Options</h3>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Page Range</p>
                         <div className="grid grid-cols-2 gap-2">
                           {[
                             { id: 'all', label: 'All Pages' },
                             { id: 'selected', label: 'Select Pages' }
                           ].map(m => (
                             <button
                               key={m.id}
                               onClick={() => setMode(m.id as GrayscaleMode)}
                               className={cn(
                                 "py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                 mode === m.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200"
                               )}
                             >{m.label}</button>
                           ))}
                         </div>
                       </div>

                       <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Conversion Mode</p>
                         <div className="grid grid-cols-2 gap-2">
                           {[
                             { id: 'grayscale', label: 'True Grayscale' },
                             { id: 'pure-bw', label: 'Pure B&W' }
                           ].map(t => (
                             <button
                               key={t.id}
                               onClick={() => setConversionType(t.id as ConversionType)}
                               className={cn(
                                 "py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                 conversionType === t.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200"
                               )}
                             >{t.label}</button>
                           ))}
                         </div>
                         
                         {conversionType === 'pure-bw' && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl space-y-3 mt-2 overflow-hidden border border-neutral-100 dark:border-neutral-800"
                           >
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">B&W Threshold</label>
                                <span className="text-[10px] font-black text-blue-600">{bwThreshold}</span>
                              </div>
                              <input 
                                type="range"
                                min="0"
                                max="255"
                                value={bwThreshold}
                                onChange={(e) => setBwThreshold(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                              <p className="text-[8px] text-neutral-400 font-bold leading-tight">Lower for dark scans, higher for light originals.</p>
                           </motion.div>
                         )}
                       </div>

                       <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Printer Optimized</p>
                         <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-green-600">
                           <ShieldCheck className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">300 DPI High-Res Mode</span>
                         </div>
                       </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase text-neutral-400">Document Info</p>
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                          {totalPages} Pages
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
                      onClick={processGrayscale}
                      disabled={isProcessing}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                      {isProcessing ? 'PROCESSING...' : 'MAKE GRAYSCALE'}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                       <Shield className="w-3 h-3" />
                       Local Engine Logic
                    </div>
                 </div>
              </div>
           </div>
        </div>
       )}
       <ToolContent 
         toolId={tool.id}
        toolName="Grayscale PDF"
        toolType="Optimize"
        description="Convert color PDF files into high-quality grayscale or black and white versions. Designed for saving ink and meeting professional document standards without server uploads."
        longContent={TOOL_SEO_CONTENT.grayscalePdf}
      />

      <NavigationConfirmModal 
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
