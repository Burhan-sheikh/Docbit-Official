import {
  FileImage,
  FileText,
  FileType,
  FileSpreadsheet,
  Presentation,
  Combine,
  Scissors,
  Palette,
  Gauge,
  Image as ImageIcon,
  Type,
} from 'lucide-react';
import type { ToolDefinition } from './registry.types';
import { TOOL_SEO_CONTENT } from '../constants/toolSeoContent';

// Category icon map: each category has ONE icon reused by all its tools.
export const CATEGORY_ICONS: Record<string, typeof FileImage> = {
  image: FileImage,
  pdf: FileText,
  document: FileType,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
};

const soon = (def: Omit<ToolDefinition, 'component' | 'comingSoon' | 'processingMode' | 'supportsBatch' | 'maxFiles' | 'acceptedFormats' | 'outputFormats' | 'icon'> & {
  icon?: typeof FileImage;
  maxFiles?: number;
  acceptedFormats?: string[];
  outputFormats?: string[];
  supportsBatch?: boolean;
}): ToolDefinition => ({
  ...def,
  category: def.category as ToolDefinition['category'],
  icon: def.icon ?? CATEGORY_ICONS[def.category as string] ?? FileText,
  component: () => import('../components/tools/ComingSoonTool'),
  comingSoon: true,
  processingMode: 'local',
  supportsBatch: def.supportsBatch ?? false,
  maxFiles: def.maxFiles ?? 1,
  acceptedFormats: def.acceptedFormats ?? [],
  outputFormats: def.outputFormats ?? [],
});

