import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RefreshCw, ShieldCheck, Settings2, Image as ImageIcon, Palette, Layers } from 'lucide-react';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { useConversionTracker } from '../../hooks/useConversionTracker';
import { getToolBySlug } from '../../tools/registry';
import type { ToolDefinition } from '../../tools/registry.types';
import { useToolEngine } from '../../engine/useToolEngine';
import { UploadZone } from '../engine/UploadZone';
import { FileQueue } from '../engine/FileQueue';
import { ProcessingStatus, ProgressBar } from '../engine/Progress';
import { ResultPanel } from '../engine/ResultPanel';
import { ImagePreviewModal, type PreviewImage } from '../engine/ImagePreviewModal';
import { ToolShell } from '../engine/ToolShell';
import { cn } from '../../lib/utils';

type GrayscaleMode = 'grayscale' | 'pure-bw';

const grayscaleProcessor = async ({ files, options, onProgress, signal }: any) => {
  const { mode, threshold } = options as { mode: GrayscaleMode; threshold: number };
  const results = [];

  const worker = new Worker(new URL('../../workers/grayscaleWorker.ts', import.meta.url), { type: 'module' });

  try {
    for (let i = 0; i < files.length; i++) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      onProgress({ stage: `Processing image ${i + 1} of ${files.length}`, current: i, total: files.length, percent: Math.round((i / files.length) * 100) });

      const file = files[i];
      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error(`Could not read "${file.name}".`)); });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas context failed');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const processed = await new Promise<ImageData>((resolve) => {
          worker.onmessage = (e) => resolve(e.data.imageData);
          worker.postMessage({ imageData, type: mode, threshold }, [imageData.data.buffer]);
        });
        ctx.putImageData(processed, 0, 0);

        const outMime = mode === 'pure-bw' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outMime, 0.92));
        if (!blob) throw new Error(`Failed to process "${file.name}".`);

        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const ext = mode === 'pure-bw' ? 'png' : 'jpg';
        results.push({
          blob,
          filename: `grayscale_${baseName}.${ext}`,
          mimeType: outMime,
          size: blob.size,
          url: URL.createObjectURL(blob),
        });
      } catch (err) {
        throw new Error(`Image ${i + 1} (${file.name}): ${(err as Error).message}`);
      }
    }
  } finally {
    worker.terminate();
  }

  onProgress({ stage: 'Complete', current: files.length, total: files.length, percent: 100 });
  return results;
};

export default function GrayscaleImageTool() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const tool = getToolBySlug(toolSlug || 'grayscale-image') as ToolDefinition;

  const [mode, setMode] = useState<GrayscaleMode>('grayscale');
  const [bwThreshold, setBwThreshold] = useState(128);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const track = useConversionTracker();

  const validation = {
    acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 50,
    minFiles: 1,
    maxFileSizeMb: 50,
    allowDuplicates: false,
    validateSignature: true,
  };

  const engine = useToolEngine({
    mode: 'local',
    processor: grayscaleProcessor,
    validation,
    toolId: tool?.id || 'grayscale-image',
    toolName: tool?.name || 'Grayscale Image',
    onTrack: (info) =>
      track({ toolId: info.toolId, toolName: info.toolName, filename: info.filename, outputType: info.outputType, fileSize: info.fileSize, success: info.success, processingMethod: info.processingMethod }),
  });

  const dirty = engine.queue.length > 0 && engine.results.length === 0;
  const blocker = useFileExitConfirm({ isDirty: dirty });

  const handleDownload = async () => {
    if (engine.results.length > 1) await engine.downloadAll();
    else await engine.download();
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
            onDownloadAll={engine.downloadAll}
            onDownloadOne={engine.download}
            onDownloadZip={engine.downloadZip}
            onReset={() => { engine.reset(); setIsDownloaded(false); }}
            onBack={() => engine.reset()}
            onDelete={engine.removeResult}
            elapsedMs={engine.elapsedMs}
          />
        )}
      </AnimatePresence>

      {engine.queue.length === 0 ? (
        <UploadZone onFilesSelected={engine.addFiles} validation={validation} label="Select Images to Grayscale" />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Grayscale Images</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Convert images to grayscale or black & white. Up to 50 images.</p>
            </div>
            <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl cursor-pointer active:scale-95 text-sm uppercase italic tracking-tighter shrink-0">
              <Plus className="w-5 h-5" /> ADD MORE
              <input type="file" multiple className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files && engine.addFiles(Array.from(e.target.files))} />
            </label>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-8 space-y-8">
                <div className="flex items-center gap-3 text-blue-600">
                  <Settings2 className="w-5 h-5" />
                  <h3 className="text-xs font-black tracking-widest uppercase">Grayscale Options</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'grayscale' as const, label: 'Grayscale', icon: Palette, sub: 'Multi-tone' },
                    { id: 'pure-bw' as const, label: 'Black & White', icon: Layers, sub: 'Pure mono' },
                  ].map((m) => (
                    <button key={m.id} onClick={() => setMode(m.id)} className={cn('group flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left', mode === m.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300')}>
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', mode === m.id ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800')}>
                        <m.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">{m.label}</p>
                        <p className={cn('text-[8px] font-bold uppercase', mode === m.id ? 'text-blue-100' : 'text-neutral-400')}>{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {mode === 'pure-bw' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Threshold</p>
                      <span className="text-[10px] font-black text-blue-600">{bwThreshold}</span>
                    </div>
                    <input type="range" min={0} max={255} step={1} value={bwThreshold} onChange={(e) => setBwThreshold(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                )}
              </div>

              <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-neutral-100 dark:border-neutral-800 pt-8 xl:pt-0 xl:pl-8 flex flex-col justify-center">
                <div className="space-y-6">
                  {engine.isProcessing && <ProgressBar progress={engine.progress} />}
                  <button onClick={() => engine.process({ mode, threshold: bwThreshold })} disabled={engine.isProcessing} className="group w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    {engine.isProcessing ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <RefreshCw className="w-6 h-6 transition-transform group-hover:rotate-180" />}
                    <span className="text-lg tracking-tight uppercase">{engine.isProcessing ? 'PROCESSING...' : 'APPLY'}</span>
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Browser-Only
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Image Queue ({engine.queue.length}/50)</h3>
            </div>
            <FileQueue queue={engine.queue} onRemove={engine.removeFile} onPreview={(item) => {
              const idx = engine.queue.findIndex((q) => q.id === item.id);
              if (idx >= 0) setPreviewIndex(idx);
            }} showReorder onReorder={engine.reorderFile} />
          </div>

          <ProcessingStatus isProcessing={engine.isProcessing} progress={engine.progress} elapsedMs={engine.elapsedMs} error={engine.error} onCancel={engine.cancel} />
        </div>
      )}

      <ImagePreviewModal
        open={previewIndex !== null}
        images={engine.queue.filter((q) => q.previewUrl).map((q) => ({ url: q.previewUrl!, filename: q.file.name, size: q.size })) as PreviewImage[]}
        index={previewIndex ?? 0}
        onClose={() => setPreviewIndex(null)}
        onNavigate={setPreviewIndex}
      />
    </ToolShell>
  );
}
