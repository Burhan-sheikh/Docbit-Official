import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RefreshCw, ShieldCheck, Settings2, Image as ImageIcon, ArrowRight } from 'lucide-react';
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
import { cn } from '../../lib/utils';

const tool: ToolDefinition = TOOL_REGISTRY.find((t) => t.id === 'image-converter')!;

type TargetFormat = 'jpg' | 'png' | 'webp';

const FORMAT_MIME: Record<TargetFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const convertProcessor = async ({ files, options, onProgress, signal }: any) => {
  const { targetFormat, quality } = options as { targetFormat: TargetFormat; quality: number };
  const mime = FORMAT_MIME[targetFormat];
  const results = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    onProgress({ stage: `Converting image ${i + 1} of ${files.length}`, current: i, total: files.length, percent: Math.round((i / files.length) * 100) });

    const file = files[i];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context failed');

    if (targetFormat === 'jpg' || targetFormat === 'webp') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(img.src);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
    if (!blob) throw new Error('Failed to convert image.');

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    results.push({
      blob,
      filename: `${baseName}.${targetFormat}`,
      mimeType: mime,
      size: blob.size,
      url: URL.createObjectURL(blob),
    });
  }

  onProgress({ stage: 'Complete', current: files.length, total: files.length, percent: 100 });
  return results;
};

export default function ImageConverterTool() {
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('png');
  const [quality, setQuality] = useState(0.9);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const track = useConversionTracker();

  const engine = useToolEngine({
    mode: 'local',
    processor: convertProcessor,
    validation: {
      acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'],
      acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'],
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
            acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'],
            acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'],
            maxFiles: 20,
            minFiles: 1,
            maxFileSizeMb: 50,
            allowDuplicates: false,
            validateSignature: true,
          }}
          label="Select Images to Convert"
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Image Converter</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Convert between JPG, PNG, and WebP formats.</p>
            </div>
            <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl cursor-pointer active:scale-95 text-sm uppercase italic tracking-tighter shrink-0">
              <Plus className="w-5 h-5" /> ADD MORE
              <input type="file" multiple className="hidden" accept="image/jpeg,image/png,image/webp,image/bmp,image/gif" onChange={(e) => e.target.files && engine.addFiles(Array.from(e.target.files))} />
            </label>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-8 space-y-8">
                <div className="flex items-center gap-3 text-blue-600">
                  <Settings2 className="w-5 h-5" />
                  <h3 className="text-xs font-black tracking-widest uppercase">Conversion Options</h3>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Target Format</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['jpg', 'png', 'webp'] as TargetFormat[]).map((f) => (
                      <button key={f} onClick={() => setTargetFormat(f)} className={cn('flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 transition-all', targetFormat === f ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600' : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200')}>
                        <span className="text-lg font-black uppercase">{f}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{FORMAT_MIME[f]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {(targetFormat === 'jpg' || targetFormat === 'webp') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Quality</p>
                      <span className="text-[10px] font-black text-blue-600">{Math.round(quality * 100)}%</span>
                    </div>
                    <input type="range" min={0.3} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                )}

                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] font-black uppercase text-neutral-400">Source:</span>
                  <span className="text-[10px] font-black text-neutral-900 dark:text-white uppercase">Multiple</span>
                  <ArrowRight className="w-3 h-3 text-neutral-300" />
                  <span className="text-[10px] font-black text-blue-600 uppercase">{targetFormat}</span>
                </div>
              </div>

              <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-neutral-100 dark:border-neutral-800 pt-8 xl:pt-0 xl:pl-8 flex flex-col justify-center">
                <div className="space-y-6">
                  {engine.isProcessing && <ProgressBar progress={engine.progress} />}
                  <button onClick={() => engine.process({ targetFormat, quality })} disabled={engine.isProcessing} className="group w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    {engine.isProcessing ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <RefreshCw className="w-6 h-6 transition-transform group-hover:rotate-180" />}
                    <span className="text-lg tracking-tight uppercase">{engine.isProcessing ? 'CONVERTING...' : 'CONVERT'}</span>
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
