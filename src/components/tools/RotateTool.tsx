import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RotateCw, ShieldCheck, Settings2, FileText, LayoutGrid, Check, RotateCcw, RotateCw as RotateRight } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { useConversionTracker } from '../../hooks/useConversionTracker';
import { TOOL_REGISTRY } from '../../tools/registry';
import type { ToolDefinition } from '../../tools/registry.types';
import { useToolEngine } from '../../engine/useToolEngine';
import { UploadZone } from '../../components/engine/UploadZone';
import { ProcessingStatus, ProgressBar } from '../../components/engine/Progress';
import { ResultPanel } from '../../components/engine/ResultPanel';
import { ToolShell } from '../../components/engine/ToolShell';
import { cn, readFileAsArrayBuffer } from '../../lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const tool: ToolDefinition = TOOL_REGISTRY.find((t) => t.id === 'rotate-pdf')!;

type RotationMode = 'all' | 'selected';

const rotateProcessor = async ({ files, options, onProgress, signal }: any) => {
  const { rotation, mode, selectedPages } = options as {
    rotation: number;
    mode: RotationMode;
    selectedPages: number[];
  };
  const file = files[0];
  const buffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();

  const targetIndices =
    mode === 'all'
      ? pages.map((_, i) => i)
      : selectedPages.slice().sort((a, b) => a - b);

  onProgress({ stage: 'Rotating pages', current: 0, total: targetIndices.length, percent: 20 });

  for (let i = 0; i < targetIndices.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const idx = targetIndices[i];
    const page = pages[idx];
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
    onProgress({
      stage: `Rotating page ${idx + 1}`,
      current: i + 1,
      total: targetIndices.length,
      percent: 20 + Math.round(((i + 1) / targetIndices.length) * 70),
    });
  }

  onProgress({ stage: 'Finalizing PDF', current: targetIndices.length, total: targetIndices.length, percent: 100 });
  const bytes = await pdf.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return {
    blob,
    filename: `rotated_${file.name}`,
    mimeType: 'application/pdf',
    size: blob.size,
    url: URL.createObjectURL(blob),
  };
};

