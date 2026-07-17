import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ProcessingMode = 'local' | 'cloud' | 'hybrid';

export type ToolCategory =
  | 'pdf'
  | 'images'
  | 'documents'
  | 'excel'
  | 'presentations'
  | 'text'
  | 'ocr'
  | 'compression'
  | 'conversion'
  | 'optimization'
  | 'security'
  | 'signing'
  | 'editing'
  | 'ai'
  | 'utilities'
  | 'archives'
  | 'business'
  | 'developer'
  | 'data';

export interface ToolFAQ {
  q: string;
  a: string;
}

export interface ToolStep {
  name: string;
  text: string;
}

export interface ToolSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  component: () => Promise<{ default: ComponentType }>;
  searchTerms?: string[];
  isPopular?: boolean;
  isNew?: boolean;
  comingSoon?: boolean;
  processingMode: ProcessingMode;
  supportsBatch: boolean;
  maxFiles: number;
  acceptedFormats: string[];
  outputFormats: string[];
  seo: ToolSEO;
  faqs?: ToolFAQ[];
  steps?: ToolStep[];
  longContent?: React.ReactNode;
}

export interface CategoryDefinition {
  id: ToolCategory;
  name: string;
  description: string;
  icon: LucideIcon;
}
