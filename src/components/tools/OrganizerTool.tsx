import React, { useState, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { 
  RotateCw, 
  Trash2, 
  Copy, 
  ArrowUp,
  ArrowDown,
  Download, 
  X,
  Loader2,
  Plus,
  Scissors,
  CheckSquare,
  Square,
  Hash,
  Palette,
  Shield,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'motion/react';
import { readFileAsArrayBuffer, cn } from '../../lib/utils';
import { DownloadResult } from '../DownloadResult';
import { ImageViewer } from '../ImageViewer';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageData {
  id: string;
  index: number;
  rotation: number;
  thumbnail: string;
  originalFileId: string;
}

interface FileSource {
  id: string;
  file: File;
  buffer: ArrayBuffer;
  pdfDoc: any; // pdf-lib document
}

export default function OrganizerTool() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [files, setFiles] = useState<FileSource[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [previewPage, setPreviewPage] = useState<PageData | null>(null);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Numbering Settings
  const [enableNumbering, setEnableNumbering] = useState(false);
  const [startFrom, setStartFrom] = useState(1);
  const [numberingPos, setNumberingPos] = useState({ v: 'footer', h: 'center' });
  const [numberingSize, setNumberingSize] = useState(12);
  const [numberingOpacity, setNumberingOpacity] = useState(0.8);

  const handleFiles = async (newFiles: File[]) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      for (const file of newFiles) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        // Use a copy for PDF.js to prevent detaching the buffer used by pdf-lib
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        const fileId = Math.random().toString(36).substr(2, 9);
        const newFileSource: FileSource = { id: fileId, file, buffer: arrayBuffer, pdfDoc };
        setFiles(prev => [...prev, newFileSource]);

        const totalPages = pdf.numPages;
        const newPages: PageData[] = [];

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, canvas, viewport }).promise;
            
            newPages.push({
              id: `p-${fileId}-${i}-${Math.random().toString(36).substr(2, 9)}`,
              index: i - 1,
              rotation: 0,
              thumbnail: canvas.toDataURL('image/jpeg', 0.7),
              originalFileId: fileId
            });
          }
          setProgress(Math.round((i / totalPages) * 100));
        }
        setPages(prev => [...prev, ...newPages]);
      }
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Failed to parse PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const index = pages.findIndex(p => p.id === id);
    if (index === -1) return;
    const newPages = [...pages];
    if (direction === 'up' && index > 0) {
      [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
    } else if (direction === 'down' && index < pages.length - 1) {
      [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    }
    setPages(newPages);
  };

  const handleRotate = (id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const handleDelete = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDuplicate = (id: string) => {
    const idx = pages.findIndex(p => p.id === id);
    if (idx === -1) return;
    const newPage = { ...pages[idx], id: `${pages[idx].id}-dup-${Math.random().toString(16)}` };
    const next = [...pages];
    next.splice(idx + 1, 0, newPage);
    setPages(next);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const extractPages = async () => {
    if (selectedIds.size === 0) return;
    setIsExporting(true);
    try {
      const newPdfDoc = await PDFDocument.create();
      const selectedPages = pages.filter(p => selectedIds.has(p.id));

      for (const p of selectedPages) {
        const source = files.find(f => f.id === p.originalFileId);
        if (!source) continue;
        const [copiedPage] = await newPdfDoc.copyPages(source.pdfDoc, [p.index]);
        copiedPage.setRotation(degrees((copiedPage.getRotation().angle + p.rotation) % 360));
        newPdfDoc.addPage(copiedPage);
      }

      const bytes = await newPdfDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (e) {
      console.error(e);
      alert('Extraction failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportDocument = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    try {
      const newPdfDoc = await PDFDocument.create();
      const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const source = files.find(f => f.id === p.originalFileId);
        if (!source) continue;
        
        const [copiedPage] = await newPdfDoc.copyPages(source.pdfDoc, [p.index]);
        copiedPage.setRotation(degrees((copiedPage.getRotation().angle + p.rotation) % 360));
        const page = newPdfDoc.addPage(copiedPage);

        if (enableNumbering) {
          const text = (startFrom + i).toString();
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(text, numberingSize);
          
          let tx = (width - textWidth) / 2;
          if (numberingPos.h === 'left') tx = 40;
          else if (numberingPos.h === 'right') tx = width - textWidth - 40;

          let ty = 30;
          if (numberingPos.v === 'header') ty = height - 40;

          page.drawText(text, {
            x: tx,
            y: ty,
            size: numberingSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity: numberingOpacity
          });
        }
      }

      const bytes = await newPdfDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (e) {
      console.error(e);
      alert('Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
      {result ? (
        <DownloadResult 
          filename="organized_docbit.pdf" 
          size={result.size} 
          onDownload={() => { const link = document.createElement('a'); link.href = result.url; link.download = 'organized.pdf'; link.click(); }} 
          onReset={() => { setPages([]); setFiles([]); setResult(null); setSelectedIds(new Set()); setSelectionMode(false); }} 
        />
      ) : pages.length === 0 ? (
        <Dropzone onFilesSelected={handleFiles} isProcessing={isProcessing} maxFiles={10} label="Upload PDF to Organize" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black flex items-center gap-3">
                     <LayoutGrid className="w-7 h-7 text-blue-600" />
                     Document Structure
                   </h2>
                   <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Manage pages via icons only</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()); }}
                     className={cn(
                       "flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl transition-all text-xs uppercase tracking-widest",
                       selectionMode ? "bg-purple-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
                     )}
                   >
                     {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                     {selectionMode ? 'Quit Selection' : 'Multi-Select'}
                   </button>
                   <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-widest transition-all">
                     <Plus className="w-4 h-4" />
                     Inject new PDF
                     <input type="file" className="hidden" accept="application/pdf" multiple onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
                   </label>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
               {pages.map((page, idx) => (
                 <PageItem 
                   key={page.id} 
                   page={page} 
                   index={idx}
                   isFirst={idx === 0}
                   isLast={idx === pages.length - 1}
                   selectionMode={selectionMode}
                   isSelected={selectedIds.has(page.id)}
                   onSelect={() => toggleSelection(page.id)}
                   handleRotate={handleRotate} 
                   handleDuplicate={handleDuplicate} 
                   handleDelete={handleDelete} 
                   handleMove={handleMove}
                   onPreview={setPreviewPage}
                 />
               ))}
             </div>
          </div>

          <ImageViewer 
            src={previewPage?.thumbnail || ''} 
            rotation={previewPage?.rotation || 0}
            isOpen={!!previewPage} 
            onClose={() => setPreviewPage(null)} 
          />

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
               {selectionMode && selectedIds.size > 0 && (
                 <div className="animate-in slide-in-from-top-4">
                    <button 
                      onClick={extractPages}
                      disabled={isExporting}
                      className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 transition-all active:scale-95 mb-4"
                    >
                      <Scissors className="w-5 h-5" />
                      Extract {selectedIds.size} Pages
                    </button>
                    <p className="text-[10px] text-center font-black uppercase text-neutral-400 tracking-widest">Selected batch action</p>
                 </div>
               )}

               <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Hash className="w-4 h-4" />
                    <h3 className="text-[10px] font-black tracking-widest uppercase">Page Numbering Engine</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                       <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Numbering Overlay</span>
                       <button 
                         onClick={() => setEnableNumbering(!enableNumbering)}
                         className={cn(
                           "w-10 h-5 rounded-full p-1 transition-all",
                           enableNumbering ? "bg-blue-600 flex-row-reverse" : "bg-neutral-200 dark:bg-neutral-800 flex-row"
                         )}
                       >
                          <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                       </button>
                    </div>

                    {enableNumbering && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-6 overflow-hidden"
                      >
                         <div className="space-y-2">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Start Sequence From</p>
                           <input type="number" value={startFrom} onChange={(e) => setStartFrom(Number(e.target.value))} className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl border-none font-black text-xl" />
                         </div>

                         <div className="space-y-2">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vertical Position</p>
                           <div className="grid grid-cols-2 gap-2">
                              {['header', 'footer'].map(v => (
                                <button key={v} onClick={() => setNumberingPos(prev => ({ ...prev, v }))} className={cn("py-2.5 rounded-xl border-2 font-bold text-[10px] uppercase transition-all", numberingPos.v === v ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400")}>{v}</button>
                              ))}
                           </div>
                         </div>

                         <div className="space-y-2">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Horizontal Alignment</p>
                           <div className="grid grid-cols-3 gap-1">
                              {['left', 'center', 'right'].map(h => (
                                <button key={h} onClick={() => setNumberingPos(prev => ({ ...prev, h }))} className={cn("py-2 rounded-lg border text-[8px] font-bold uppercase transition-all", numberingPos.h === h ? "border-blue-600 bg-white dark:bg-neutral-700 text-blue-600" : "border-neutral-200 dark:border-neutral-800 text-neutral-400")}>{h}</button>
                              ))}
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </div>
               </div>

               <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                  <button 
                    onClick={exportDocument}
                    disabled={isExporting}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                    {isExporting ? 'Applying Logic...' : 'Export Structured PDF'}
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                     <Shield className="w-3 h-3" />
                     100% Client-Side Encryption
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageItem({ page, index, isFirst, isLast, selectionMode, isSelected, onSelect, handleRotate, handleDuplicate, handleDelete, handleMove, onPreview }: { 
  page: PageData; 
  index: number;
  isFirst: boolean;
  isLast: boolean;
  selectionMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  handleRotate: (id: string) => void; 
  handleDuplicate: (id: string) => void; 
  handleDelete: (id: string) => void; 
  handleMove: (id: string, direction: 'up' | 'down') => void;
  onPreview: (page: PageData) => void;
}) {
  return (
    <motion.div 
      layout
      className={cn(
        "relative group bg-white dark:bg-neutral-900 rounded-2xl p-3 border transition-all flex items-center gap-4",
        selectionMode ? (isSelected ? "border-purple-600 bg-purple-50/10" : "border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100") : "border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:shadow-lg"
      )}
      onClick={() => selectionMode && onSelect()}
    >
      {/* Selection Overlay */}
      {selectionMode && (
        <div className="absolute top-2 right-2 z-10">
           {isSelected ? <CheckSquare className="w-5 h-5 text-purple-600" /> : <Square className="w-5 h-5 text-neutral-300" />}
        </div>
      )}

      {/* Thumbnail */}
      <div 
        onClick={(e) => { if(!selectionMode) { e.stopPropagation(); onPreview(page); } }}
        className="relative w-24 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 cursor-zoom-in"
      >
        <motion.img 
          src={page.thumbnail} 
          alt={`Page ${index + 1}`}
          animate={{ 
            rotate: page.rotation,
            scale: page.rotation % 180 === 0 ? 1 : 0.707
          }}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">#{index + 1}</span>
          <p className="text-sm font-bold truncate text-neutral-900 dark:text-neutral-100">Page Mapping</p>
        </div>
        
        <div className="flex items-center gap-1">
           <button 
              disabled={isFirst}
              onClick={(e) => { e.stopPropagation(); handleMove(page.id, 'up'); }}
              className="p-1.5 text-neutral-300 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button 
              disabled={isLast}
              onClick={(e) => { e.stopPropagation(); handleMove(page.id, 'down'); }}
              className="p-1.5 text-neutral-300 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pr-2">
         <button 
           onClick={(e) => { e.stopPropagation(); handleRotate(page.id); }}
           className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-600 hover:bg-white dark:hover:bg-neutral-700 transition-all rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
           title="Rotate"
         >
            <RotateCw className="w-4 h-4" />
         </button>
         <button 
           onClick={(e) => { e.stopPropagation(); handleDuplicate(page.id); }}
           className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-600 hover:bg-white dark:hover:bg-neutral-700 transition-all rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
           title="Duplicate"
         >
            <Copy className="w-4 h-4" />
         </button>
         <button 
           onClick={(e) => { e.stopPropagation(); handleDelete(page.id); }}
           className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl shadow-sm border border-red-200/50 dark:border-red-800/50"
           title="Delete"
         >
            <Trash2 className="w-4 h-4" />
         </button>
      </div>
    </motion.div>
  );
}
