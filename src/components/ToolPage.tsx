import { Suspense, lazy, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SEO } from './SEO';
import { getToolBySlug } from '../tools/registry';
import { APP_DOMAIN, SITE_NAME } from '../seo/seoConfig';
import {
  getWebApplicationSchema,
  getBreadcrumbSchema,
  getHowToSchema,
} from '../seo/structuredData';
import { getFAQSchema } from '../utils/schema/faqSchema';

export default function ToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const tool = getToolBySlug(toolSlug || '');

  const ToolComponent = useMemo(() => {
    if (!tool || tool.comingSoon) return null;
    return lazy(tool.component);
  }, [tool]);

  if (!tool) {
    return <Navigate to="/404" replace />;
  }

  if (tool.comingSoon || !ToolComponent) {
    const ComingSoon = lazy(() => import('./tools/ComingSoonTool'));
    return (
      <Suspense fallback={null}>
        <ComingSoon />
      </Suspense>
    );
  }

  const canonical = `${APP_DOMAIN}/tools/${tool.slug}`;
  const fullTitle = tool.seo.title.includes(SITE_NAME) ? tool.seo.title : `${tool.seo.title} | ${SITE_NAME}`;

  const schemas = [
    getWebApplicationSchema(fullTitle, tool.seo.description, canonical),
    getBreadcrumbSchema([
      { name: 'Home', item: APP_DOMAIN },
      { name: tool.name, item: canonical },
    ]),
    tool.faqs && tool.faqs.length > 0 ? getFAQSchema(tool.faqs) : null,
    tool.steps && tool.steps.length > 0
      ? getHowToSchema(tool.name, tool.description, tool.steps)
      : null,
  ].filter(Boolean);

  return (
    <>
      <SEO
        title={fullTitle}
        description={tool.seo.description}
        canonical={canonical}
        keywords={tool.seo.keywords.join(', ')}
        ogImage={tool.seo.ogImage}
        schema={schemas}
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-neutral-500 animate-pulse">Loading tool...</p>
            </div>
          </div>
        }
      >
        <ToolComponent />
      </Suspense>
    </>
  );
}
