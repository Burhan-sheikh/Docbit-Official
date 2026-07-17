import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { useConversionTracker } from '../../hooks/useConversionTracker';
import { NavigationConfirmModal } from '../NavigationConfirmModal';
import { Trash2, ArrowUp, ArrowDown, Download, Loader as Loader2, Wand as Wand2, FileText, Plus, Settings2, Combine, Shield, Maximize, Zap, Square, ShieldCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { readFileAsArrayBuffer, cn, formatBytes } from '../../lib/utils';
import { DownloadResult } from '../DownloadResult';
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

interface FileData {
  id: string;
  file: File;
  size: number;
  status: 'ready' | 'processing';
}

export default function MergeTool() {
  const tool = TOOLS.find(t => t.id === 'merge')!;
  const [files, setFiles] = useState<FileData[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [isAddingFiles, setIsAddingFiles] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Options
  const [normalizeSize, setNormalizeSize] = useState(false);
  const [enableCompression, setEnableCompression] = useState(false);

  const blocker = useFileExitConfirm({ isDirty: files.length > 0 && !result });

  const handleFiles = async (newFiles: File[]) => {
    setIsAddingFiles(true);
    
    // Create pending items
    const pending: FileData[] = newFiles.map(f => ({
      id: `f-${Math.random().toString(36).substr(2, 9)}`,
      file: f,
      size: f.size,
      status: 'processing'
    }));

    setFiles(prev => [...prev, ...pending]);
    setResult(null);
    setIsDownloaded(false);

    // Process each file with a slight staggered delay for UX
    for (const item of pending) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'ready' } : f));
    }
    
    setIsAddingFiles(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const index = files.findIndex(f => f.id === id);
    if (index === -1) return;
    const newFiles = [...files];
    if (direction === 'up' && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
    } else if (direction === 'down' && index < files.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    }
    setFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    setProgress(0);
    setProcessingStage('Initializing engine...');

    try {
      const mergedPdf = await PDFDocument.create();
      const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
      let pageCounter = 0;

      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const currentProgress = Math.round((i / files.length) * 100);
        setProgress(currentProgress);
        setProcessingStage(`Reading file ${i + 1} of ${files.length}...`);

        const bytes = await readFileAsArrayBuffer(fileData.file);
        const pdf = await PDFDocument.load(bytes);
        
        setProcessingStage(`Merging file ${i + 1}...`);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        for (const copiedPage of copiedPages) {
          if (normalizeSize) {
            copiedPage.setSize(595, 842);
          }
          mergedPdf.addPage(copiedPage);
        }
      }

      setProcessingStage('Finalizing PDF...');
      setProgress(100);
      
      // Local compression via save options if needed (pdf-lib has limited native compression, usually means re-encoding images which is heavy)
      // Here we use the useObjectStreams option for basic optimization
      const mergedPdfBytes = await mergedPdf.save({
        useObjectStreams: enableCompression
      });
      
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
      setIsDownloaded(false);
    } catch (error) {
      console.error('Merge error:', error);
      alert('Failed to merge PDFs.');
    } finally {
      setIsMerging(false);
      setProgress(0);
      setProcessingStage('');
    }
  };

  const track = useConversionTracker();

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = 'merged.pdf';
    link.click();
    setIsDownloaded(true);
    track({
      toolId: tool.id,
      toolName: tool.name,
      filename: 'merged.pdf',
      outputType: 'pdf',
      fileSize: result.size,
      success: true,
      processingMethod: 'local',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
      <SEO 
        {...SEO_CONFIG.merge}
        schema={[
          getWebApplicationSchema(
            SEO_CONFIG.merge.title,
            SEO_CONFIG.merge.description,
            SEO_CONFIG.merge.canonical
          ),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: 'Merge PDF', item: SEO_CONFIG.merge.canonical }
          ]),
          getFAQSchema(tool.faqs || []),
          tool.steps && getHowToSchema(tool.name, tool.description, tool.steps)
        ].filter(Boolean)}
      />

      <AnimatePresence>
        {result && (
          <DownloadResult 
            filename="merged_docbit.pdf" 
            size={result.size} 
            onDownload={handleDownload} 
            isDownloaded={isDownloaded}
            onBack={() => setResult(null)}
            onReset={() => { setFiles([]); setResult(null); setIsDownloaded(false); }} 
          />
        )}
      </AnimatePresence>

      {files.length === 0 ? (
        <Dropzone 
          onFilesSelected={handleFiles} 
          maxFiles={10} 
          isProcessing={isAddingFiles}
          label="Select PDF Documents" 
        />
      ) : (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
              <div className="space-y-2">
                <h1 className="text-3xl font-black flex items-center gap-3">
                  Merge PDF Files
                </h1>
                <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Combine multiple PDFs into a single document in seconds.</p>
              </div>
              <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95 text-sm uppercase italic tracking-tighter shrink-0">
                <Plus className="w-5 h-5" />
                ADD MORE
                <input type="file" multiple className="hidden" accept="application/pdf" onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
              </label>
            </div>

            {/* Merge Options - Wide Section at Top */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-8 space-y-6">
                  <div className="flex items-center gap-3 text-blue-600">
                    <Settings2 className="w-5 h-5" />
                    <h3 className="text-xs font-black tracking-widest uppercase">Merge Options</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setNormalizeSize(!normalizeSize)}
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                        normalizeSize ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 shadow-sm" : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", normalizeSize ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800")}>
                        <Maximize className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-tight mb-1">Standardize Output</p>
                        <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Auto-resize all pages to A4 format</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setEnableCompression(!enableCompression)}
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                        enableCompression ? "border-purple-600 bg-purple-50/50 dark:bg-purple-900/20 text-purple-600 shadow-sm" : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", enableCompression ? "bg-purple-600 text-white" : "bg-neutral-100 dark:bg-neutral-800")}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-tight mb-1">Smart Optimization</p>
                        <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Rebuild object streams for smaller size</p>
                      </div>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase text-neutral-400">Queue:</span>
                       <span className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-tighter">{files.length} Files</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase text-neutral-400">Total Size:</span>
                       <span className="text-[10px] font-black text-blue-600 italic">{formatBytes(files.reduce((a, b) => a + b.size, 0))}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                       <span className="text-[8px] font-black uppercase text-neutral-400 italic">Local Processing Only</span>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-neutral-100 dark:border-neutral-800 pt-8 xl:pt-0 xl:pl-8 flex flex-col justify-center">
                  <div className="space-y-6">
                    {isMerging && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{processingStage}</span>
                          <span className="text-[10px] font-black text-blue-600">{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-600" />
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={mergePDFs}
                      disabled={isMerging || files.length < 2}
                      className="group w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      {isMerging ? <Loader2 className="w-6 h-6 animate-spin" /> : <Combine className="w-6 h-6 transition-transform group-hover:scale-110" />}
                      <span className="text-lg tracking-tight uppercase">{isMerging ? 'MERGING...' : 'MERGE PDFS'}</span>
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      Secure Browser Fusion
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Arrangement Queue</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {files.map((fileData, idx) => (
                  <motion.div 
                    key={fileData.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "group relative bg-white dark:bg-neutral-900 rounded-3xl p-4 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:shadow-xl transition-all flex items-center gap-6",
                      fileData.status === 'processing' && "opacity-70 border-blue-200"
                    )}
                  >
                    <div className="w-16 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center relative">
                      {fileData.status === 'processing' ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5">
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                      ) : (
                        <FileText className="w-8 h-8 text-neutral-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">#{idx + 1}</span>
                        <p className="text-sm font-black truncate text-neutral-900 dark:text-neutral-100">{fileData.file.name}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <button 
                            disabled={idx === 0 || fileData.status === 'processing'}
                            onClick={() => handleMove(fileData.id, 'up')}
                            className="p-2 text-neutral-400 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <button 
                            disabled={idx === files.length - 1 || fileData.status === 'processing'}
                            onClick={() => handleMove(fileData.id, 'down')}
                            className="p-2 text-neutral-400 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{formatBytes(fileData.size)}</span>
                      </div>
                    </div>

                    <div className="flex items-center pr-2">
                      <button 
                        onClick={() => removeFile(fileData.id)}
                        disabled={fileData.status === 'processing'}
                        className="w-12 h-12 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-neutral-400 hover:bg-red-500 hover:text-white transition-all rounded-[20px] shadow-sm border border-neutral-200 dark:border-neutral-700 disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
      )}
      <ToolContent 
        toolId={tool.id}
        toolName="Merge PDF"
        toolType="Merge"
        description="Securely combine multiple PDF documents into a single file directly in your browser. No uploads, maximum privacy."
        longContent={TOOL_SEO_CONTENT.merge}
      />

      <NavigationConfirmModal 
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
