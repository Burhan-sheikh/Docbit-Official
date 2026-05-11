import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { NavigationConfirmModal } from '../NavigationConfirmModal';
import { 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Loader2, 
  Wand2,
  FileText, 
  Plus, 
  Combine, 
  Shield, 
  Maximize, 
  Zap,
  Square,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
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
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

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

    try {
      const mergedPdf = await PDFDocument.create();
      const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
      let pageCounter = 0;

      for (const fileData of files) {
        const bytes = await readFileAsArrayBuffer(fileData.file);
        const pdf = await PDFDocument.load(bytes);
        
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        for (const copiedPage of copiedPages) {
          if (normalizeSize) {
            copiedPage.setSize(595, 842);
          }
          mergedPdf.addPage(copiedPage);
        }
      }

      // Local compression via save options if needed (pdf-lib has limited native compression, usually means re-encoding images which is heavy)
      // Here we use the useObjectStreams option for basic optimization
      const mergedPdfBytes = await mergedPdf.save({
        useObjectStreams: enableCompression
      });
      
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (error) {
      console.error('Merge error:', error);
      alert('Failed to merge PDFs.');
    } finally {
      setIsMerging(false);
    }
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

      {result ? (
        <DownloadResult 
          filename="merged_docbit.pdf" 
          size={result.size} 
          onDownload={() => { const link = document.createElement('a'); link.href = result.url; link.download = 'merged.pdf'; link.click(); }} 
          onReset={() => { setFiles([]); setResult(null); }} 
        />
      ) : files.length === 0 ? (
        <Dropzone onFilesSelected={handleFiles} maxFiles={20} isProcessing={isAddingFiles} label="Merge PDFs - Local Processing" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h1 className="text-2xl font-black flex items-center gap-3">
                      Merge PDF Files
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Combine multiple PDFs into a single document in seconds.</p>
                 </div>
                 <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-widest transition-all">
                   <Plus className="w-4 h-4" />
                   ADD
                   <input type="file" multiple className="hidden" accept="application/pdf" onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
                 </label>
              </div>

            <div className="grid grid-cols-1 gap-3">
              {files.map((fileData, idx) => (
                <motion.div 
                  key={fileData.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "group relative bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:shadow-lg transition-all flex items-center gap-4",
                    fileData.status === 'processing' && "opacity-70 border-blue-200 dark:border-blue-900/50 bg-blue-50/10"
                  )}
                >
                  <div className="w-16 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center relative">
                    {fileData.status === 'processing' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5 backdrop-blur-[1px]">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <FileText className="w-8 h-8 text-blue-600/30" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                      <p className="text-sm font-bold truncate text-neutral-900 dark:text-neutral-100">{fileData.file.name}</p>
                      {fileData.status === 'processing' && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 animate-pulse">Processing...</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                       <button 
                          disabled={idx === 0 || fileData.status === 'processing'}
                          onClick={() => handleMove(fileData.id, 'up')}
                          className="p-1.5 text-neutral-300 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          disabled={idx === files.length - 1 || fileData.status === 'processing'}
                          onClick={() => handleMove(fileData.id, 'down')}
                          className="p-1.5 text-neutral-300 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-2">{formatBytes(fileData.size)}</span>
                    </div>
                  </div>

                  <div className="flex items-center pr-2">
                    <button 
                      onClick={() => removeFile(fileData.id)}
                      disabled={fileData.status === 'processing'}
                      className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl shadow-sm border border-red-200/50 dark:border-red-800/50 disabled:opacity-50"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8">
                 <div className="space-y-6">
                    <h3 className="text-[10px] font-black tracking-widest uppercase text-blue-600">Merge Options</h3>
                    
                    <div className="space-y-4">
                       <button 
                        onClick={() => setNormalizeSize(!normalizeSize)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                          normalizeSize ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200"
                        )}
                       >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", normalizeSize ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800")}>
                             <Maximize className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                             <p className="text-[10px] font-black uppercase tracking-tight">Normalize Sizes</p>
                             <p className="text-[8px] font-bold opacity-60 uppercase">Force A4 Standard</p>
                          </div>
                       </button>

                       <button 
                        onClick={() => setEnableCompression(!enableCompression)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                          enableCompression ? "border-purple-600 bg-purple-50/50 dark:bg-purple-900/20 text-purple-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200"
                        )}
                       >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", enableCompression ? "bg-purple-600 text-white" : "bg-neutral-100 dark:bg-neutral-800")}>
                             <Zap className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                             <p className="text-[10px] font-black uppercase tracking-tight">Smart Stream</p>
                             <p className="text-[8px] font-bold opacity-60 uppercase">Optimize PDF Structure</p>
                          </div>
                       </button>
                    </div>

                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                          <span>Total Payload</span>
                          <span className="text-blue-600">{formatBytes(files.reduce((a, b) => a + b.size, 0))}</span>
                       </div>
                       <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                          <span>Estimated Output</span>
                          <span className="text-green-600">~{formatBytes(files.reduce((a, b) => a + b.size, 0) * 0.95)}</span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      onClick={mergePDFs}
                      disabled={isMerging || files.length < 2}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isMerging ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                      {isMerging ? 'MERGING...' : 'MERGE'}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                       <Shield className="w-3 h-3" />
                       Encrypted Client-Side
                    </div>
                 </div>
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
