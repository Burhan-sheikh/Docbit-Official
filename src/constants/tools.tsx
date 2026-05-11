import { 
  Combine, 
  Scissors, 
  FileImage, 
  Images,
  Palette
} from 'lucide-react';
import React from 'react';

export type ToolCategory = 'edit' | 'convert' | 'optimize';

export interface PDFTool {
  id: string;
  name: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  icon: React.ReactNode;
  category: ToolCategory;
  href: string;
  faqs?: { q: string; a: string }[];
  steps?: { name: string; text: string }[];
}

export const TOOLS: PDFTool[] = [
  {
    id: 'img-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images into a single, high-quality PDF in seconds.',
    seoTitle: 'Image to PDF Converter Online Free (JPG, PNG) | DocBit',
    seoDescription:
      'Free image to PDF converter online. Convert JPG to PDF, PNG to PDF instantly with no upload. Fast, secure, and processed locally on your device.',
    keywords: [
      'image to pdf',
      'jpg to pdf',
      'png to pdf',
      'convert images to pdf free',
      'image to pdf online'
    ],
    faqs: [
      { q: 'Is DocBit Image to PDF converter free?', a: 'Yes, DocBit is 100% free with no hidden charges or premium subscriptions.' },
      { q: 'Are my images uploaded to any server?', a: 'No. DocBit uses advanced on-device processing. Your images are converted to PDF directly in your browser and never touch our servers.' },
      { q: 'Can I use this tool on my mobile phone?', a: 'Absolutely! DocBit is fully optimized for mobile browsers, making it easy to create PDFs from your phone gallery.' }
    ],
    steps: [
      { name: 'Upload Images', text: 'Select or drag and drop JPG, PNG, or other image files.' },
      { name: 'Arrange Files', text: 'Reorder your images if needed by dragging them.' },
      { name: 'Configure Metadata', text: 'Optionally add a title, author, or subject to your PDF.' },
      { name: 'Convert and Download', text: 'Click "Convert to PDF" and download your finished document.' }
    ],
    icon: <FileImage className="w-6 h-6" />,
    category: 'convert',
    href: '/tools/image-to-pdf',
  },

  {
    id: 'pdf-to-img',
    name: 'PDF to Image',
    description: 'Convert PDF pages into high-quality images for easy sharing.',
    seoTitle: 'Convert PDF to JPG or PNG Online Free | DocBit',
    seoDescription:
      'Free PDF to image converter online. Convert PDF to JPG or PNG instantly. Extract PDF pages as high-quality images with fast, private processing on your device.',
    keywords: [
      'pdf to jpg',
      'pdf to png',
      'pdf to image',
      'convert pdf to image free',
      'pdf to jpg online'
    ],
    faqs: [
      { q: 'Can I convert multiple PDF pages to images at once?', a: 'Yes, DocBit extracts every page from your PDF and allows you to download them all as high-quality images.' },
      { q: 'Is there a limit on file size?', a: 'Since processing is local, the only limit is your device\'s memory and processing power. We recommend files under 50MB for the best experience.' },
      { q: 'Do I need to sign up to use DocBit?', a: 'No signup or account is required. You can start converting PDFs to images immediately.' }
    ],
    steps: [
      { name: 'Upload PDF', text: 'Select the PDF file you want to convert into images.' },
      { name: 'Processing', text: 'DocBit will automatically extract each page as an image.' },
      { name: 'Select Format', text: 'Choose between PNG or JPG output format.' },
      { name: 'Download Images', text: 'Download individual pages or all images as a zip file.' }
    ],
    icon: <Images className="w-6 h-6" />,
    category: 'convert',
    href: '/tools/pdf-to-images',
  },

  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single, organized document.',
    seoTitle: 'Merge PDF Files Online Free (Fast & Private) | DocBit',
    seoDescription:
      'Merge PDF files online free. Combine multiple PDFs into one document instantly with no upload. Fast, secure, and processed locally on your device.',
    keywords: [
      'merge pdf',
      'combine pdf',
      'merge pdf online',
      'combine pdf files free',
      'pdf merger'
    ],
    faqs: [
      { q: 'How many PDF files can I merge at once?', a: 'You can merge as many PDF files as you need. DocBit handles multiple files efficiently right in your browser.' },
      { q: 'Is merging PDFs on DocBit secure?', a: 'Extremely secure. Since your files are never uploaded to a server, your sensitive data stays on your machine throughout the merging process.' },
      { q: 'Can I reorder files before merging?', a: 'Yes, you can easily drag and drop files to change their sequence before clicking merge.' }
    ],
    steps: [
      { name: 'Upload PDF Files', text: 'Select multiple PDF documents you wish to combine.' },
      { name: 'Arrange Order', text: 'Drag and drop files to set the preferred order.' },
      { name: 'Merge', text: 'Click the "Merge PDF" button to combine them.' },
      { name: 'Download', text: 'Save the new single PDF file to your device.' }
    ],
    icon: <Combine className="w-6 h-6" />,
    category: 'edit',
    href: '/tools/merge-pdf',
  },

  {
    id: 'split',
    name: 'Split PDF',
    description: 'Split a PDF into individual pages or extract only what you need.',
    seoTitle: 'Split PDF Online Free (Extract Pages Instantly) | DocBit',
    seoDescription:
      'Split PDF online free. Extract pages or separate PDF files instantly with no upload. Fast, secure, and processed entirely on your device.',
    keywords: [
      'split pdf',
      'extract pdf pages',
      'pdf splitter',
      'split pdf online free',
      'separate pdf pages'
    ],
    faqs: [
      { q: 'How do I extract a specific page range from a PDF?', a: 'Select the "Range" mode, enter the page numbers you want, and DocBit will generate a new PDF with just those pages.' },
      { q: 'Does splitting a PDF reduce its quality?', a: 'No, DocBit preserves the original quality of your pages during the splitting process.' },
      { q: 'Is it safe to split sensitive documents here?', a: 'Yes. Because all splitting happens locally in your browser, your document contents are never transmitted over the internet.' }
    ],
    steps: [
      { name: 'Upload PDF', text: 'Select the PDF file you want to split.' },
      { name: 'Choose Range', text: 'Select "All Pages" to split every page or "Range" to extract specific ones.' },
      { name: 'Split', text: 'Click "Split PDF" to process the file.' },
      { name: 'Download', text: 'Download your split files individually or as a single collection.' }
    ],
    icon: <Scissors className="w-6 h-6" />,
    category: 'edit',
    href: '/tools/split-pdf',
  },
  {
    id: 'grayscale-pdf',
    name: 'Grayscale PDF',
    description: 'Convert your color PDFs to grayscale or black and white for efficient printing.',
    seoTitle: 'Grayscale PDF Online Free (Black and White PDF) | DocBit',
    seoDescription:
      'Convert color PDF to grayscale or black and white online free. Optimize your PDF for printing while preserving quality. Fast, secure, and processed entirely in your browser.',
    keywords: [
      'grayscale pdf',
      'convert pdf to grayscale',
      'black and white pdf',
      'pdf to bw converter',
      'make pdf grayscale free'
    ],
    faqs: [
      { q: 'What is the difference between grayscale and black & white?', a: 'Grayscale uses different shades of gray to represent colors, while Black & White (Pure BW) uses only black and white pixels, which is best for high-contrast documents like text scans.' },
      { q: 'Does grayscale conversion reduce file size?', a: 'Often yes! Removing color data can significantly reduce the file size, especially for documents with many color images.' },
      { q: 'Is the conversion high quality?', a: 'Yes, DocBit preserves the text and image sharpness while converting colors to their equivalent luminence values.' }
    ],
    steps: [
      { name: 'Upload PDF', text: 'Select the color PDF you want to convert.' },
      { name: 'Choose Mode', text: 'Select "Grayscale" for shades of gray or "Pure B&W" for high contrast.' },
      { name: 'Optional Settings', text: 'Choose printer-friendly optimization for better ink efficiency.' },
      { name: 'Download', text: 'Download your converted grayscale PDF instantly.' }
    ],
    icon: <Palette className="w-6 h-6" />,
    category: 'optimize',
    href: '/tools/grayscale-pdf',
  },
];
