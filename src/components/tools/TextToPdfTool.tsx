import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Type as TypeIcon, ShieldCheck, Settings2, FileText, ChevronLeft as AlignLeft, TextAlignCenter as AlignCenter, Highlighter as AlignRight } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { useConversionTracker } from '../../hooks/useConversionTracker';
import { TOOL_REGISTRY } from '../../tools/registry';
import type { ToolDefinition } from '../../tools/registry.types';
import { useToolEngine } from '../../engine/useToolEngine';
import { UploadZone } from '../../components/engine/UploadZone';
import { ProcessingStatus, ProgressBar } from '../../components/engine/Progress';
import { ResultPanel } from '../../components/engine/ResultPanel';
import { ToolShell } from '../../components/engine/ToolShell';
import { cn } from '../../lib/utils';

const tool: ToolDefinition = TOOL_REGISTRY.find((t) => t.id === 'text-to-pdf')!;

type Alignment = 'left' | 'center' | 'right';
type FontFamily = 'Helvetica' | 'Times' | 'Courier';

const FONT_MAP: Record<FontFamily, StandardFonts> = {
  Helvetica: StandardFonts.Helvetica,
  Times: StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier,
};

const textToPdfProcessor = async ({ files, options, onProgress, signal }: any) => {
  const { fontSize, margin, fontFamily, alignment, pageSize, lineHeight, lineSpacing } = options as {
    fontSize: number;
    margin: { top: number; bottom: number; left: number; right: number };
    fontFamily: FontFamily;
    alignment: Alignment;
    pageSize: 'A4' | 'Letter';
    lineHeight: number;
    lineSpacing: number;
  };

  const file = files[0];
  const text = await file.text();

  onProgress({ stage: 'Parsing text', current: 0, total: 1, percent: 20 });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(FONT_MAP[fontFamily]);

  const pageDims = pageSize === 'A4' ? { w: 595, h: 842 } : { w: 612, h: 792 };
  const contentWidth = pageDims.w - margin.left - margin.right;

  const paragraphs = text.split(/\r?\n/);
  const lines: { text: string; width: number }[] = [];

  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push({ text: '', width: 0 });
      continue;
    }
    const words = para.split(/\s+/);
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(test, fontSize);
      if (testWidth > contentWidth && current) {
        lines.push({ text: current, width: font.widthOfTextAtSize(current, fontSize) });
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push({ text: current, width: font.widthOfTextAtSize(current, fontSize) });
  }

  onProgress({ stage: 'Rendering pages', current: 0, total: lines.length, percent: 50 });

  const lineH = fontSize * lineHeight;
  let page = pdfDoc.addPage([pageDims.w, pageDims.h]);
  let y = pageDims.h - margin.top;
  const textColor = rgb(0.1, 0.1, 0.1);

  for (let i = 0; i < lines.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    if (y < margin.bottom) {
      page = pdfDoc.addPage([pageDims.w, pageDims.h]);
      y = pageDims.h - margin.top;
    }
    const line = lines[i];
    let x = margin.left;
    if (alignment === 'center') x = margin.left + (contentWidth - line.width) / 2;
    else if (alignment === 'right') x = margin.left + contentWidth - line.width;
    if (line.text) {
      page.drawText(line.text, { x, y: y - fontSize, size: fontSize, font, color: textColor });
    }
    y -= lineH + lineSpacing;
    if (i % 50 === 0) {
      onProgress({ stage: 'Rendering pages', current: i, total: lines.length, percent: 50 + Math.round((i / lines.length) * 40) });
    }
  }

  onProgress({ stage: 'Finalizing PDF', current: lines.length, total: lines.length, percent: 100 });
  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
    mimeType: 'application/pdf',
    size: blob.size,
    url: URL.createObjectURL(blob),
  };
};

