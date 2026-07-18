import type { ProcessorFn, ProcessingResult, ProgressUpdate, ProcessingMode } from './types';

export interface ProcessingOptions {
  mode: ProcessingMode;
  processor: ProcessorFn;
  files: File[];
  options: Record<string, unknown>;
  onProgress?: (update: ProgressUpdate) => void;
  signal?: AbortSignal;
}

export interface RunResult {
  results: ProcessingResult[];
  elapsedMs: number;
  cancelled: boolean;
  error: string | null;
}

function defaultProgress(_update: ProgressUpdate): void {}

export async function runProcessing(opts: ProcessingOptions): Promise<RunResult> {
  const start = performance.now();
  const onProgress = opts.onProgress || defaultProgress;
  const controller = opts.signal ? null : new AbortController();
  const signal = opts.signal || controller!.signal;

  try {
    onProgress({ stage: 'Starting', current: 0, total: opts.files.length, percent: 0 });
    const output = await opts.processor({
      files: opts.files,
      options: opts.options,
      onProgress,
      signal,
    });
    const results = Array.isArray(output) ? output : [output];
    onProgress({ stage: 'Complete', current: results.length, total: results.length, percent: 100 });
    return { results, elapsedMs: performance.now() - start, cancelled: false, error: null };
  } catch (err) {
    if (signal.aborted) {
      return { results: [], elapsedMs: performance.now() - start, cancelled: true, error: null };
    }
    const message = err instanceof Error ? err.message : 'Processing failed.';
    return { results: [], elapsedMs: performance.now() - start, cancelled: false, error: message };
  }
}

export function createAbortController(): AbortController {
  return new AbortController();
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

export class ToolError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ToolError';
  }
}

export function friendlyError(err: unknown): string {
  if (err instanceof ToolError) return err.message;
  if (err instanceof DOMException && err.name === 'AbortError') return 'Operation cancelled.';
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('out of memory') || msg.includes('allocation')) {
      return 'Your device ran out of memory. Try a smaller file or fewer files at once.';
    }
    if (msg.includes('worker') && msg.includes('failed')) {
      return 'Background processing failed. Your browser may not support this operation.';
    }
    if (msg.includes('pdf') && (msg.includes('parse') || msg.includes('load'))) {
      return 'This PDF appears to be corrupted or password-protected.';
    }
    if (msg.includes('image') && (msg.includes('decode') || msg.includes('load'))) {
      return 'This image file is corrupted or in an unsupported format.';
    }
    return err.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
