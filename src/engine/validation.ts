import type { QueuedFile, ValidationRules } from './types';

const SIGNATURES: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpg: [0xff, 0xd8, 0xff],
  webp: [0x52, 0x49, 0x46, 0x46],
  gif: [0x47, 0x49, 0x46, 0x38],
  bmp: [0x42, 0x4d],
  zip: [0x50, 0x4b, 0x03, 0x04],
};

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function matchesSignature(bytes: Uint8Array, ext: string): boolean {
  const sig = SIGNATURES[ext];
  if (!sig) return true;
  if (bytes.length < sig.length) return false;
  return sig.every((b, i) => bytes[i] === b);
}

export async function readSignature(file: File, bytes = 8): Promise<Uint8Array> {
  const slice = file.slice(0, bytes);
  const buf = await slice.arrayBuffer();
  return new Uint8Array(buf);
}

export interface ValidationResult {
  valid: QueuedFile[];
  invalid: QueuedFile[];
  errors: Record<string, string>;
}

export function validateFiles(
  files: File[],
  rules: ValidationRules,
  existing: QueuedFile[] = []
): ValidationResult {
  const valid: QueuedFile[] = [];
  const invalid: QueuedFile[] = [];
  const errors: Record<string, string> = {};
  const existingNames = new Set(existing.map((f) => `${f.file.name}:${f.size}`));

  for (const file of files) {
    const id = crypto.randomUUID();
    const ext = getExtension(file.name);
    const mime = file.type;
    const error = (() => {
      if (file.size === 0) return 'File is empty.';
      if (rules.maxFileSizeMb && file.size > rules.maxFileSizeMb * 1024 * 1024) {
        return `File exceeds ${rules.maxFileSizeMb}MB limit.`;
      }
      if (rules.acceptedExtensions.length && !rules.acceptedExtensions.includes(ext)) {
        return `.${ext} files are not supported.`;
      }
      if (rules.acceptedMimeTypes.length && mime && !rules.acceptedMimeTypes.includes(mime)) {
        return `MIME type ${mime} is not supported.`;
      }
      if (!rules.allowDuplicates && existingNames.has(`${file.name}:${file.size}`)) {
        return 'Duplicate file already in queue.';
      }
      return null;
    })();

    const queued: QueuedFile = {
      id,
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      size: file.size,
      extension: ext,
      mimeType: mime,
      status: error ? 'invalid' : 'valid',
      error: error || undefined,
    };

    if (error) {
      invalid.push(queued);
      errors[id] = error;
    } else {
      valid.push(queued);
    }
  }
  return { valid, invalid, errors };
}
