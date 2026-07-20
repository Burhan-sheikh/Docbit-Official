import JSZip from 'jszip';
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

export async function downloadAsZip(
  results: ProcessingResult[],
  zipName: string
): Promise<void> {
  if (results.length === 0) return;
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const result of results) {
    let name = result.filename;
    let counter = 1;
    while (usedNames.has(name)) {
      const dot = result.filename.lastIndexOf('.');
      if (dot > 0) {
        name = `${result.filename.slice(0, dot)}_${counter}${result.filename.slice(dot)}`;
      } else {
        name = `${result.filename}_${counter}`;
      }
      counter++;
    }
    usedNames.add(name);
    zip.file(name, result.blob);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
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