export const TOOL_REGISTRY: ToolDefinition[] = [
  // ============================ IMAGE (10) ============================
  {
    id: 'png-to-jpg',
    slug: 'png-to-jpg',
    name: 'PNG to JPG',
    description: 'Convert PNG images to JPG format.',
    category: 'image',
    icon: FileImage,
    component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['png to jpg', 'convert png'],
    isPopular: true,
    processingMode: 'local',
    supportsBatch: true,
    maxFiles: 50,
    acceptedFormats: ['png'],
    outputFormats: ['jpg'],
    seo: { title: 'PNG to JPG Online Free', description: 'Convert PNG to JPG online free with DocBit. Batch up to 50 images.', keywords: ['png to jpg'] },
  },
  {
    id: 'jpg-to-png', slug: 'jpg-to-png', name: 'JPG to PNG', description: 'Convert JPG images to PNG format.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['jpg to png'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['jpg', 'jpeg'], outputFormats: ['png'],
    seo: { title: 'JPG to PNG Online Free', description: 'Convert JPG to PNG online free with DocBit.', keywords: ['jpg to png'] },
  },
  {
    id: 'webp-to-jpg', slug: 'webp-to-jpg', name: 'WebP to JPG', description: 'Convert WebP images to JPG format.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['webp to jpg'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['webp'], outputFormats: ['jpg'],
    seo: { title: 'WebP to JPG Online Free', description: 'Convert WebP to JPG online free with DocBit.', keywords: ['webp to jpg'] },
  },
  {
    id: 'jpg-to-webp', slug: 'jpg-to-webp', name: 'JPG to WebP', description: 'Convert JPG images to WebP format.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['jpg to webp'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['jpg', 'jpeg'], outputFormats: ['webp'],
    seo: { title: 'JPG to WebP Online Free', description: 'Convert JPG to WebP online free with DocBit.', keywords: ['jpg to webp'] },
  },
  {
    id: 'png-to-webp', slug: 'png-to-webp', name: 'PNG to WebP', description: 'Convert PNG images to WebP format.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['png to webp'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['png'], outputFormats: ['webp'],
    seo: { title: 'PNG to WebP Online Free', description: 'Convert PNG to WebP online free with DocBit.', keywords: ['png to webp'] },
  },
  {
    id: 'webp-to-png', slug: 'webp-to-png', name: 'WebP to PNG', description: 'Convert WebP images to PNG format.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['webp to png'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['webp'], outputFormats: ['png'],
    seo: { title: 'WebP to PNG Online Free', description: 'Convert WebP to PNG online free with DocBit.', keywords: ['webp to png'] },
  },
  {
    id: 'bmp-to-png', slug: 'bmp-to-png', name: 'BMP to PNG', description: 'Convert BMP images to PNG format.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['bmp to png'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['bmp'], outputFormats: ['png'],
    seo: { title: 'BMP to PNG Online Free', description: 'Convert BMP to PNG online free with DocBit.', keywords: ['bmp to png'] },
  },
  {
    id: 'tiff-to-jpg', slug: 'tiff-to-jpg', name: 'TIFF to JPG', description: 'Convert TIFF images to JPG format.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['tiff to jpg'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['tiff', 'tif'], outputFormats: ['jpg'],
    seo: { title: 'TIFF to JPG Online Free', description: 'Convert TIFF to JPG online free with DocBit.', keywords: ['tiff to jpg'] },
  },
  {
    id: 'gif-to-png', slug: 'gif-to-png', name: 'GIF to PNG', description: 'Convert GIF first frame to PNG.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['gif to png'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['gif'], outputFormats: ['png'],
    seo: { title: 'GIF to PNG Online Free', description: 'Convert GIF to PNG (first frame) online free with DocBit.', keywords: ['gif to png'] },
  },
  {
    id: 'heic-to-jpg', slug: 'heic-to-jpg', name: 'HEIC to JPG', description: 'Convert HEIC images to JPG format.',
    category: 'image', icon: FileImage, component: () => import('../components/tools/ImageConverterTool'),
    searchTerms: ['heic to jpg'], processingMode: 'local', supportsBatch: true, maxFiles: 50,
    acceptedFormats: ['heic'], outputFormats: ['jpg'],
    seo: { title: 'HEIC to JPG Online Free', description: 'Convert HEIC to JPG online free with DocBit.', keywords: ['heic to jpg'] },
  },
  // Image: Compress
  {
    id: 'compress-image',
    slug: 'compress-image',
    name: 'Compress Image',
    description: 'Reduce image file size without losing quality — batch compress up to 50 images.',
    category: 'image',
    icon: Gauge,
    component: () => import('../components/tools/CompressImageTool'),
    searchTerms: ['image compressor', 'reduce image size', 'compress jpg', 'compress png', 'compress webp'],
    isPopular: true,
    processingMode: 'local',
    supportsBatch: true,
    maxFiles: 50,
    acceptedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    outputFormats: ['jpg', 'png', 'webp'],
    seo: {
      title: 'Compress Image Online Free (JPG, PNG, WebP)',
      description: 'Compress JPG, PNG, and WebP images online free with DocBit. Batch compress up to 50 images at once.',
      keywords: ['compress image', 'image compressor', 'reduce image size'],
      ogImage: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778171812/compress-image.jpg',
    },
    longContent: TOOL_SEO_CONTENT.compressImage,
  },
  // Image: Grayscale
  {
    id: 'grayscale-image',
    slug: 'grayscale-image',
    name: 'Grayscale Image',
    description: 'Convert images to grayscale or black & white — batch up to 50 images.',
    category: 'image',
    icon: Palette,
    component: () => import('../components/tools/GrayscaleImageTool'),
    searchTerms: ['grayscale image', 'black and white image', 'monochrome image'],
    isPopular: true,
    processingMode: 'local',
    supportsBatch: true,
    maxFiles: 50,
    acceptedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    outputFormats: ['jpg', 'png'],
    seo: { title: 'Grayscale Image Online Free', description: 'Convert images to grayscale online free with DocBit.', keywords: ['grayscale image', 'black and white'] },
  },

  // ============================ PDF (10) ============================
  {
    id: 'img-to-pdf',
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert JPG, PNG and WebP images into a single high-quality PDF.',
    category: 'pdf',
    icon: FileImage,
    component: () => import('../components/tools/ImgToPdfTool'),
    searchTerms: ['jpg to pdf', 'png to pdf', 'photo to pdf', 'webp to pdf'],
    isPopular: true,
    processingMode: 'local',
    supportsBatch: true,
    maxFiles: 50,
    acceptedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    outputFormats: ['pdf'],
    seo: {
      title: 'Image to PDF Converter Online Free',
      description: 'Convert up to 50 images into a single PDF file online using DocBit.',
      keywords: ['image to pdf', 'jpg to pdf', 'png to pdf'],
      ogImage: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778171813/image-to-pdf_wxix5w.jpg',
    },
    longContent: TOOL_SEO_CONTENT.imgToPdf,
  },
  {
    id: 'pdf-to-img',
    slug: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Convert PDF pages into high-quality JPG or PNG images.',
    category: 'pdf',
    icon: FileImage,
    component: () => import('../components/tools/PdfToImgTool'),
    searchTerms: ['pdf to jpg', 'pdf to png', 'pdf to image', 'extract images from pdf'],
    isPopular: true,
    processingMode: 'local',
    supportsBatch: true,
    maxFiles: 1,
    acceptedFormats: ['pdf'],
    outputFormats: ['jpg', 'png'],
    seo: {
      title: 'Convert PDF to JPG or PNG Online Free',
      description: 'Free PDF to image converter online. Convert PDF to JPG or PNG instantly.',
      keywords: ['pdf to jpg', 'pdf to png', 'pdf to image'],
      ogImage: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778171813/pdf-to-images_kjjor5.jpg',
    },
    longContent: TOOL_SEO_CONTENT.pdfToImg,
  },
  soon({
    id: 'html-to-pdf', slug: 'html-to-pdf', name: 'HTML to PDF', description: 'Convert HTML files to PDF.',
    category: 'pdf', searchTerms: ['html to pdf'],
    acceptedFormats: ['html', 'htm'], outputFormats: ['pdf'],
    seo: { title: 'HTML to PDF Online Free', description: 'Convert HTML to PDF online free with DocBit.', keywords: ['html to pdf'] },
  }),
  soon({
    id: 'pdf-to-html', slug: 'pdf-to-html', name: 'PDF to HTML', description: 'Convert PDF to HTML files.',
    category: 'pdf', searchTerms: ['pdf to html'],
    acceptedFormats: ['pdf'], outputFormats: ['html'],
    seo: { title: 'PDF to HTML Online Free', description: 'Convert PDF to HTML online free with DocBit.', keywords: ['pdf to html'] },
  }),
  soon({
    id: 'pdf-to-jpg', slug: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Convert PDF pages to JPG images.',
    category: 'pdf', searchTerms: ['pdf to jpg'],
    acceptedFormats: ['pdf'], outputFormats: ['jpg'],
    seo: { title: 'PDF to JPG Online Free', description: 'Convert PDF to JPG online free with DocBit.', keywords: ['pdf to jpg'] },
  }),
  soon({
    id: 'pdf-to-png', slug: 'pdf-to-png', name: 'PDF to PNG', description: 'Convert PDF pages to PNG images.',
    category: 'pdf', searchTerms: ['pdf to png'],
    acceptedFormats: ['pdf'], outputFormats: ['png'],
    seo: { title: 'PDF to PNG Online Free', description: 'Convert PDF to PNG online free with DocBit.', keywords: ['pdf to png'] },
  }),
  soon({
    id: 'compress-pdf', slug: 'compress-pdf', name: 'Compress PDF', description: 'Reduce PDF file size while keeping quality.',
    category: 'pdf', searchTerms: ['compress pdf', 'reduce pdf size'],
    acceptedFormats: ['pdf'], outputFormats: ['pdf'],
    seo: { title: 'Compress PDF Online Free', description: 'Reduce PDF file size with DocBit.', keywords: ['compress pdf'] },
  }),
  {
    id: 'grayscale-pdf',
    slug: 'grayscale-pdf',
    name: 'Grayscale PDF',
    description: 'Convert color PDFs to grayscale or black and white for efficient printing.',
    category: 'pdf',
    icon: Palette,
    component: () => import('../components/tools/GrayscaleTool'),
    searchTerms: ['black and white pdf', 'bw pdf', 'monochrome pdf', 'pdf to grayscale'],
    processingMode: 'local',
    supportsBatch: false,
    maxFiles: 1,
    acceptedFormats: ['pdf'],
    outputFormats: ['pdf'],
    seo: {
      title: 'Grayscale PDF Online Free (Black & White)',
      description: 'Convert color PDFs to grayscale or pure black and white online with DocBit.',
      keywords: ['grayscale pdf', 'black and white pdf'],
      ogImage: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778697040/Grayscale_pdf_uwrthg.jpg',
    },
    longContent: TOOL_SEO_CONTENT.grayscalePdf,
  },
  {
    id: 'merge',
    slug: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single, organized document.',
    category: 'pdf',
    icon: Combine,
    component: () => import('../components/tools/MergeTool'),
    searchTerms: ['combine pdf', 'join pdf', 'merge pdf files'],
    isPopular: true,
    processingMode: 'local',
    supportsBatch: true,
    maxFiles: 10,
    acceptedFormats: ['pdf'],
    outputFormats: ['pdf'],
    seo: {
      title: 'Merge PDF Files Online Free (Fast & Private)',
      description: 'Merge PDF files online free. Combine multiple PDFs into one document instantly.',
      keywords: ['merge pdf', 'combine pdf', 'join pdf'],
      ogImage: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778171812/merge-pdf_o8l7wm.jpg',
    },
    longContent: TOOL_SEO_CONTENT.merge,
  },
  {
    id: 'split',
    slug: 'split-pdf',
    name: 'Split PDF',
    description: 'Split a PDF into individual pages or extract only what you need.',
    category: 'pdf',
    icon: Scissors,
    component: () => import('../components/tools/SplitTool'),
    searchTerms: ['extract pdf pages', 'pdf splitter', 'separate pdf pages'],
    isPopular: true,
    processingMode: 'local',
    supportsBatch: false,
    maxFiles: 1,
    acceptedFormats: ['pdf'],
    outputFormats: ['pdf'],
    seo: {
      title: 'Split PDF Online Free (Extract Pages Instantly)',
      description: 'Split PDF online free. Extract pages or separate PDF files instantly.',
      keywords: ['split pdf', 'extract pdf pages', 'pdf splitter'],
      ogImage: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778171812/split-pdf_nmlgsz.jpg',
    },
    longContent: TOOL_SEO_CONTENT.split,
  },

  // ============================ DOCUMENT (10) ============================
  soon({
    id: 'docx-to-pdf', slug: 'docx-to-pdf', name: 'DOCX to PDF', description: 'Convert Word documents to PDF.',
    category: 'document', searchTerms: ['docx to pdf', 'word to pdf'],
    acceptedFormats: ['docx'], outputFormats: ['pdf'],
    seo: { title: 'DOCX to PDF Online Free', description: 'Convert DOCX to PDF online free with DocBit.', keywords: ['docx to pdf', 'word to pdf'] },
  }),
  soon({
    id: 'pdf-to-docx', slug: 'pdf-to-docx', name: 'PDF to DOCX', description: 'Convert PDF to editable Word documents.',
    category: 'document', searchTerms: ['pdf to docx', 'pdf to word'],
    acceptedFormats: ['pdf'], outputFormats: ['docx'],
    seo: { title: 'PDF to DOCX Online Free', description: 'Convert PDF to DOCX online free with DocBit.', keywords: ['pdf to docx', 'pdf to word'] },
  }),
  {
    id: 'text-to-pdf',
    slug: 'text-to-pdf',
    name: 'TXT to PDF',
    description: 'Convert plain text or Markdown files into formatted PDF documents.',
    category: 'document',
    icon: Type,
    component: () => import('../components/tools/TextToPdfTool'),
    searchTerms: ['txt to pdf', 'text file to pdf', 'markdown to pdf'],
    processingMode: 'local',
    supportsBatch: false,
    maxFiles: 1,
    acceptedFormats: ['txt', 'md'],
    outputFormats: ['pdf'],
    seo: {
      title: 'Text to PDF Converter Online Free (TXT & Markdown)',
      description: 'Convert plain text and Markdown files into formatted PDF documents online free with DocBit.',
      keywords: ['text to pdf', 'txt to pdf', 'markdown to pdf'],
      ogImage: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778171812/text-to-pdf.jpg',
    },
    longContent: TOOL_SEO_CONTENT.textToPdf,
  },
  soon({
    id: 'pdf-to-txt', slug: 'pdf-to-txt', name: 'PDF to TXT', description: 'Convert PDF to plain text.',
    category: 'document', searchTerms: ['pdf to txt', 'pdf to text'],
    acceptedFormats: ['pdf'], outputFormats: ['txt'],
    seo: { title: 'PDF to TXT Online Free', description: 'Convert PDF to TXT online free with DocBit.', keywords: ['pdf to txt'] },
  }),
  soon({
    id: 'html-to-docx', slug: 'html-to-docx', name: 'HTML to DOCX', description: 'Convert HTML to Word documents.',
    category: 'document', searchTerms: ['html to docx', 'html to word'],
    acceptedFormats: ['html', 'htm'], outputFormats: ['docx'],
    seo: { title: 'HTML to DOCX Online Free', description: 'Convert HTML to DOCX online free with DocBit.', keywords: ['html to docx'] },
  }),
  soon({
    id: 'docx-to-html', slug: 'docx-to-html', name: 'DOCX to HTML', description: 'Convert Word documents to HTML.',
    category: 'document', searchTerms: ['docx to html', 'word to html'],
    acceptedFormats: ['docx'], outputFormats: ['html'],
    seo: { title: 'DOCX to HTML Online Free', description: 'Convert DOCX to HTML online free with DocBit.', keywords: ['docx to html'] },
  }),
  soon({
    id: 'markdown-to-pdf', slug: 'markdown-to-pdf', name: 'Markdown to PDF', description: 'Convert Markdown to PDF.',
    category: 'document', searchTerms: ['markdown to pdf', 'md to pdf'],
    acceptedFormats: ['md'], outputFormats: ['pdf'],
    seo: { title: 'Markdown to PDF Online Free', description: 'Convert Markdown to PDF online free with DocBit.', keywords: ['markdown to pdf'] },
  }),
  soon({
    id: 'pdf-to-markdown', slug: 'pdf-to-markdown', name: 'PDF to Markdown', description: 'Convert PDF to Markdown.',
    category: 'document', searchTerms: ['pdf to markdown'],
    acceptedFormats: ['pdf'], outputFormats: ['md'],
    seo: { title: 'PDF to Markdown Online Free', description: 'Convert PDF to Markdown online free with DocBit.', keywords: ['pdf to markdown'] },
  }),
  soon({
    id: 'epub-to-pdf', slug: 'epub-to-pdf', name: 'EPUB to PDF', description: 'Convert EPUB ebooks to PDF.',
    category: 'document', searchTerms: ['epub to pdf'],
    acceptedFormats: ['epub'], outputFormats: ['pdf'],
    seo: { title: 'EPUB to PDF Online Free', description: 'Convert EPUB to PDF online free with DocBit.', keywords: ['epub to pdf'] },
  }),
  soon({
    id: 'pdf-to-epub', slug: 'pdf-to-epub', name: 'PDF to EPUB', description: 'Convert PDF to EPUB ebooks.',
    category: 'document', searchTerms: ['pdf to epub'],
    acceptedFormats: ['pdf'], outputFormats: ['epub'],
    seo: { title: 'PDF to EPUB Online Free', description: 'Convert PDF to EPUB online free with DocBit.', keywords: ['pdf to epub'] },
  }),

  // ============================ SPREADSHEET (10) ============================
  soon({
    id: 'excel-to-pdf', slug: 'excel-to-pdf', name: 'Excel to PDF', description: 'Convert Excel spreadsheets to PDF.',
    category: 'spreadsheet', searchTerms: ['excel to pdf', 'xlsx to pdf'],
    acceptedFormats: ['xlsx', 'xls'], outputFormats: ['pdf'],
    seo: { title: 'Excel to PDF Online Free', description: 'Convert Excel to PDF online free with DocBit.', keywords: ['excel to pdf', 'xlsx to pdf'] },
  }),
  soon({
    id: 'pdf-to-excel', slug: 'pdf-to-excel', name: 'PDF to Excel', description: 'Convert PDF tables to Excel.',
    category: 'spreadsheet', searchTerms: ['pdf to excel', 'pdf to xlsx'],
    acceptedFormats: ['pdf'], outputFormats: ['xlsx'],
    seo: { title: 'PDF to Excel Online Free', description: 'Convert PDF to Excel online free with DocBit.', keywords: ['pdf to excel'] },
  }),
  soon({
    id: 'csv-to-excel', slug: 'csv-to-excel', name: 'CSV to Excel', description: 'Convert CSV to Excel format.',
    category: 'spreadsheet', searchTerms: ['csv to excel', 'csv to xlsx'],
    acceptedFormats: ['csv'], outputFormats: ['xlsx'],
    seo: { title: 'CSV to Excel Online Free', description: 'Convert CSV to Excel online free with DocBit.', keywords: ['csv to excel'] },
  }),
  soon({
    id: 'excel-to-csv', slug: 'excel-to-csv', name: 'Excel to CSV', description: 'Convert Excel to CSV format.',
    category: 'spreadsheet', searchTerms: ['excel to csv', 'xlsx to csv'],
    acceptedFormats: ['xlsx', 'xls'], outputFormats: ['csv'],
    seo: { title: 'Excel to CSV Online Free', description: 'Convert Excel to CSV online free with DocBit.', keywords: ['excel to csv'] },
  }),
  soon({
    id: 'csv-to-json', slug: 'csv-to-json', name: 'CSV to JSON', description: 'Convert CSV to JSON format.',
    category: 'spreadsheet', searchTerms: ['csv to json'],
    acceptedFormats: ['csv'], outputFormats: ['json'],
    seo: { title: 'CSV to JSON Online Free', description: 'Convert CSV to JSON online free with DocBit.', keywords: ['csv to json'] },
  }),
  soon({
    id: 'json-to-csv', slug: 'json-to-csv', name: 'JSON to CSV', description: 'Convert JSON to CSV format.',
    category: 'spreadsheet', searchTerms: ['json to csv'],
    acceptedFormats: ['json'], outputFormats: ['csv'],
    seo: { title: 'JSON to CSV Online Free', description: 'Convert JSON to CSV online free with DocBit.', keywords: ['json to csv'] },
  }),
  soon({
    id: 'excel-to-json', slug: 'excel-to-json', name: 'Excel to JSON', description: 'Convert Excel to JSON format.',
    category: 'spreadsheet', searchTerms: ['excel to json', 'xlsx to json'],
    acceptedFormats: ['xlsx', 'xls'], outputFormats: ['json'],
    seo: { title: 'Excel to JSON Online Free', description: 'Convert Excel to JSON online free with DocBit.', keywords: ['excel to json'] },
  }),
  soon({
    id: 'json-to-excel', slug: 'json-to-excel', name: 'JSON to Excel', description: 'Convert JSON to Excel format.',
    category: 'spreadsheet', searchTerms: ['json to excel', 'json to xlsx'],
    acceptedFormats: ['json'], outputFormats: ['xlsx'],
    seo: { title: 'JSON to Excel Online Free', description: 'Convert JSON to Excel online free with DocBit.', keywords: ['json to excel'] },
  }),
  soon({
    id: 'tsv-to-csv', slug: 'tsv-to-csv', name: 'TSV to CSV', description: 'Convert TSV to CSV format.',
    category: 'spreadsheet', searchTerms: ['tsv to csv'],
    acceptedFormats: ['tsv'], outputFormats: ['csv'],
    seo: { title: 'TSV to CSV Online Free', description: 'Convert TSV to CSV online free with DocBit.', keywords: ['tsv to csv'] },
  }),
  soon({
    id: 'csv-to-tsv', slug: 'csv-to-tsv', name: 'CSV to TSV', description: 'Convert CSV to TSV format.',
    category: 'spreadsheet', searchTerms: ['csv to tsv'],
    acceptedFormats: ['csv'], outputFormats: ['tsv'],
    seo: { title: 'CSV to TSV Online Free', description: 'Convert CSV to TSV online free with DocBit.', keywords: ['csv to tsv'] },
  }),

  // ============================ PRESENTATION (10) ============================
  soon({
    id: 'pptx-to-pdf', slug: 'pptx-to-pdf', name: 'PPTX to PDF', description: 'Convert PowerPoint to PDF.',
    category: 'presentation', searchTerms: ['pptx to pdf', 'ppt to pdf', 'powerpoint to pdf'],
    acceptedFormats: ['pptx', 'ppt'], outputFormats: ['pdf'],
    seo: { title: 'PPTX to PDF Online Free', description: 'Convert PPTX to PDF online free with DocBit.', keywords: ['pptx to pdf', 'powerpoint to pdf'] },
  }),
  soon({
    id: 'pdf-to-pptx', slug: 'pdf-to-pptx', name: 'PDF to PPTX', description: 'Convert PDF to PowerPoint.',
    category: 'presentation', searchTerms: ['pdf to pptx', 'pdf to ppt'],
    acceptedFormats: ['pdf'], outputFormats: ['pptx'],
    seo: { title: 'PDF to PPTX Online Free', description: 'Convert PDF to PPTX online free with DocBit.', keywords: ['pdf to pptx'] },
  }),
  soon({
    id: 'pptx-to-images', slug: 'pptx-to-images', name: 'PPTX to Images', description: 'Convert PowerPoint slides to images.',
    category: 'presentation', searchTerms: ['pptx to images', 'ppt to png'],
    acceptedFormats: ['pptx', 'ppt'], outputFormats: ['jpg', 'png'],
    seo: { title: 'PPTX to Images Online Free', description: 'Convert PPTX to images online free with DocBit.', keywords: ['pptx to images'] },
  }),
  soon({
    id: 'images-to-pptx', slug: 'images-to-pptx', name: 'Images to PPTX', description: 'Convert images to PowerPoint slides.',
    category: 'presentation', searchTerms: ['images to pptx', 'image to powerpoint'],
    acceptedFormats: ['jpg', 'jpeg', 'png', 'webp'], outputFormats: ['pptx'], supportsBatch: true, maxFiles: 50,
    seo: { title: 'Images to PPTX Online Free', description: 'Convert images to PPTX online free with DocBit.', keywords: ['images to pptx'] },
  }),
  soon({
    id: 'pptx-to-html', slug: 'pptx-to-html', name: 'PPTX to HTML', description: 'Convert PowerPoint to HTML.',
    category: 'presentation', searchTerms: ['pptx to html'],
    acceptedFormats: ['pptx', 'ppt'], outputFormats: ['html'],
    seo: { title: 'PPTX to HTML Online Free', description: 'Convert PPTX to HTML online free with DocBit.', keywords: ['pptx to html'] },
  }),
  soon({
    id: 'html-to-pptx', slug: 'html-to-pptx', name: 'HTML to PPTX', description: 'Convert HTML to PowerPoint.',
    category: 'presentation', searchTerms: ['html to pptx'],
    acceptedFormats: ['html', 'htm'], outputFormats: ['pptx'],
    seo: { title: 'HTML to PPTX Online Free', description: 'Convert HTML to PPTX online free with DocBit.', keywords: ['html to pptx'] },
  }),
  soon({
    id: 'odp-to-pptx', slug: 'odp-to-pptx', name: 'ODP to PPTX', description: 'Convert ODP to PowerPoint.',
    category: 'presentation', searchTerms: ['odp to pptx'],
    acceptedFormats: ['odp'], outputFormats: ['pptx'],
    seo: { title: 'ODP to PPTX Online Free', description: 'Convert ODP to PPTX online free with DocBit.', keywords: ['odp to pptx'] },
  }),
  soon({
    id: 'pptx-to-odp', slug: 'pptx-to-odp', name: 'PPTX to ODP', description: 'Convert PowerPoint to ODP.',
    category: 'presentation', searchTerms: ['pptx to odp'],
    acceptedFormats: ['pptx', 'ppt'], outputFormats: ['odp'],
    seo: { title: 'PPTX to ODP Online Free', description: 'Convert PPTX to ODP online free with DocBit.', keywords: ['pptx to odp'] },
  }),
  soon({
    id: 'pptx-to-png', slug: 'pptx-to-png', name: 'PPTX to PNG', description: 'Convert PowerPoint slides to PNG.',
    category: 'presentation', searchTerms: ['pptx to png'],
    acceptedFormats: ['pptx', 'ppt'], outputFormats: ['png'],
    seo: { title: 'PPTX to PNG Online Free', description: 'Convert PPTX to PNG online free with DocBit.', keywords: ['pptx to png'] },
  }),
  soon({
    id: 'pptx-to-jpg', slug: 'pptx-to-jpg', name: 'PPTX to JPG', description: 'Convert PowerPoint slides to JPG.',
    category: 'presentation', searchTerms: ['pptx to jpg'],
    acceptedFormats: ['pptx', 'ppt'], outputFormats: ['jpg'],
    seo: { title: 'PPTX to JPG Online Free', description: 'Convert PPTX to JPG online free with DocBit.', keywords: ['pptx to jpg'] },
  }),
];

