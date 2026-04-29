import { 
  FileStack, 
  Combine, 
  Scissors, 
  Image as ImageIcon, 
  FileImage, 
  FileDown, 
  Fullscreen, 
  RotateCw
} from 'lucide-react';
import React from 'react';

export type ToolCategory = 'organize' | 'edit' | 'convert' | 'optimize';

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
    id: 'organize',
    name: 'PDF Organizer',
    description: 'Reorder, rotate, delete, or duplicate pages with a live preview.',
    icon: <FileStack className="w-6 h-6" />,
    category: 'organize',
    href: '/tool/organize',
  },
  {
    id: 'img-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images (JPG, PNG) into a polished PDF document.',
    icon: <FileImage className="w-6 h-6" />,
    category: 'convert',
    href: '/tool/img-to-pdf',
  },
  {
    id: 'pdf-to-img',
    name: 'PDF to Image',
    description: 'Convert PDF pages into high-quality JPG or PNG images.',
    icon: <ImageIcon className="w-6 h-6" />,
    category: 'convert',
    href: '/tool/pdf-to-img',
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal quality.',
    icon: <FileDown className="w-6 h-6" />,
    category: 'optimize',
    href: '/tool/compress',
  },
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document.',
    icon: <Combine className="w-6 h-6" />,
    category: 'organize',
    href: '/tool/merge',
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Separate one page or a whole set for easy extraction.',
    icon: <Scissors className="w-6 h-6" />,
    category: 'organize',
    href: '/tool/split',
  },
  {
    id: 'resize',
    name: 'Resize PDF',
    description: 'Change page dimensions to A4, Letter, or custom sizes.',
    icon: <Fullscreen className="w-6 h-6" />,
    category: 'optimize',
    href: '/tool/resize',
  },
];