export default function RotateTool() {
  const [rotation, setRotation] = useState(90);
  const [mode, setMode] = useState<RotationMode>('all');
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const track = useConversionTracker();

  const engine = useToolEngine({
    mode: 'local',
    processor: rotateProcessor,
    validation: {
      acceptedExtensions: ['pdf'],
      acceptedMimeTypes: ['application/pdf'],
      maxFiles: 1,
      minFiles: 1,
      maxFileSizeMb: 100,
      allowDuplicates: false,
      validateSignature: true,
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
      setTotalPages(0);
      setThumbnails([]);
      setSelectedPages(new Set());
      return;
    }
    (async () => {
      setIsLoadingFile(true);
      try {
        const buffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
        setTotalPages(pdf.numPages);
        const thumbs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: ctx, canvas, viewport }).promise;
            thumbs.push(canvas.toDataURL('image/jpeg', 0.8));
            setThumbnails([...thumbs]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingFile(false);
      }
    })();
  }, [file]);

  const togglePage = (i: number) => {
    const next = new Set(selectedPages);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelectedPages(next);
  };

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
            acceptedExtensions: ['pdf'],
            acceptedMimeTypes: ['application/pdf'],
            maxFiles: 1,
            minFiles: 1,
            maxFileSizeMb: 100,
            allowDuplicates: false,
            validateSignature: true,
          }}
          label="Select PDF to Rotate"
          isProcessing={isLoadingFile}
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Rotate PDF Pages</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Turn pages 90, 180, or 270 degrees — all in your browser.</p>
            </div>
            <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl cursor-pointer active:scale-95 text-sm uppercase italic tracking-tighter shrink-0">
              <Plus className="w-5 h-5" /> REPLACE
              <input type="file" className="hidden" accept=".pdf" onChange={(e) => { engine.clearQueue(); e.target.files && engine.addFiles(Array.from(e.target.files)); }} />
            </label>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-8 space-y-8">
                <div className="flex items-center gap-3 text-blue-600">
                  <Settings2 className="w-5 h-5" />
                  <h3 className="text-xs font-black tracking-widest uppercase">Rotation Options</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button onClick={() => setMode('all')} className={cn('flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left', mode === 'all' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300')}>
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', mode === 'all' ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800')}><RotateCw className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">All Pages</p><p className={cn('text-[8px] font-bold uppercase tracking-widest', mode === 'all' ? 'text-blue-100' : 'text-neutral-400')}>Rotate entire document</p></div>
                  </button>
                  <button onClick={() => setMode('selected')} className={cn('flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left', mode === 'selected' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300')}>
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', mode === 'selected' ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800')}><LayoutGrid className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">Selected Pages</p><p className={cn('text-[8px] font-bold uppercase tracking-widest', mode === 'selected' ? 'text-blue-100' : 'text-neutral-400')}>Choose specific pages</p></div>
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Rotation Angle</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { angle: 90, label: '90° Right', icon: <RotateRight className="w-5 h-5" /> },
                      { angle: 180, label: '180°', icon: <RotateCcw className="w-5 h-5" /> },
                      { angle: 270, label: '90° Left', icon: <RotateCcw className="w-5 h-5" /> },
                    ].map((r) => (
                      <button key={r.angle} onClick={() => setRotation(r.angle)} className={cn('flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all', rotation === r.angle ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600' : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200')}>
                        {r.icon}
                        <span className="text-[8px] font-black uppercase tracking-widest">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-neutral-100 dark:border-neutral-800 pt-8 xl:pt-0 xl:pl-8 flex flex-col justify-center">
                <div className="space-y-6">
                  {engine.isProcessing && <ProgressBar progress={engine.progress} />}
                  <button onClick={() => engine.process({ rotation, mode, selectedPages: Array.from(selectedPages) })} disabled={engine.isProcessing || (mode === 'selected' && selectedPages.size === 0)} className="group w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    <RotateCw className="w-6 h-6 transition-transform group-hover:rotate-90" />
                    <span className="text-lg tracking-tight uppercase">{engine.isProcessing ? 'ROTATING...' : 'ROTATE PDF'}</span>
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> 100% Client-Side
                  </div>
                </div>
              </div>
            </div>
          </div>

          {thumbnails.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{mode === 'selected' ? 'Select Pages to Rotate' : 'Document Pages'}</h3>
                </div>
                {mode === 'selected' && <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">{selectedPages.size} / {totalPages}</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {thumbnails.map((p, i) => (
                  <motion.div key={i} layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => mode === 'selected' && togglePage(i)} className={cn('group relative aspect-[3/4] bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-xl', mode !== 'selected' ? 'border-neutral-200 dark:border-neutral-700' : selectedPages.has(i) ? 'border-blue-600 ring-4 ring-blue-500/10' : 'border-neutral-100 dark:border-neutral-800 opacity-60 hover:opacity-100')}>
                    <img src={p} className="w-full h-full object-cover" alt={`Page ${i + 1}`} />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/95 dark:bg-black/95 rounded-lg text-[10px] font-black">P{i + 1}</div>
                    {mode === 'selected' && <div className={cn('absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center', selectedPages.has(i) ? 'bg-blue-600 text-white' : 'bg-black/20 border border-white/20')}><Check className="w-4 h-4" /></div>}
                  </motion.div>
                ))}
                {totalPages > thumbnails.length && (
                  <div className="aspect-[3/4] flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center">
                    <FileText className="w-8 h-8 text-neutral-300 mb-4" />
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">+{totalPages - thumbnails.length}<br />Remaining</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <ProcessingStatus isProcessing={engine.isProcessing} progress={engine.progress} elapsedMs={engine.elapsedMs} error={engine.error} onCancel={engine.cancel} />
        </div>
      )}
    </ToolShell>
  );
}
