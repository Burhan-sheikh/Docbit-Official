import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderArchive, ShieldCheck, FileText, File, Download, FileCode, FileImage, Check } from 'lucide-react';
import JSZip from 'jszip';
import { useFileExitConfirm } from '../../hooks/useFileExitConfirm';
import { useConversionTracker } from '../../hooks/useConversionTracker';
import { TOOL_REGISTRY } from '../../tools/registry';
import type { ToolDefinition } from '../../tools/registry.types';
import { useToolEngine } from '../../engine/useToolEngine';
import { UploadZone } from '../../components/engine/UploadZone';
import { ProcessingStatus, ProgressBar } from '../../components/engine/Progress';
import { ResultPanel } from '../../components/engine/ResultPanel';
import { ToolShell } from '../../components/engine/ToolShell';
import { cn, formatBytes } from '../../lib/utils';

const tool: ToolDefinition = TOOL_REGISTRY.find((t) => t.id === 'zip-extractor')!;

interface ExtractedFile {
  filename: string;
  size: number;
  blob: Blob;
  isDirectory: boolean;
}

const unzipProcessor = async ({ files, options, onProgress, signal }: any) => {
  const { downloadMode } = options as { downloadMode: 'individual' | 'zip' };
  const file = files[0];
  const buffer = await file.arrayBuffer();

  onProgress({ stage: 'Reading archive', current: 0, total: 1, percent: 20 });
  const zip = await JSZip.loadAsync(buffer);

  const entries = Object.values(zip.files).filter((e) => !e.dir);
  onProgress({ stage: 'Extracting files', current: 0, total: entries.length, percent: 30 });

  const extracted: ExtractedFile[] = [];
  for (let i = 0; i < entries.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const entry = entries[i];
    const blob = await entry.async('blob');
    extracted.push({ filename: entry.name, size: blob.size, blob, isDirectory: false });
    onProgress({ stage: `Extracting ${entry.name}`, current: i + 1, total: entries.length, percent: 30 + Math.round(((i + 1) / entries.length) * 60) });
  }

  if (downloadMode === 'zip') {
    onProgress({ stage: 'Repackaging ZIP', current: entries.length, total: entries.length, percent: 95 });
    const outZip = new JSZip();
    for (const f of extracted) {
      outZip.file(f.filename, f.blob);
    }
    const outBlob = await outZip.generateAsync({ type: 'blob' });
    onProgress({ stage: 'Complete', current: extracted.length, total: extracted.length, percent: 100 });
    return {
      blob: outBlob,
      filename: `extracted_${file.name}`,
      mimeType: 'application/zip',
      size: outBlob.size,
      url: URL.createObjectURL(outBlob),
    };
  }

  onProgress({ stage: 'Complete', current: extracted.length, total: extracted.length, percent: 100 });
  return extracted.map((f) => ({
    blob: f.blob,
    filename: f.filename.split('/').pop() || f.filename,
    mimeType: 'application/octet-stream',
    size: f.size,
    url: URL.createObjectURL(f.blob),
  }));
};

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return <FileImage className="w-5 h-5 text-blue-500" />;
  if (['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py', 'java', 'c', 'cpp'].includes(ext)) return <FileCode className="w-5 h-5 text-amber-500" />;
  if (['pdf'].includes(ext)) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-neutral-400" />;
}

