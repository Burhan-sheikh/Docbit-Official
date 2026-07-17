import React from 'react';
import { TOOL_REGISTRY } from '../tools/registry';

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

const CATEGORY_COMPAT: Record<string, ToolCategory> = {
  pdf: 'edit',
  images: 'convert',
  documents: 'convert',
  excel: 'convert',
  presentations: 'convert',
  text: 'convert',
  ocr: 'convert',
  compression: 'optimize',
  conversion: 'convert',
  optimization: 'optimize',
  security: 'optimize',
  signing: 'edit',
  editing: 'edit',
  ai: 'convert',
  utilities: 'convert',
  archives: 'convert',
  business: 'convert',
  developer: 'convert',
  data: 'convert',
};

export const TOOLS: PDFTool[] = TOOL_REGISTRY.filter((t) => !t.comingSoon).map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  seoTitle: t.seo.title,
  seoDescription: t.seo.description,
  keywords: t.seo.keywords,
  icon: React.createElement(t.icon, { className: 'w-6 h-6' }),
  category: CATEGORY_COMPAT[t.category] || 'convert',
  href: `/tools/${t.slug}`,
  faqs: t.faqs,
  steps: t.steps,
}));
