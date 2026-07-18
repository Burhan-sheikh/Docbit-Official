import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Gauge, ShieldCheck, Settings2, Image as ImageIcon, Zap, Check } from 'lucide-react';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { useConversionTracker } from '../../hooks/useConversionTracker';
import { TOOL_REGISTRY } from '../../tools/registry';
import type { ToolDefinition } from '../../tools/registry.types';
import { useToolEngine } from '../../engine/useToolEngine';
import { UploadZone } from '../../components/engine/UploadZone';
import { FileQueue } from '../../components/engine/FileQueue';
import { ProcessingStatus, ProgressBar } from '../../components/engine/Progress';
import { ResultPanel } from '../../components/engine/ResultPanel';
import { ToolShell } from '../../components/engine/ToolShell';
import { cn, formatBytes } from '../../lib/utils';

const tool: ToolDefinition = TOOL_REGISTRY.find((t) => t.id === 'compress-image')!;

type Quality = 'low' | 'medium' | 'high' | 'best';

const QUALITY_MAP: Record<Quality, number> = {
  low: 0.5,
  medium: 0.7,
  high: 0.85,
  best: 0.95,
};

const compressProcessor = async ({ files, options, onProgress, signal }: any) => {
  const { quality, maxWidth, outputFormat } = options as {
    quality: Quality;
    maxWidth: number;
    outputFormat: 'original' | 'jpeg' | 'webp' | 'png';
  };
  const q = QUALITY_MAP[quality];
  const results = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    onProgress({ stage: `Compressing image ${i + 1} of ${files.length}`, current: i, total: files.length, percent: Math.round((i / files.length) * 100) });

    const file = files[i];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

    let { naturalWidth: w, naturalHeight: h } = img;
    if (maxWidth > 0 && w > maxWidth) {
      h = Math.round((h * maxWidth) / w);
      w = maxWidth;
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context failed');
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(img.src);

    const sourceExt = file.name.split('.').pop()?.toLowerCase() || '';
    const format =
      outputFormat === 'original'
        ? sourceExt === 'png'
          ? 'image/png'
          : sourceExt === 'webp'
            ? 'image/webp'
            : 'image/jpeg'
        : outputFormat === 'png'
          ? 'image/png'
          : outputFormat === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, q));
    if (!blob) throw new Error('Failed to compress image.');

    const outExt = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    results.push({
      blob,
      filename: `${baseName}_compressed.${outExt}`,
      mimeType: format,
      size: blob.size,
      url: URL.createObjectURL(blob),
    });
  }

  onProgress({ stage: 'Complete', current: files.length, total: files.length, percent: 100 });
  return results;
};

export default function CompressImageTool() {
  const [quality, setQuality] = useState<Quality>('medium');
  const [maxWidth, setMaxWidth] = useState(0);
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'webp' | 'png'>('original');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const track = useConversionTracker();

  const engine = useToolEngine({
    mode: 'local',
    processor: compressProcessor,
    validation: {
      acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFiles: 20,
      minFiles: 1,
      maxFileSizeMb: 50,
      allowDuplicates: false,
      validateSignature: true,
    },
    toolId: tool.id,
    toolName: tool.name,
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

  const totalOriginal = engine.queue.reduce((a, b) => a + b.size, 0);
  const totalCompressed = engine.results.reduce((a, b) => a + b.size, 0);
  const savings = totalOriginal > 0 && totalCompressed > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

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
            onReset={() => { engine.reset(); setIsDownloaded(false); }}
            onBack={() => engine.reset()}
            elapsedMs={engine.elapsedMs}
          />
        )}
      </AnimatePresence>

      {engine.queue.length === 0 ? (
        <UploadZone
          onFilesSelected={engine.addFiles}
          validation={{
            acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
            acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            maxFiles: 20,
            minFiles: 1,
            maxFileSizeMb: 50,
            allowDuplicates: false,
            validateSignature: true,
          }}
          label="Select Images to Compress"
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Compress Images</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Reduce file size without losing quality.</p>
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
                  <h3 className="text-xs font-black tracking-widest uppercase">Compression Options</h3>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Quality Level</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'low', label: 'Low', sub: 'Smallest' },
                      { id: 'medium', label: 'Medium', sub: 'Balanced' },
                      { id: 'high', label: 'High', sub: 'Good quality' },
                      { id: 'best', label: 'Best', sub: 'Near-lossless' },
                    ].map((q) => (
                      <button key={q.id} onClick={() => setQuality(q.id as Quality)} className={cn('flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 transition-all', quality === q.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600' : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200')}>
                        <span className="text-[10px] font-black uppercase tracking-widest">{q.label}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{q.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Output Format</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'original', label: 'Original' },
                        { id: 'jpeg', label: 'JPG' },
                        { id: 'webp', label: 'WebP' },
                        { id: 'png', label: 'PNG' },
                      ].map((f) => (
                        <button key={f.id} onClick={() => setOutputFormat(f.id as any)} className={cn('py-2.5 rounded-xl border-2 font-black text-[10px] uppercase transition-all', outputFormat === f.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200')}>{f.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Max Width (px, 0 = keep)</p>
                    <input type="number" min={0} value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-sm font-black border-2 border-transparent focus:border-blue-500 outline-none" />
                  </div>
                </div>

                {engine.results.length > 0 && savings > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-900/40">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="text-xs font-black uppercase text-green-600 tracking-widest">Saved {savings}% — {formatBytes(totalOriginal)} → {formatBytes(totalCompressed)}</p>
                  </div>
                )}
              </div>

              <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-neutral-100 dark:border-neutral-800 pt-8 xl:pt-0 xl:pl-8 flex flex-col justify-center">
                <div className="space-y-6">
                  {engine.isProcessing && <ProgressBar progress={engine.progress} />}
                  <button onClick={() => engine.process({ quality, maxWidth, outputFormat })} disabled={engine.isProcessing} className="group w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    {engine.isProcessing ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <Gauge className="w-6 h-6 transition-transform group-hover:scale-110" />}
                    <span className="text-lg tracking-tight uppercase">{engine.isProcessing ? 'COMPRESSING...' : 'COMPRESS'}</span>
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
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Image Queue ({engine.queue.length})</h3>
            </div>
            <FileQueue queue={engine.queue} onRemove={engine.removeFile} showReorder onReorder={engine.reorderFile} />
          </div>

          <ProcessingStatus isProcessing={engine.isProcessing} progress={engine.progress} elapsedMs={engine.elapsedMs} error={engine.error} onCancel={engine.cancel} />
        </div>
      )}
    </ToolShell>
  );
}
