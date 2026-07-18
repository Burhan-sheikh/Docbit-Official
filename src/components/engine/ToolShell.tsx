import { type ReactNode } from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { SEO } from '../SEO';
import { ToolContent } from '../ToolContent';
import { NavigationConfirmModal } from '../NavigationConfirmModal';
import type { ToolDefinition } from '../../tools/registry.types';
import { SEO_CONFIG, APP_DOMAIN } from '../../seo/seoConfig';
import {
  getWebApplicationSchema,
  getBreadcrumbSchema,
  getHowToSchema,
} from '../../seo/structuredData';
import { getFAQSchema } from '../../utils/schema/faqSchema';

interface ToolShellProps {
  tool: ToolDefinition;
  children: ReactNode;
  isDirty: boolean;
  blocker: { state: string; proceed?: () => void; reset?: () => void };
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export function ToolShell({ tool, children, isDirty, blocker }: ToolShellProps) {
  const seoKey = toCamelCase(tool.id);
  const seoConfig = (SEO_CONFIG as Record<string, any>)[seoKey] || {
    title: tool.seo.title,
    description: tool.seo.description,
    keywords: tool.seo.keywords.join(', '),
    canonical: `${APP_DOMAIN}/tools/${tool.slug}`,
    ogImage: tool.seo.ogImage,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-40 px-4">
      <SEO
        title={seoConfig.title || tool.seo.title}
        description={seoConfig.description || tool.seo.description}
        canonical={seoConfig.canonical || `${APP_DOMAIN}/tools/${tool.slug}`}
        keywords={seoConfig.keywords}
        ogImage={seoConfig.ogImage}
        schema={[
          getWebApplicationSchema(
            tool.seo.title,
            tool.seo.description,
            seoConfig.canonical || `${APP_DOMAIN}/tools/${tool.slug}`
          ),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: tool.name, item: seoConfig.canonical || `${APP_DOMAIN}/tools/${tool.slug}` },
          ]),
          tool.faqs && tool.faqs.length > 0 ? getFAQSchema(tool.faqs) : null,
          tool.steps && tool.steps.length > 0
            ? getHowToSchema(tool.name, tool.description, tool.steps)
            : null,
        ].filter(Boolean)}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          Local Processing
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Cpu className="w-3.5 h-3.5" />
          {tool.processingMode === 'cloud' ? 'Cloud' : 'Browser'}
        </span>
      </div>

      {children}

      <ToolContent
        toolId={tool.id}
        toolName={tool.name}
        toolType={tool.category}
        description={tool.description}
        longContent={tool.longContent}
      />

      <NavigationConfirmModal
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
