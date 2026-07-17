import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Search } from 'lucide-react';
import { SEO } from './SEO';
import { CATEGORY_MAP } from '../tools/categories';
import { getToolsByCategory, TOOL_REGISTRY } from '../tools/registry';
import { APP_DOMAIN, SITE_NAME } from '../seo/seoConfig';
import { getBreadcrumbSchema, getCollectionPageSchema } from '../seo/structuredData';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = CATEGORY_MAP[categoryId || ''];
  const tools = getToolsByCategory(categoryId || '');
  const comingSoonCount = TOOL_REGISTRY.filter((t) => t.category === categoryId && t.comingSoon).length;

  if (!category) {
    return <Navigate to="/404" replace />;
  }

  const canonical = `${APP_DOMAIN}/category/${category.id}`;
  const title = `${category.name} Tools Online Free | ${SITE_NAME}`;
  const description = `${category.description}. ${tools.length} free ${category.name.toLowerCase()} tools available on DocBit — all processed locally in your browser for maximum privacy.`;

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        keywords={`${category.name.toLowerCase()} tools, free ${category.name.toLowerCase()} converter, online ${category.name.toLowerCase()}`}
        schema={[
          getCollectionPageSchema(title, description, canonical),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: category.name, item: canonical },
          ]),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-12">
        <div className="space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            All Tools
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <category.icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic dark:text-white">
                {category.name} Tools
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
                {category.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-neutral-400">
            <span>{tools.length} Available</span>
            {comingSoonCount > 0 && <span>• {comingSoonCount} Coming Soon</span>}
          </div>
        </div>

        {tools.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase italic dark:text-white">No Tools Available Yet</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-sm mx-auto">
              We're building {category.name.toLowerCase()} tools. Check back soon!
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link
                  to={`/tools/${tool.slug}`}
                  className="block h-full p-8 rounded-[32px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="flex flex-col h-full justify-between gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                      <tool.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase italic">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed uppercase tracking-tight line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}