export default function UnzipTool() {
  const [downloadMode, setDownloadMode] = useState<'individual' | 'zip'>('individual');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<ExtractedFile[]>([]);
  const track = useConversionTracker();

  const engine = useToolEngine({
    mode: 'local',
    processor: unzipProcessor,
    validation: {
      acceptedExtensions: ['zip'],
      acceptedMimeTypes: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
      maxFiles: 1,
      minFiles: 1,
      maxFileSizeMb: 500,
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
    if (engine.results.length === 0) {
      setExtractedPreview([]);
      return;
    }
    if (downloadMode === 'individual') {
      (async () => {
        const buffer = await file!.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        const entries = Object.values(zip.files).filter((e) => !e.dir);
        const preview: ExtractedFile[] = [];
        for (const e of entries) {
          const blob = await e.async('blob');
          preview.push({ filename: e.name, size: blob.size, blob, isDirectory: false });
        }
        setExtractedPreview(preview);
      })();
    }
  }, [engine.results, file, downloadMode]);

  const handleDownload = async () => {
    if (downloadMode === 'zip' || engine.results.length === 1) {
      await engine.download();
    } else {
      await engine.downloadAll();
    }
    setIsDownloaded(true);
  };

  const handleDownloadOne = async (filename: string) => {
    const result = engine.results.find((r) => r.filename === filename);
    if (result) await engine.download(result);
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
            onReset={() => { engine.reset(); setIsDownloaded(false); setExtractedPreview([]); }}
            onBack={() => engine.reset()}
            elapsedMs={engine.elapsedMs}
            title={downloadMode === 'zip' ? 'Archive Ready' : 'Files Extracted'}
          />
        )}
      </AnimatePresence>

      {!file ? (
        <UploadZone
          onFilesSelected={engine.addFiles}
          validation={{
            acceptedExtensions: ['zip'],
            acceptedMimeTypes: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
            maxFiles: 1,
            minFiles: 1,
            maxFileSizeMb: 500,
            allowDuplicates: false,
            validateSignature: true,
          }}
          label="Select ZIP Archive"
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Unzip / Extract</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Extract files from ZIP archives — entirely in your browser.</p>
            </div>
            <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl cursor-pointer active:scale-95 text-sm uppercase italic tracking-tighter shrink-0">
              <Plus className="w-5 h-5" /> REPLACE
              <input type="file" className="hidden" accept=".zip,application/zip" onChange={(e) => { engine.clearQueue(); setExtractedPreview([]); e.target.files && engine.addFiles(Array.from(e.target.files)); }} />
            </label>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-8 space-y-8">
                <div className="flex items-center gap-3 text-blue-600">
                  <FolderArchive className="w-5 h-5" />
                  <h3 className="text-xs font-black tracking-widest uppercase">Archive Info</h3>
                </div>
                <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <FolderArchive className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black truncate text-sm uppercase italic">{file.name}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{formatBytes(file.size)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider italic">Output Mode</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setDownloadMode('individual')} className={cn('flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left', downloadMode === 'individual' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300')}>
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', downloadMode === 'individual' ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800')}><File className="w-5 h-5" /></div>
                      <div><p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">Individual</p><p className={cn('text-[8px] font-bold uppercase tracking-widest', downloadMode === 'individual' ? 'text-blue-100' : 'text-neutral-400')}>Download each file</p></div>
                    </button>
                    <button onClick={() => setDownloadMode('zip')} className={cn('flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left', downloadMode === 'zip' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300')}>
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', downloadMode === 'zip' ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800')}><FolderArchive className="w-5 h-5" /></div>
                      <div><p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">Re-ZIP</p><p className={cn('text-[8px] font-bold uppercase tracking-widest', downloadMode === 'zip' ? 'text-blue-100' : 'text-neutral-400')}>Single archive</p></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-neutral-100 dark:border-neutral-800 pt-8 xl:pt-0 xl:pl-8 flex flex-col justify-center">
                <div className="space-y-6">
                  {engine.isProcessing && <ProgressBar progress={engine.progress} />}
                  <button onClick={() => engine.process({ downloadMode })} disabled={engine.isProcessing} className="group w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    {engine.isProcessing ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <FolderArchive className="w-6 h-6 transition-transform group-hover:scale-110" />}
                    <span className="text-lg tracking-tight uppercase">{engine.isProcessing ? 'EXTRACTING...' : 'EXTRACT'}</span>
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Browser-Only
                  </div>
                </div>
              </div>
            </div>
          </div>

          {extractedPreview.length > 0 && downloadMode === 'individual' && (
            <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Extracted Files ({extractedPreview.length})</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                {extractedPreview.map((f, i) => (
                  <motion.div key={i} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    {getFileIcon(f.filename)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-neutral-900 dark:text-neutral-100">{f.filename.split('/').pop()}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{formatBytes(f.size)}</p>
                    </div>
                    <button onClick={() => handleDownloadOne(f.filename.split('/').pop() || f.filename)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-white dark:hover:bg-neutral-700 rounded-lg transition-all" aria-label="Download">
                      <Download className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <ProcessingStatus isProcessing={engine.isProcessing} progress={engine.progress} elapsedMs={engine.elapsedMs} error={engine.error} onCancel={engine.cancel} />
        </div>
      )}
    </ToolShell>
  );
}
