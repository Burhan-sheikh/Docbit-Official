import { FileText, Image as ImageIcon, FileSpreadsheet, Presentation, Type, ScanLine, Archive, RefreshCw, Gauge, ShieldCheck, PenTool, CreditCard as Edit3, Sparkles, Wrench, FolderArchive, Briefcase, Code as Code2, Database } from 'lucide-react';
import type { CategoryDefinition } from './registry.types';

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'pdf', name: 'PDF', description: 'Merge, split, edit and convert PDF documents', icon: FileText },
  { id: 'images', name: 'Images', description: 'Convert, compress and optimize images', icon: ImageIcon },
  { id: 'documents', name: 'Documents', description: 'Word, text and document format tools', icon: FileText },
  { id: 'excel', name: 'Excel & CSV', description: 'Spreadsheets and CSV data tools', icon: FileSpreadsheet },
  { id: 'presentations', name: 'Presentations', description: 'Slides and presentation tools', icon: Presentation },
  { id: 'text', name: 'Text', description: 'Text utilities and converters', icon: Type },
  { id: 'ocr', name: 'OCR', description: 'Extract text from images and scans', icon: ScanLine },
  { id: 'compression', name: 'Compression', description: 'Compress files to save space', icon: Archive },
  { id: 'conversion', name: 'Conversion', description: 'Convert between file formats', icon: RefreshCw },
  { id: 'optimization', name: 'Optimization', description: 'Optimize and clean up files', icon: Gauge },
  { id: 'security', name: 'Security', description: 'Protect, encrypt and sign files', icon: ShieldCheck },
  { id: 'signing', name: 'Signing', description: 'E-signature and document signing', icon: PenTool },
  { id: 'editing', name: 'Editing', description: 'Edit and annotate documents', icon: Edit3 },
  { id: 'ai', name: 'AI', description: 'AI-assisted document utilities', icon: Sparkles },
  { id: 'utilities', name: 'Utilities', description: 'General purpose file utilities', icon: Wrench },
  { id: 'archives', name: 'Archives', description: 'Zip, unzip and archive tools', icon: FolderArchive },
  { id: 'business', name: 'Business', description: 'Business document generators', icon: Briefcase },
  { id: 'developer', name: 'Developer', description: 'Developer and data format tools', icon: Code2 },
  { id: 'data', name: 'Data', description: 'Data transformation tools', icon: Database },
];

export const CATEGORY_MAP: Record<string, CategoryDefinition> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);
