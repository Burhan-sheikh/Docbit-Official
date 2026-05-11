import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PDFDocument, PageSizes, rgb, StandardFonts } from 'pdf-lib';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { NavigationConfirmModal } from '../NavigationConfirmModal';
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
  Wand2,
  Settings2,
  Layout,
  Palette,
  Shield,
  ShieldCheck,
  Zap,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { readFileAsArrayBuffer, cn, formatBytes } from '../../lib/utils';
import { DownloadResult } from '../DownloadResult';
import { ImageViewer } from '../ImageViewer';
import { ColorPickerModal } from '../ColorPickerModal';
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

type FitMode = 'fit' | 'fill' | 'stretch';
type PageSize = 'A4' | 'A3' | 'Letter' | 'Custom';
type Orientation = 'portrait' | 'landscape';

interface ImgData {
  id: string;
  file: File;
  thumbnail: string;
  rotation: number;
  status: 'ready' | 'processing';
}

export default function ImgToPdfTool() {
  const tool = TOOLS.find(t => t.id === 'img-to-pdf')!;
  const [images, setImages] = useState<ImgData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingFiles, setIsAddingFiles] = useState(false);
  
  // Layout Settings
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [customWidth, setCustomWidth] = useState(595);
  const [customHeight, setCustomHeight] = useState(842);
  const [margin, setMargin] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  
  // Advanced Options
  const [quality, setQuality] = useState<'high' | 'medium' | 'small'>('medium');
  const [spacing, setSpacing] = useState(0);

  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [viewerItem, setViewerItem] = useState<ImgData | null>(null);

  const blocker = useFileExitConfirm({ isDirty: images.length > 0 && !result });

  const handleFiles = async (files: File[]) => {
    setIsAddingFiles(true);
    
    // Create pending items
    const pending: ImgData[] = files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      thumbnail: '',
      rotation: 0,
      status: 'processing'
    }));

    setImages(prev => [...prev, ...pending]);
    setResult(null);

    // Process each image (generate thumbnail)
    for (const item of pending) {
      // Small simulated delay for organic feel
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
      
      const thumbnail = URL.createObjectURL(item.file);
      setImages(prev => prev.map(img => 
        img.id === item.id ? { ...img, thumbnail, status: 'ready' } : img
      ));
    }
    
    setIsAddingFiles(false);
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
        img.src = imgData.thumbnail;
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
      <SEO 
        {...SEO_CONFIG.imgToPdf}
        schema={[
          getWebApplicationSchema(
            SEO_CONFIG.imgToPdf.title,
            SEO_CONFIG.imgToPdf.description,
            SEO_CONFIG.imgToPdf.canonical
          ),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: 'Image to PDF', item: SEO_CONFIG.imgToPdf.canonical }
          ]),
          getFAQSchema(tool.faqs || []),
          tool.steps && getHowToSchema(tool.name, tool.description, tool.steps)
        ].filter(Boolean)}
      />

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
          isProcessing={isAddingFiles}
          accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] }}
          label="Select Images (JPG, PNG, WebP)" 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black flex items-center gap-3">
                    Convert Images to PDF
                  </h1>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Turn multiple images into a single high-quality PDF in seconds.</p>
                </div>
                <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95 text-sm">
                  <Plus className="w-4 h-4" />
                  ADD
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
                    onViewer={setViewerItem}
                  />
                ))}
              </div>
           </div>

           <ImageViewer 
             src={viewerItem?.thumbnail || ''} 
             rotation={viewerItem?.rotation || 0}
             isOpen={!!viewerItem} 
             onClose={() => setViewerItem(null)} 
           />

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8">
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

                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Canvas Background</p>
                           <button 
                             onClick={() => setIsColorPickerOpen(true)}
                             className="w-full flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl group hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                           >
                             <div 
                               className="w-10 h-10 rounded-xl shadow-inner border border-black/5 flex items-center justify-center"
                               style={{ backgroundColor: bgColor }}
                             >
                               <div className={cn(
                                 "w-4 h-4 rounded-full",
                                 parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2 ? "bg-black/10" : "bg-white/20"
                               )} />
                             </div>
                             <div className="flex-1 text-left">
                                <p className="text-[10px] font-black uppercase text-neutral-900 dark:text-white">{bgColor}</p>
                                <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Tap to refine</p>
                             </div>
                           </button>

                           <ColorPickerModal 
                             isOpen={isColorPickerOpen}
                             onClose={() => setIsColorPickerOpen(false)}
                             color={bgColor}
                             onChange={setBgColor}
                             title="Background Color"
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
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
                      {isProcessing ? 'GENERATING...' : 'GENERATE'}
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
      <ToolContent 
        toolId={tool.id}
        toolName="Image to PDF"
        toolType="Convert"
        description="Transform your photos, scans, and images into professionally formatted PDF documents. Fast, secure, and entirely on your device."
        longContent={TOOL_SEO_CONTENT.imgToPdf}
      />

      <NavigationConfirmModal 
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}

function ImgItem({ img, index, isFirst, isLast, handleRotate, removeImg, handleMove, onViewer }: { 
  img: ImgData; 
  index: number;
  isFirst: boolean;
  isLast: boolean;
  handleRotate: (id: string) => void;
  removeImg: (id: string) => void;
  handleMove: (id: string, direction: 'up' | 'down') => void;
  onViewer: (item: ImgData) => void;
  key?: React.Key;
}) {
  const isProcessing = img.status === 'processing';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 flex items-center gap-4 transition-all hover:border-blue-500 hover:shadow-lg",
        isProcessing && "opacity-70 border-blue-200 dark:border-blue-900/50 bg-blue-50/10"
      )}
    >
      <div 
        onClick={() => !isProcessing && onViewer(img)}
        className={cn(
          "relative w-24 aspect-[1/1.414] bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center",
          !isProcessing && "cursor-zoom-in"
        )}
      >
        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5 backdrop-blur-[1px]">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : (
          <motion.img 
            src={img.thumbnail} 
            animate={{ 
              rotate: img.rotation,
              scale: img.rotation % 180 === 0 ? 1 : 0.707
            }}
            alt="Image Thumbnail" 
            className="w-full h-full object-contain pointer-events-none" 
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">#{index + 1}</span>
          <p className="text-sm font-bold truncate text-neutral-900 dark:text-neutral-100">{img.file.name}</p>
          {isProcessing && (
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 animate-pulse">Processing...</span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
           <button 
              disabled={isFirst || isProcessing}
              onClick={() => handleMove(img.id, 'up')}
              className="p-1.5 text-neutral-300 hover:text-blue-600 disabled:opacity-0 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button 
              disabled={isLast || isProcessing}
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
          disabled={isProcessing}
          onClick={() => handleRotate(img.id)}
          className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-600 hover:bg-white dark:hover:bg-neutral-700 transition-all rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 disabled:opacity-50"
          title="Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button 
          disabled={isProcessing}
          onClick={() => removeImg(img.id)}
          className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl shadow-sm border border-red-200/50 dark:border-red-800/50 disabled:opacity-50"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
