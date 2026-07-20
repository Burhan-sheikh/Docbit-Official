import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  QueuedFile,
  ProcessingResult,
  ProgressUpdate,
  ProcessorFn,
  ProcessingMode,
  ValidationRules,
} from './types';
import { validateFiles } from './validation';
import { runProcessing, createAbortController, friendlyError } from './processor';
import { cleanupAllUrls, downloadResult, downloadResults, downloadAsZip, shareResult } from './download';

export interface UseToolEngineOptions {
  mode: ProcessingMode;
  processor: ProcessorFn;
  validation: ValidationRules;
  toolId: string;
  toolName: string;
  onTrack?: (info: {
    toolId: string;
    toolName: string;
    filename?: string;
    outputType: string;
    fileSize: number;
    success: boolean;
    processingMethod: string;
  }) => void;
}

export interface ToolEngineState {
  queue: QueuedFile[];
  isProcessing: boolean;
  progress: ProgressUpdate | null;
  results: ProcessingResult[];
  error: string | null;
  elapsedMs: number;
  canProcess: boolean;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearQueue: () => void;
  reorderFile: (id: string, direction: 'up' | 'down') => void;
  process: (options?: Record<string, unknown>) => Promise<void>;
  cancel: () => void;
  retry: () => void;
  download: (result?: ProcessingResult) => Promise<void>;
  downloadAll: () => Promise<void>;
  downloadZip: (zipName: string) => Promise<void>;
  share: (result: ProcessingResult) => Promise<boolean>;
  reset: () => void;
}

export function useToolEngine(opts: UseToolEngineOptions): ToolEngineState {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const lastOptionsRef = useRef<Record<string, unknown> | undefined>(undefined);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      queue.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      cleanupAllUrls();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const addFiles = useCallback(
    (files: File[]) => {
      setError(null);
      setResults([]);
      setQueue((prev) => {
        const remaining = opts.validation.maxFiles - prev.length;
        const toAdd = files.slice(0, remaining);
        const { valid } = validateFiles(toAdd, opts.validation, prev);
        return [...prev, ...valid];
      });
    },
    [opts.validation]
  );

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => {
      const found = prev.find((f) => f.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue((prev) => {
      prev.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      return [];
    });
    setResults([]);
    setError(null);
  }, []);

  const reorderFile = useCallback((id: string, direction: 'up' | 'down') => {
    setQueue((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const process = useCallback(
    async (options: Record<string, unknown> = {}) => {
      if (queue.length < opts.validation.minFiles) {
        setError(`At least ${opts.validation.minFiles} file(s) required.`);
        return;
      }
      lastOptionsRef.current = options;
      setIsProcessing(true);
      setError(null);
      setResults([]);
      setProgress({ stage: 'Starting', current: 0, total: queue.length, percent: 0 });

      const controller = createAbortController();
      abortRef.current = controller;

      const result = await runProcessing({
        mode: opts.mode,
        processor: opts.processor,
        files: queue.map((q) => q.file),
        options,
        onProgress: setProgress,
        signal: controller.signal,
      });

      setIsProcessing(false);
      setProgress(null);
      setElapsedMs(result.elapsedMs);

      if (result.cancelled) {
        setError(null);
        return;
      }
      if (result.error) {
        setError(friendlyError(result.error));
        opts.onTrack?.({
          toolId: opts.toolId,
          toolName: opts.toolName,
          outputType: 'unknown',
          fileSize: 0,
          success: false,
          processingMethod: opts.mode,
        });
        return;
      }

      setResults(result.results);
      const first = result.results[0];
      opts.onTrack?.({
        toolId: opts.toolId,
        toolName: opts.toolName,
        filename: queue[0]?.file.name,
        outputType: first?.mimeType || 'unknown',
        fileSize: first?.size || 0,
        success: true,
        processingMethod: opts.mode,
      });
    },
    [queue, opts]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsProcessing(false);
    setProgress(null);
  }, []);

  const retry = useCallback(() => {
    if (lastOptionsRef.current !== undefined) {
      process(lastOptionsRef.current);
    }
  }, [process]);

  const download = useCallback(
    async (result?: ProcessingResult) => {
      const target = result || results[0];
      if (!target) return;
      await downloadResult(target);
    },
    [results]
  );

  const downloadAll = useCallback(async () => {
    await downloadResults(results);
  }, [results]);

  const downloadZip = useCallback(async (zipName: string) => {
    await downloadAsZip(results, zipName);
  }, [results]);

  const share = useCallback(
    async (result: ProcessingResult) => {
      return shareResult(result, opts.toolName);
    },
    [opts.toolName]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    clearQueue();
    setResults([]);
    setError(null);
    setProgress(null);
    setElapsedMs(0);
  }, [clearQueue]);

  const canProcess = queue.length >= opts.validation.minFiles && !isProcessing;

  return {
    queue,
    isProcessing,
    progress,
    results,
    error,
    elapsedMs,
    canProcess,
    addFiles,
    removeFile,
    clearQueue,
    reorderFile,
    process,
    cancel,
    retry,
    download,
    downloadAll,
    downloadZip,
    share,
    reset,
  };
}
