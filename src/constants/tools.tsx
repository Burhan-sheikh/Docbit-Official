import { 
  Files,
  Combine, 
  Scissors, 
  Image as ImageIcon, 
  FileImage, 
  Images
} from 'lucide-react';
import React from 'react';

export type ToolCategory = 'edit' | 'convert' | 'optimize';

export interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: ToolCategory;
  href: string;
}

export const TOOLS: PDFTool[] = [
  {
    id: 'img-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images into a single, high-quality PDF in seconds.',
    icon: <FileImage className="w-6 h-6" />,
    category: 'convert',
    href: '/tool/img-to-pdf',
  },
  {
    id: 'pdf-to-img',
    name: 'PDF to Image',
    description: 'Convert PDF pages into high-quality images for easy sharing.',
    icon: <Images className="w-6 h-6" />,
    category: 'convert',
    href: '/tool/pdf-to-img',
  },
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single, organized document.',
    icon: <Combine className="w-6 h-6" />,
    category: 'edit',
    href: '/tool/merge',
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Split a PDF into individual pages or extract only what you need.',
    icon: <Scissors className="w-6 h-6" />,
    category: 'edit',
    href: '/tool/split',
  },
];
