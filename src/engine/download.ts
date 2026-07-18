import type { ProcessingResult } from './types';

const createdUrls = new Set<string>();

export function createObjectURL(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  createdUrls.add(url);
  return url;
}

export function revokeObjectURL(url: string): void {
  if (createdUrls.has(url)) {
    URL.revokeObjectURL(url);
    createdUrls.delete(url);
  }
}

export function cleanupAllUrls(): void {
  createdUrls.forEach((url) => URL.revokeObjectURL(url));
  createdUrls.clear();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadResult(result: ProcessingResult): Promise<void> {
  downloadBlob(result.blob, result.filename);
}

export async function downloadResults(results: ProcessingResult[]): Promise<void> {
  for (const result of results) {
    await downloadResult(result);
    await new Promise((r) => setTimeout(r, 200));
  }
}

export async function shareResult(result: ProcessingResult, title = 'DocBit'): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    const file = new File([result.blob], result.filename, { type: result.mimeType });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return true;
    }
    await navigator.share({ title, text: result.filename });
    return true;
  } catch {
    return false;
  }
}
