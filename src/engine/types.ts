export type ProcessingMode = 'local' | 'worker' | 'cloud';

export type FileStatus = 'pending' | 'valid' | 'invalid' | 'processing' | 'done' | 'error';

export interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string | null;
  size: number;
  extension: string;
  mimeType: string;
  status: FileStatus;
  error?: string;
  progress?: number;
}

export interface ValidationRules {
  acceptedExtensions: string[];
  acceptedMimeTypes: string[];
  maxFiles: number;
  minFiles: number;
  maxFileSizeMb: number;
  allowDuplicates: boolean;
  validateSignature: boolean;
}

export interface ProcessingResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface ProgressUpdate {
  stage: string;
  current: number;
  total: number;
  percent: number;
  message?: string;
}

export type ProcessorFn = (params: {
  files: File[];
  options: Record<string, unknown>;
  onProgress: (update: ProgressUpdate) => void;
  signal: AbortSignal;
}) => Promise<ProcessingResult | ProcessingResult[]>;

export const DEFAULT_RULES: ValidationRules = {
  acceptedExtensions: [],
  acceptedMimeTypes: [],
  maxFiles: 1,
  minFiles: 1,
  maxFileSizeMb: 100,
  allowDuplicates: false,
  validateSignature: true,
};
