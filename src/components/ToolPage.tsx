import { Suspense, lazy, useMemo, useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from './SEO';
import { getToolBySlug } from '../tools/registry';
import { APP_DOMAIN, SITE_NAME } from '../seo/seoConfig';
import {
  getWebApplicationSchema,
  getBreadcrumbSchema,
  getHowToSchema,
} from '../seo/structuredData';
import { getFAQSchema } from '../utils/schema/faqSchema';
import { useAuth } from '../hooks/useAuth';
import { toggleFavorite, getFavorites, recordToolUsage } from '../services/userDataService';
import { cn } from '../lib/utils';

export default function ToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const tool = getToolBySlug(toolSlug || '');
  const { session } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const ToolComponent = useMemo(() => {
    if (!tool || tool.comingSoon) return null;
    return lazy(tool.component);
  }, [tool]);

  useEffect(() => {
    if (!session || !tool) return;
    getFavorites().then((favs) => {
      setIsFavorite(favs.some((f) => f.tool_id === tool.id));
    });
    recordToolUsage(tool.id);
  }, [session, tool]);

  const handleFavorite = async () => {
    if (!session || !tool) return;
    const nowFav = await toggleFavorite(tool.id);
    setIsFavorite(nowFav);
  };

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

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          All Tools
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">
            <tool.icon className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {tool.name}
            </span>
          </div>

          {session && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className={cn(
                'p-2 rounded-full transition-all',
                isFavorite
                  ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-500'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-pink-500'
              )}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
            </motion.button>
          )}
        </div>
      </div>

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
