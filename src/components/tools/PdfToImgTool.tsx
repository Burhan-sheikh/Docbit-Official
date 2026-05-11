import React, { useState, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { NavigationConfirmModal } from '../NavigationConfirmModal';
import { 
  Download, 
  Loader2, 
  Wand2,
  Shield, 
  Files,
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
import { SEO } from '../SEO';
import { ToolInfo } from '../ToolInfo';
import { ToolContent } from '../ToolContent';
import { ShieldCheck, Zap, Globe } from 'lucide-react';
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

interface PageThumbnail {
  id: string;
  index: number;
  dataUrl: string;
}

export default function PdfToImgTool() {
  const tool = TOOLS.find(t => t.id === 'pdf-to-img')!;
  const [file, setFile] = useState<File | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg');
  const [quality, setQuality] = useState(0.9);
  const [pageSizeMode, setPageSizeMode] = useState<'all' | 'specific'>('all');
  const [specificPages, setSpecificPages] = useState('');
  
  const [result, setResult] = useState<{ url: string; size: number; isZip: boolean } | null>(null);
  const [viewerImg, setViewerImg] = useState<string | null>(null);
  const [highResViewerImage, setHighResViewerImage] = useState<string | null>(null);
  const [isRenderingViewer, setIsRenderingViewer] = useState(false);

  const blocker = useFileExitConfirm({ isDirty: !!file && !result });

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setIsLoadingFile(true);
    setPages([]);
    setResult(null);
    setPdfProxy(null);

    try {
      const buffer = await readFileAsArrayBuffer(f);
      const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
      const pdf = await loadingTask.promise;
      setPdfProxy(pdf);
      
      const thumbs: PageThumbnail[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        // Small stagger for UX
        if (i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 50));

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
      setFile(null);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleViewPage = async (index: number) => {
    if (!pdfProxy) return;
    setViewerImg(pages[index]?.dataUrl || '');
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
      console.error('High-res thumbnail generation failed:', e);
    } finally {
      setIsRenderingViewer(false);
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
          
          zipFolder?.file(`page_${index + 1}.${ext}`, base64, { base64: true });
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
      <SEO 
        {...SEO_CONFIG.pdfToImg}
        schema={[
          getWebApplicationSchema(
            SEO_CONFIG.pdfToImg.title,
            SEO_CONFIG.pdfToImg.description,
            SEO_CONFIG.pdfToImg.canonical
          ),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: 'PDF to Image', item: SEO_CONFIG.pdfToImg.canonical }
          ]),
          getFAQSchema(tool.faqs || []),
          tool.steps && getHowToSchema(tool.name, tool.description, tool.steps)
        ].filter(Boolean)}
      />

       {result ? (
        <DownloadResult 
          filename={result.isZip ? `extracted_from_${file?.name}.zip` : `extracted_page.${format}`}
          size={result.size}
          onDownload={() => { const link = document.createElement('a'); link.href = result.url; link.download = result.isZip ? 'images.zip' : `image.${format}`; link.click(); }}
          onReset={() => { setFile(null); setPages([]); setResult(null); }}
        />
       ) : !file ? (
        <Dropzone onFilesSelected={handleFiles} isProcessing={isLoadingFile} label="Extract PDF Pages to Images" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h1 className="text-2xl font-black flex items-center gap-3">
                      Convert PDF to Images
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Extract pages from your PDF as high-quality images.</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-4 flex-1">
                 {isLoadingFile && pages.length === 0 ? (
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
                          onClick={() => handleViewPage(p.index)}
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

           <ImageViewer src={highResViewerImage || viewerImg || ''} isOpen={!!viewerImg} onClose={() => { setViewerImg(null); setHighResViewerImage(null); }} loading={isRenderingViewer} />

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8">
                 <div className="space-y-8">
                    <motion.div 
                      layout
                      className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 transition-all hover:border-blue-500 mb-6"
                    >
                      <div className="w-16 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center relative">
                        {isLoadingFile ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                          </div>
                        ) : (
                          <FileText className="w-8 h-8 text-blue-600/30" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{isLoadingFile ? 'Processing' : 'Active'}</span>
                           {isLoadingFile && <span className="ml-2 text-[8px] font-black uppercase text-blue-500 animate-pulse">Analyzing...</span>}
                        </div>
                        <p className="text-xs font-black uppercase text-neutral-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{formatBytes(file.size)}</p>
                      </div>

                      <div className="flex items-center pr-2">
                        <button 
                          disabled={isLoadingFile}
                          onClick={() => { setFile(null); setPages([]); setResult(null); }}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-all rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 disabled:opacity-50"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Files className="w-4 h-4" />
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
                                 { id: 'all', label: 'ALL' },
                                 { id: 'specific', label: 'SELECT' }
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


                      </div>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      onClick={convertPages}
                      disabled={isConverting || pages.length === 0}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                      {isConverting ? 'GENERATING...' : 'GENERATE'}
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
      <ToolContent 
        toolId={tool.id}
        toolName="PDF to Image"
        toolType="Convert"
        description="Convert PDF pages into high-quality JPG or PNG images instantly. Our local engine ensures crystal-clear resolution without uploading your data."
        longContent={TOOL_SEO_CONTENT.pdfToImg}
      />

      <NavigationConfirmModal 
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
