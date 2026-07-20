import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RefreshCw, ShieldCheck, Settings2, Image as ImageIcon, ArrowRight, CircleAlert } from 'lucide-react';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { useConversionTracker } from '../../hooks/useConversionTracker';
import { getToolBySlug } from '../../tools/registry';
import type { ToolDefinition } from '../../tools/registry.types';
import { useToolEngine } from '../../engine/useToolEngine';
import { UploadZone } from '../../components/engine/UploadZone';
import { FileQueue } from '../../components/engine/FileQueue';
import { ProcessingStatus, ProgressBar } from '../../components/engine/Progress';
import { ResultPanel } from '../../components/engine/ResultPanel';
import { ToolShell } from '../../components/engine/ToolShell';
import { cn } from '../../lib/utils';

type TargetFormat = 'jpg' | 'png' | 'webp';

const FORMAT_MIME: Record<TargetFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const FORMAT_LABEL: Record<TargetFormat, string> = {
  jpg: 'JPG',
  png: 'PNG',
  webp: 'WebP',
};

interface FormatPair {
  source: string[];
  target: TargetFormat;
}

function parseSlug(slug: string): FormatPair | null {
  const map: Record<string, FormatPair> = {
    'png-to-jpg': { source: ['png'], target: 'jpg' },
    'jpg-to-png': { source: ['jpg', 'jpeg'], target: 'png' },
    'webp-to-jpg': { source: ['webp'], target: 'jpg' },
    'jpg-to-webp': { source: ['jpg', 'jpeg'], target: 'webp' },
    'png-to-webp': { source: ['png'], target: 'webp' },
    'webp-to-png': { source: ['webp'], target: 'png' },
    'bmp-to-png': { source: ['bmp'], target: 'png' },
    'tiff-to-jpg': { source: ['tiff', 'tif'], target: 'jpg' },
    'gif-to-png': { source: ['gif'], target: 'png' },
    'heic-to-jpg': { source: ['heic'], target: 'jpg' },
  };
  return map[slug] || null;
}

const convertProcessor = async ({ files, options, onProgress, signal }: any) => {
  const { targetFormat, quality } = options as { targetFormat: TargetFormat; quality: number };
  const mime = FORMAT_MIME[targetFormat];
  const results = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    onProgress({ stage: `Converting image ${i + 1} of ${files.length}`, current: i, total: files.length, percent: Math.round((i / files.length) * 100) });

    const file = files[i];
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error(`Could not read "${file.name}". The file may be corrupt or unsupported.`)); });

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
      if (!blob) throw new Error(`Failed to convert "${file.name}".`);

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      results.push({
        blob,
        filename: `${baseName}.${targetFormat}`,
        mimeType: mime,
        size: blob.size,
        url: URL.createObjectURL(blob),
      });
    } catch (err) {
      throw new Error(`Image ${i + 1} (${file.name}): ${(err as Error).message}`);
    }
  }

  onProgress({ stage: 'Complete', current: files.length, total: files.length, percent: 100 });
  return results;
};

export default function ImageConverterTool() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const tool = getToolBySlug(toolSlug || '') as ToolDefinition;

  const formatPair = useMemo(() => parseSlug(toolSlug || ''), [toolSlug]);
  const targetFormat = formatPair?.target ?? 'png';
  const sourceExts = formatPair?.source ?? ['jpg', 'jpeg', 'png', 'webp'];

  const [quality, setQuality] = useState(0.9);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const track = useConversionTracker();

  const validation = {
    acceptedExtensions: sourceExts,
    acceptedMimeTypes: sourceExts.map((e) => `image/${e === 'jpg' ? 'jpeg' : e}`),
    maxFiles: 50,
    minFiles: 1,
    maxFileSizeMb: 50,
    allowDuplicates: false,
    validateSignature: true,
  };

  const engine = useToolEngine({
    mode: 'local',
    processor: convertProcessor,
    validation,
    toolId: tool?.id || 'image-converter',
    toolName: tool?.name || 'Image Converter',
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

  if (!formatPair) {
    return (
      <ToolShell tool={tool} isDirty={false} blocker={{ state: 'idle' }}>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <CircleAlert className="w-12 h-12 text-red-500" />
          <p className="text-lg font-black">Unknown conversion format.</p>
        </div>
      </ToolShell>
    );
  }

  const acceptStr = sourceExts.map((e) => `.${e}`).join(',');

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
            elapsedMs={engine.elapsedMs}
          />
        )}
      </AnimatePresence>

      {engine.queue.length === 0 ? (
        <UploadZone
          onFilesSelected={engine.addFiles}
          validation={validation}
          label={`Select ${sourceExts.map((s) => s.toUpperCase()).join(', ')} Images`}
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">{tool?.name || 'Image Converter'}</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                Convert {sourceExts.map((s) => s.toUpperCase()).join(', ')} to {FORMAT_LABEL[targetFormat]}. Up to 50 images.
              </p>
            </div>
            <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl cursor-pointer active:scale-95 text-sm uppercase italic tracking-tighter shrink-0">
              <Plus className="w-5 h-5" /> ADD MORE
              <input type="file" multiple className="hidden" accept={acceptStr} onChange={(e) => e.target.files && engine.addFiles(Array.from(e.target.files))} />
            </label>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-8 space-y-8">
                <div className="flex items-center gap-3 text-blue-600">
                  <Settings2 className="w-5 h-5" />
                  <h3 className="text-xs font-black tracking-widest uppercase">Conversion Options</h3>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] font-black uppercase text-neutral-400">Source:</span>
                  <span className="text-[10px] font-black text-neutral-900 dark:text-white uppercase">{sourceExts.map((s) => s.toUpperCase()).join(', ')}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-300" />
                  <span className="text-[10px] font-black text-blue-600 uppercase">{FORMAT_LABEL[targetFormat]}</span>
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
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Image Queue ({engine.queue.length}/50)</h3>
            </div>
            <FileQueue queue={engine.queue} onRemove={engine.removeFile} showReorder onReorder={engine.reorderFile} />
          </div>

          <ProcessingStatus isProcessing={engine.isProcessing} progress={engine.progress} elapsedMs={engine.elapsedMs} error={engine.error} onCancel={engine.cancel} />
        </div>
      )}
    </ToolShell>
  );
}
