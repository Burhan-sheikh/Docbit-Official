import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, Bell } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { getToolBySlug } from '../../tools/registry';
import { APP_DOMAIN } from '../../seo/seoConfig';
import { getWebApplicationSchema, getBreadcrumbSchema } from '../../seo/structuredData';

export default function ComingSoonTool() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const tool = getToolBySlug(toolSlug || '');

  const title = tool?.seo.title || tool?.name || 'Coming Soon';
  const description = tool?.seo.description || tool?.description || 'This tool is coming soon to DocBit.';
  const canonical = tool ? `${APP_DOMAIN}/tools/${tool.slug}` : APP_DOMAIN;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <SEO
        title={`${title} | DocBit`}
        description={description}
        canonical={canonical}
        noindex={true}
        schema={[
          getWebApplicationSchema(title, description, canonical),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: tool?.name || 'Tool', item: canonical },
          ]),
        ]}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-12 text-center space-y-8 shadow-xl shadow-black/5"
      >
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600 mx-auto">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight dark:text-white uppercase italic">{tool?.name || 'Coming Soon'}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-md mx-auto">
            {tool?.description || 'This tool is on the way. We are building it with the same privacy-first, on-device processing you expect from DocBit.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-widest w-fit mx-auto">
          <Bell className="w-3.5 h-3.5" />
          In Development
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Link>
      </motion.div>
    </div>
  );
}
