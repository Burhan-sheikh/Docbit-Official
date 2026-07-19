import { FileImage, FileText, FileType, FileSpreadsheet, Presentation } from 'lucide-react';
import type { CategoryDefinition } from './registry.types';

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'image', name: 'Image', description: 'Convert, compress and grayscale images', icon: FileImage },
  { id: 'pdf', name: 'PDF', description: 'Convert, compress, grayscale, merge and split PDFs', icon: FileText },
  { id: 'document', name: 'Document', description: 'Convert between document formats', icon: FileType },
  { id: 'spreadsheet', name: 'Spreadsheet', description: 'Convert between spreadsheet and data formats', icon: FileSpreadsheet },
  { id: 'presentation', name: 'Presentation', description: 'Convert between presentation formats', icon: Presentation },
];

export const CATEGORY_MAP: Record<string, CategoryDefinition> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);
