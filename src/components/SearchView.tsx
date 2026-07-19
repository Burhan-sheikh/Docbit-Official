import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowLeft, ListFilter as Filter } from 'lucide-react';
import { TOOL_REGISTRY, getToolsByCategory, searchTools } from '../tools/registry';
import { CATEGORIES } from '../tools/categories';
import { CATEGORY_ICONS } from '../tools/registry';
import { cn } from '../lib/utils';
import { SEO } from './SEO';

interface SearchViewProps {
  open: boolean;
  onClose: () => void;
}

export function SearchView({ open, onClose }: SearchViewProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveCategory(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (query) return searchTools(query);
    if (activeCategory) return getToolsByCategory(activeCategory);
    return TOOL_REGISTRY.filter((t) => !t.comingSoon);
  }, [query, activeCategory]);

  if (!open) return null;

  const goToTool = (slug: string) => {
    onClose();
    navigate(`/tools/${slug}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-neutral-50 dark:bg-neutral-950 overflow-y-auto"
      >
        <SEO title="Search Tools | DocBit" description="Search DocBit's 50 file conversion tools." noindex />

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all shrink-0"
              aria-label="Close search"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 50 tools... (e.g. PNG to JPG, merge PDF)"
                className="w-full pl-12 pr-10 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-sm font-bold text-neutral-900 dark:text-white outline-none focus:ring-2 ring-blue-500/40 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-4 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-1.5 text-neutral-400 shrink-0 pr-1">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all',
                !activeCategory
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat.id];
              const count = TOOL_REGISTRY.filter((t) => t.category === cat.id && !t.comingSoon).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all',
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  )}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {cat.name}
                  <span className="text-[9px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
            {results.length} tool{results.length !== 1 ? 's' : ''} found
          </p>

          {results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-neutral-400 font-bold">No tools match your search.</p>
              <button
                onClick={() => { setQuery(''); setActiveCategory(null); }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {results.map((tool) => {
                const CatIcon = CATEGORY_ICONS[tool.category];
                return (
                  <motion.button
                    key={tool.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    onClick={() => goToTool(tool.slug)}
                    className="group text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                      <CatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-sm font-black tracking-tight text-neutral-900 dark:text-white mb-1 line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium line-clamp-2">
                      {tool.description}
                    </p>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
