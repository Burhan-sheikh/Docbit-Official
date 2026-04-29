import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument, PageSizes, rgb, StandardFonts } from 'pdf-lib';
import { 
  FileImage, 
  Download, 
  ArrowUp,
  ArrowDown,
  Trash2,
  Maximize2,
  Minimize2,
  StretchHorizontal,
  RotateCw,
  Plus,
  Loader2,
  Settings2,
  Hash,
  Layout,
  Palette,
  Shield,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { readFileAsArrayBuffer, cn, formatBytes } from '../../lib/utils';
import { DownloadResult } from '../DownloadResult';
import { ImageViewer } from '../ImageViewer';

type FitMode = 'fit' | 'fill' | 'stretch';
type PageSize = 'A4' | 'A3' | 'Letter' | 'Custom';
type Orientation = 'portrait' | 'landscape';

interface ImgData {
  id: string;
  file: File;
  preview: string;
  rotation: number;
}

export default function ImgToPdfTool() {
  const [images, setImages] = useState<ImgData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Layout Settings
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [customWidth, setCustomWidth] = useState(595);
  const [customHeight, setCustomHeight] = useState(842);
  const [margin, setMargin] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [bgColor, setBgColor] = useState('#ffffff');
  
  // Advanced Options
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [pageNumberPos, setPageNumberPos] = useState({ vertical: 'bottom', horizontal: 'center' });
  const [quality, setQuality] = useState<'high' | 'medium' | 'small'>('medium');
  const [spacing, setSpacing] = useState(0);

  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [previewItem, setPreviewItem] = useState<ImgData | null>(null);

  const handleFiles = async (files: File[]) => {
    setIsProcessing(true); // Re-use isProcessing or add a new state
    
    // Small delay to allow the loading animation to show
    await new Promise(resolve => setTimeout(resolve, 800));

    const newImages = files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      preview: URL.createObjectURL(f),
      rotation: 0
    }));
    setImages(prev => [...prev, ...newImages]);
    setIsProcessing(false);
  };

  const handleRotate = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
    ));
  };

  const removeImg = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex(img => img.id === id);
    if (index === -1) return;
    
    const newImages = [...images];
    if (direction === 'up' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === 'down' && index < images.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setImages(newImages);
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const qualityValue = quality === 'high' ? 0.95 : quality === 'medium' ? 0.8 : 0.6;

      for (let i = 0; i < images.length; i++) {
        const imgData = images[i];
        const img = new Image();
        img.src = imgData.preview;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        const isSwapped = imgData.rotation === 90 || imgData.rotation === 270;
        canvas.width = isSwapped ? img.naturalHeight : img.naturalWidth;
        canvas.height = isSwapped ? img.naturalWidth : img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context failed');
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((imgData.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        const imgBytes = await new Promise<ArrayBuffer>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as ArrayBuffer);
              reader.readAsArrayBuffer(blob);
            }
          }, 'image/jpeg', qualityValue);
        });

        const embeddedImg = await pdfDoc.embedJpg(imgBytes);
        const imgDims = embeddedImg.scale(1);

        // Determine Page Size
        let pWidth, pHeight;
        if (pageSize === 'Custom') {
          pWidth = customWidth;
          pHeight = customHeight;
        } else {
          const standard = PageSizes[pageSize];
          pWidth = orientation === 'portrait' ? standard[0] : standard[1];
          pHeight = orientation === 'portrait' ? standard[1] : standard[0];
        }

        const page = pdfDoc.addPage([pWidth, pHeight]);
        
        // Background Color
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pWidth,
          height: pHeight,
          color: hexToRgb(bgColor),
        });

        // Margins
        const safeWidth = pWidth - margin.left - margin.right;
        const safeHeight = pHeight - margin.top - margin.bottom;

        let drawWidth = imgDims.width;
        let drawHeight = imgDims.height;
        let x = margin.left;
        let y = margin.bottom;

        const ratio = imgDims.width / imgDims.height;
        const safeRatio = safeWidth / safeHeight;

        if (fitMode === 'fit') {
          if (ratio > safeRatio) {
            drawWidth = safeWidth;
            drawHeight = safeWidth / ratio;
          } else {
            drawHeight = safeHeight;
            drawWidth = safeHeight * ratio;
          }
        } else if (fitMode === 'fill') {
          if (ratio > safeRatio) {
            drawHeight = safeHeight;
            drawWidth = safeHeight * ratio;
          } else {
            drawWidth = safeWidth;
            drawHeight = safeWidth / ratio;
          }
        } else if (fitMode === 'stretch') {
          drawWidth = safeWidth;
          drawHeight = safeHeight;
        }

        // Center within safe area
        x += (safeWidth - drawWidth) / 2;
        y += (safeHeight - drawHeight) / 2;

        page.drawImage(embeddedImg, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        // Page Numbers
        if (showPageNumbers) {
          const text = `Page ${i + 1}`;
          const textSize = 10;
          const textWidth = font.widthOfTextAtSize(text, textSize);
          let tx = 0;
          let ty = 0;

          if (pageNumberPos.horizontal === 'left') tx = 20;
          else if (pageNumberPos.horizontal === 'center') tx = (pWidth - textWidth) / 2;
          else tx = pWidth - textWidth - 20;

          if (pageNumberPos.vertical === 'top') ty = pHeight - 30;
          else ty = 20;

          page.drawText(text, {
            x: tx,
            y: ty,
            size: textSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (e) {
      console.error(e);
      alert('Error during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `docbit_images_${new Date().getTime()}.pdf`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
       {result ? (
        <DownloadResult 
          filename="images_to_pdf.pdf" 
          size={result.size} 
          onDownload={handleDownload} 
          onReset={() => { setImages([]); setResult(null); }} 
        />
       ) : images.length === 0 ? (
        <Dropzone 
          onFilesSelected={handleFiles} 
          maxFiles={50} 
          isProcessing={isProcessing}
          accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] }}
          label="Select Images (JPG, PNG, WebP)" 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <FileImage className="w-7 h-7 text-blue-600" />
                    Image Flow
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Icon-based ordering • Real-time preview</p>
                </div>
                <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95 text-sm">
                  <Plus className="w-4 h-4" />
                  Add Images
                  <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {images.map((img, idx) => (
                  <ImgItem 
                    key={img.id} 
                    img={img} 
                    index={idx}
                    isFirst={idx === 0}
                    isLast={idx === images.length - 1}
                    handleRotate={handleRotate}
                    removeImg={removeImg} 
                    handleMove={handleMove}
                    onPreview={setPreviewItem}
                  />
                ))}
              </div>
           </div>

           <ImageViewer 
             src={previewItem?.preview || ''} 
             rotation={previewItem?.rotation || 0}
             isOpen={!!previewItem} 
             onClose={() => setPreviewItem(null)} 
           />

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
                 <div className="space-y-8">
                    {/* Layout Settings */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Layout className="w-4 h-4" />
                        <h3 className="text-[10px] font-black tracking-widest uppercase">Layout Configuration</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Page Format</p>
                           <div className="grid grid-cols-2 gap-2">
                             {['A4', 'A3', 'Letter', 'Custom'].map(s => (
                               <button
                                 key={s}
                                 onClick={() => setPageSize(s as any)}
                                 className={cn(
                                   "py-2.5 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest transition-all",
                                   pageSize === s ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400"
                                 )}
                               >{s}</button>
                             ))}
                           </div>
                        </div>

                        {pageSize === 'Custom' && (
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <p className="text-[8px] font-bold text-neutral-400 uppercase">Width (pt)</p>
                                <input type="number" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm font-bold border-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-[8px] font-bold text-neutral-400 uppercase">Height (pt)</p>
                                <input type="number" value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm font-bold border-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                          </div>
                        )}

                        {pageSize !== 'Custom' && (
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Orientation</p>
                             <div className="grid grid-cols-2 gap-2">
                               {['portrait', 'landscape'].map(o => (
                                 <button
                                   key={o}
                                   onClick={() => setOrientation(o as Orientation)}
                                   className={cn(
                                     "py-2.5 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest transition-all",
                                     orientation === o ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400"
                                   )}
                                 >{o}</button>
                               ))}
                             </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Fit Algorithm</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'fit', icon: <Minimize2 className="w-3 h-3" /> },
                              { id: 'fill', icon: <Maximize2 className="w-3 h-3" /> },
                              { id: 'stretch', icon: <StretchHorizontal className="w-3 h-3" /> }
                            ].map(m => (
                              <button
                                key={m.id}
                                onClick={() => setFitMode(m.id as FitMode)}
                                className={cn(
                                  "flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 font-bold text-[8px] uppercase tracking-widest transition-all",
                                  fitMode === m.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400"
                                )}
                              >
                                {m.icon}
                                {m.id}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                           <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Margins (pt)</p>
                           <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                 <p className="text-[8px] font-bold text-neutral-400 uppercase">Top/Bottom</p>
                                 <input type="number" value={margin.top} onChange={(e) => setMargin(m => ({ ...m, top: Number(e.target.value), bottom: Number(e.target.value) }))} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm font-bold border-none" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[8px] font-bold text-neutral-400 uppercase">Left/Right</p>
                                 <input type="number" value={margin.left} onChange={(e) => setMargin(m => ({ ...m, left: Number(e.target.value), right: Number(e.target.value) }))} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm font-bold border-none" />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Background</p>
                           <input 
                             type="color" 
                             value={bgColor} 
                             onChange={(e) => setBgColor(e.target.value)} 
                             className="w-full h-10 rounded-xl cursor-pointer border-none bg-neutral-100 dark:bg-neutral-800 p-1"
                           />
                        </div>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-2 text-purple-600">
                        <Settings2 className="w-4 h-4" />
                        <h3 className="text-[10px] font-black tracking-widest uppercase">Advanced Features</h3>
                      </div>

                      <div className="space-y-5">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <Hash className="w-3 h-3 text-neutral-400" />
                               <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Page Numbers</span>
                            </div>
                            <button 
                              onClick={() => setShowPageNumbers(!showPageNumbers)}
                              className={cn(
                                "w-10 h-5 rounded-full p-1 transition-all",
                                showPageNumbers ? "bg-blue-600 flex-row-reverse" : "bg-neutral-200 dark:bg-neutral-800 flex-row"
                              )}
                            >
                               <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                            </button>
                         </div>

                         {showPageNumbers && (
                           <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                              <div className="space-y-2">
                                 <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Position (X-Y)</p>
                                 <div className="grid grid-cols-3 gap-1">
                                    {['left', 'center', 'right'].map(h => (
                                      <button 
                                        key={h}
                                        onClick={() => setPageNumberPos(prev => ({ ...prev, horizontal: h }))}
                                        className={cn(
                                          "py-1.5 rounded-lg border text-[8px] font-bold uppercase transition-all",
                                          pageNumberPos.horizontal === h ? "border-blue-600 bg-white dark:bg-neutral-700 text-blue-600" : "border-neutral-200 dark:border-neutral-800 text-neutral-400"
                                        )}
                                      >{h}</button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                         )}

                         <div className="space-y-2">
                            <div className="flex items-center gap-2">
                               <ImageIcon className="w-3 h-3 text-neutral-400" />
                               <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Export Quality</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                               {['small', 'medium', 'high'].map(q => (
                                 <button
                                   key={q}
                                   onClick={() => setQuality(q as any)}
                                   className={cn(
                                     "py-2 rounded-xl border-2 font-bold text-[8px] uppercase tracking-widest transition-all",
                                     quality === q ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-neutral-100 dark:border-neutral-800 text-neutral-400"
                                   )}
                                 >{q}</button>
                               ))}
                            </div>
                         </div>
                      </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <button 
                      onClick={convertToPdf}
                      disabled={isProcessing}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                      {isProcessing ? 'Processing Engine...' : 'Generate PDF'}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                       <Shield className="w-3 h-3" />
                       Zero-Trace Conversion
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function ImgItem({ img, index, isFirst, isLast, handleRotate, removeImg, handleMove, onPreview }: { 
  img: ImgData; 
  index: number;
  isFirst: boolean;
  isLast: boolean;
  handleRotate: (id: string) => void;
  removeImg: (id: string) => void;
  handleMove: (id: string, direction: 'up' | 'down') => void;
  onPreview: (item: ImgData) => void;
  key?: React.Key;
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 flex items-center gap-4 transition-all hover:border-blue-500 hover:shadow-lg"
    >
      <div 
        onClick={() => onPreview(img)}
        className="relative w-24 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 cursor-zoom-in"
      >
        <motion.img 
          src={img.preview} 
          animate={{ 
            rotate: img.rotation,
            scale: img.rotation % 180 === 0 ? 1 : 0.707
          }}
          alt="Preview" 
          className="w-full h-full object-contain pointer-events-none" 
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">#{index + 1}</span>
          <p className="text-sm font-bold truncate text-neutral-900 dark:text-neutral-100">{img.file.name}</p>
        </div>
        
        <div className="flex items-center gap-1">
           <button 
              disabled={isFirst}
              onClick={() => handleMove(img.id, 'up')}
              className="p-1.5 text-neutral-300 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button 
              disabled={isLast}
              onClick={() => handleMove(img.id, 'down')}
              className="p-1.5 text-neutral-300 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-2">{formatBytes(img.file.size)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pr-2">
        <button 
          onClick={() => handleRotate(img.id)}
          className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-600 hover:bg-white dark:hover:bg-neutral-700 transition-all rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
          title="Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button 
          onClick={() => removeImg(img.id)}
          className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl shadow-sm border border-red-200/50 dark:border-red-800/50"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