export default function TextToPdfTool() {
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState<FontFamily>('Helvetica');
  const [alignment, setAlignment] = useState<Alignment>('left');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [lineSpacing, setLineSpacing] = useState(2);
  const [margin, setMargin] = useState({ top: 72, bottom: 72, left: 72, right: 72 });
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const track = useConversionTracker();

  const engine = useToolEngine({
    mode: 'local',
    processor: textToPdfProcessor,
    validation: {
      acceptedExtensions: ['txt', 'md'],
      acceptedMimeTypes: ['text/plain', 'text/markdown'],
      maxFiles: 1,
      minFiles: 1,
      maxFileSizeMb: 10,
      allowDuplicates: false,
      validateSignature: false,
    },
    toolId: tool.id,
    toolName: tool.name,
    onTrack: (info) =>
      track({ toolId: info.toolId, toolName: info.toolName, filename: info.filename, outputType: info.outputType, fileSize: info.fileSize, success: info.success, processingMethod: info.processingMethod }),
  });

  const file = engine.queue[0]?.file || null;
  const dirty = !!file && engine.results.length === 0;
  const blocker = useFileExitConfirm({ isDirty: dirty });

  useEffect(() => {
    if (!file) {
      setPreviewText('');
      return;
    }
    (async () => {
      try {
        const text = await file.text();
        setPreviewText(text.slice(0, 2000) + (text.length > 2000 ? '\n...' : ''));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [file]);

  const handleDownload = async () => {
    await engine.download();
    setIsDownloaded(true);
  };

  return (
    <ToolShell tool={tool} isDirty={dirty} blocker={blocker}>
      <AnimatePresence>
        {engine.results.length > 0 && (
          <ResultPanel
            open
            results={engine.results}
            isDownloaded={isDownloaded}
            onDownload={handleDownload}
            onDownloadOne={engine.download}
            onDownloadZip={engine.downloadZip}
            onReset={() => { engine.reset(); setIsDownloaded(false); }}
            onBack={() => engine.reset()}
            elapsedMs={engine.elapsedMs}
          />
        )}
      </AnimatePresence>

      {!file ? (
        <UploadZone
          onFilesSelected={engine.addFiles}
          validation={{
            acceptedExtensions: ['txt', 'md'],
            acceptedMimeTypes: ['text/plain', 'text/markdown'],
            maxFiles: 1,
            minFiles: 1,
            maxFileSizeMb: 10,
            allowDuplicates: false,
            validateSignature: false,
          }}
          label="Select Text File (.txt or .md)"
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Text to PDF</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Convert plain text into a formatted PDF document.</p>
            </div>
            <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl cursor-pointer active:scale-95 text-sm uppercase italic tracking-tighter shrink-0">
              <Plus className="w-5 h-5" /> REPLACE
              <input type="file" className="hidden" accept=".txt,.md,text/plain,text/markdown" onChange={(e) => { engine.clearQueue(); e.target.files && engine.addFiles(Array.from(e.target.files)); }} />
            </label>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-8 space-y-8">
                <div className="flex items-center gap-3 text-blue-600">
                  <Settings2 className="w-5 h-5" />
                  <h3 className="text-xs font-black tracking-widest uppercase">Formatting Options</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Font Family</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Helvetica', 'Times', 'Courier'] as FontFamily[]).map((f) => (
                        <button key={f} onClick={() => setFontFamily(f)} className={cn('py-2.5 rounded-xl border-2 font-black text-[10px] uppercase transition-all', fontFamily === f ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200')}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Page Size</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['A4', 'Letter'] as const).map((p) => (
                        <button key={p} onClick={() => setPageSize(p)} className={cn('py-2.5 rounded-xl border-2 font-black text-[10px] uppercase transition-all', pageSize === p ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200')}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Font Size</p>
                      <span className="text-[10px] font-black text-blue-600">{fontSize}pt</span>
                    </div>
                    <input type="range" min={8} max={24} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Line Height</p>
                      <span className="text-[10px] font-black text-blue-600">{lineHeight.toFixed(1)}</span>
                    </div>
                    <input type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Paragraph Gap</p>
                      <span className="text-[10px] font-black text-blue-600">{lineSpacing}px</span>
                    </div>
                    <input type="range" min={0} max={20} value={lineSpacing} onChange={(e) => setLineSpacing(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Alignment</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'left', icon: <AlignLeft className="w-4 h-4" />, label: 'Left' },
                      { id: 'center', icon: <AlignCenter className="w-4 h-4" />, label: 'Center' },
                      { id: 'right', icon: <AlignRight className="w-4 h-4" />, label: 'Right' },
                    ].map((a) => (
                      <button key={a.id} onClick={() => setAlignment(a.id as Alignment)} className={cn('flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all', alignment === a.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600' : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200')}>
                        {a.icon}
                        <span className="text-[8px] font-black uppercase tracking-widest">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {previewText && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Text Preview</p>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap font-mono">{previewText}</pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-neutral-100 dark:border-neutral-800 pt-8 xl:pt-0 xl:pl-8 flex flex-col justify-center">
                <div className="space-y-6">
                  {engine.isProcessing && <ProgressBar progress={engine.progress} />}
                  <button onClick={() => engine.process({ fontSize, margin, fontFamily, alignment, pageSize, lineHeight, lineSpacing })} disabled={engine.isProcessing} className="group w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    {engine.isProcessing ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <TypeIcon className="w-6 h-6 transition-transform group-hover:scale-110" />}
                    <span className="text-lg tracking-tight uppercase">{engine.isProcessing ? 'CONVERTING...' : 'EXPORT PDF'}</span>
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Browser-Only
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProcessingStatus isProcessing={engine.isProcessing} progress={engine.progress} elapsedMs={engine.elapsedMs} error={engine.error} onCancel={engine.cancel} />
        </div>
      )}
    </ToolShell>
  );
}