export const TOOL_MAP: Record<string, ToolDefinition> = Object.fromEntries(
  TOOL_REGISTRY.map((t) => [t.slug, t])
);

export const getToolBySlug = (slug: string): ToolDefinition | undefined => TOOL_MAP[slug];

export const getActiveTools = (): ToolDefinition[] => TOOL_REGISTRY.filter((t) => !t.comingSoon);

export const getComingSoonTools = (): ToolDefinition[] => TOOL_REGISTRY.filter((t) => t.comingSoon);

export const getPopularTools = (): ToolDefinition[] => TOOL_REGISTRY.filter((t) => t.isPopular && !t.comingSoon);

export const getNewTools = (): ToolDefinition[] => TOOL_REGISTRY.filter((t) => t.isNew && !t.comingSoon);

export const getToolsByCategory = (category: string): ToolDefinition[] =>
  TOOL_REGISTRY.filter((t) => t.category === category && !t.comingSoon);

export const searchTools = (query: string): ToolDefinition[] => {
  const q = query.toLowerCase().trim();
  const base = !q ? TOOL_REGISTRY : TOOL_REGISTRY.filter((t) => {
    const haystack = [t.name, t.description, t.category, ...(t.searchTerms || []), ...t.seo.keywords]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
  return base.sort((a, b) => {
    if (a.comingSoon && !b.comingSoon) return 1;
    if (!a.comingSoon && b.comingSoon) return -1;
    return 0;
  });
};
