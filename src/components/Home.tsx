import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, Variants } from 'motion/react';
import { ShieldCheck, Zap, ArrowRight, Search, X, Sparkles, Heart, Clock, TrendingUp, Layers, Lock, CloudUpload as UploadCloud, FileCheck, HardDrive, Users, Briefcase, GraduationCap, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOOL_REGISTRY, getActiveTools, getPopularTools, searchTools, getToolsByCategory } from '../tools/registry';
import { CATEGORIES } from '../tools/categories';
import { cn } from '../lib/utils';
import { SEO } from './SEO';
import { SEO_CONFIG, APP_DOMAIN } from '../seo/seoConfig';
import {
  getSoftwareAppSchema,
  getBreadcrumbSchema,
  getWebSiteSchema,
} from '../seo/structuredData';
import { useAuth } from '../hooks/useAuth';
import { getFavorites } from '../services/userDataService';
import type { Favorite } from '../supabase/database.types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'circOut' } },
};

export function Home() {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;
    getFavorites().then((favs: Favorite[]) => {
      setFavoriteIds(new Set(favs.map((f) => f.tool_id)));
    });
  }, [session]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('https://docbit.in/');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTools = useMemo(() => {
    if (searchQuery) return searchTools(searchQuery);
    if (activeCategory) return getToolsByCategory(activeCategory);
    return getActiveTools();
  }, [searchQuery, activeCategory]);

  const popularTools = getPopularTools();
  const newTools = TOOL_REGISTRY.filter((t) => t.isNew && !t.comingSoon);
  const comingSoonTools = TOOL_REGISTRY.filter((t) => t.comingSoon);
  const activeTools = getActiveTools();

  const isFiltering = !!searchQuery || !!activeCategory;

  return (
    <div className="overflow-x-hidden">
      <SEO
        {...SEO_CONFIG.home}
        schema={[
          getSoftwareAppSchema(SEO_CONFIG.home.description),
          getWebSiteSchema(),
          getBreadcrumbSchema([{ name: 'Home', item: APP_DOMAIN }]),
        ]}
      />

      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-600/5" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-600/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-16">
        {/* HERO */}
        <section className="text-center bg-[#A6C6C6] dark:bg-[#2A3B3B] rounded-[48px] py-12 px-6 md:px-12 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 text-neutral-900 dark:text-white text-xs font-black uppercase tracking-widest mb-8"
          >
            <ShieldCheck className="w-4 h-4" />
            Your Files Stay Private
          </motion.div>

          <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white dark:text-blue-400 italic drop-shadow-sm"
            >
              Convert Any File. <br />
              Right In Your Browser.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm lg:text-lg text-neutral-800/80 dark:text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed mb-6"
            >
              {activeTools.length}+ tools to convert, merge, split, and transform your files —
              <span className="text-neutral-900 dark:text-white font-bold underline decoration-white/50 underline-offset-4"> all processed locally on your device.</span>
            </motion.p>
          </div>

          {/* SEARCH */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 max-w-2xl mx-auto"
          >
            <div className={cn(
              'relative flex items-center bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl transition-all',
              searchFocused ? 'ring-4 ring-blue-500/20' : ''
            )}>
              <Search className="absolute left-5 w-5 h-5 text-neutral-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search tools... (Cmd+K)"
                className="w-full pl-14 pr-12 py-4 bg-transparent text-sm font-bold text-neutral-900 dark:text-white outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </section>

        {/* CATEGORIES */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic dark:text-white">Categories</h2>
            {activeCategory && (
              <button onClick={() => setActiveCategory(null)} className="text-xs font-black uppercase text-blue-600 flex items-center gap-1">
                <X className="w-3 h-3" /> Clear Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => {
              const count = getToolsByCategory(cat.id).length;
              if (count === 0 && !TOOL_REGISTRY.some((t) => t.category === cat.id && t.comingSoon)) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all',
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-100 dark:border-neutral-800'
                  )}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                  <span className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-full',
                    activeCategory === cat.id ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800'
                  )}>{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* FILTERED RESULTS */}
        {isFiltering ? (
          <section className="space-y-6">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
              {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
            </p>
            <ToolGrid tools={filteredTools} favoriteIds={favoriteIds} />
          </section>
        ) : (
          <>
            {/* POPULAR */}
            {popularTools.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic dark:text-white">Popular Tools</h2>
                </div>
                <ToolGrid tools={popularTools} favoriteIds={favoriteIds} />
              </section>
            )}

            {/* NEW */}
            {newTools.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic dark:text-white">New Tools</h2>
                </div>
                <ToolGrid tools={newTools} favoriteIds={favoriteIds} />
              </section>
            )}

            {/* ALL TOOLS */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-blue-600" />
                <h2 className="text-2xl font-black tracking-tighter uppercase italic dark:text-white">All Tools</h2>
              </div>
              <ToolGrid tools={activeTools} favoriteIds={favoriteIds} />
            </section>

            {/* COMING SOON */}
            {comingSoonTools.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic dark:text-white">Coming Soon</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {comingSoonTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="group p-8 rounded-[32px] bg-neutral-50 dark:bg-neutral-900/50 border border-dashed border-neutral-200 dark:border-neutral-800 opacity-70"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-6">
                        <tool.icon className="w-7 h-7" />
                      </div>
                      <h4 className="text-lg font-black tracking-tighter dark:text-white uppercase italic mb-2">{tool.name}</h4>
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-tight">{tool.description}</p>
                      <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <Clock className="w-3 h-3" /> Soon
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* HOW IT WORKS */}
        <section className="space-y-12 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            {[
              { icon: <UploadCloud className="w-10 h-10" />, title: '1. Select your files', desc: 'Pick documents from your local storage.' },
              { icon: <Zap className="w-10 h-10" />, title: '2. Process locally', desc: 'Fast browser engine works directly on your device.' },
              { icon: <FileCheck className="w-10 h-10" />, title: '3. Download instantly', desc: 'No wait times, no queues, just your file.' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-24 h-24 rounded-[32px] bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {step.icon}
                </div>
                <div className="space-y-3">
                  <h5 className="text-xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white">{step.title}</h5>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed uppercase tracking-tight">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY DOCBIT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-neutral-950 rounded-[48px] p-12 space-y-8 isolate relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-tight">
              Built for Privacy <br />
              <span className="text-blue-500">and Speed</span>
            </h2>
            <div className="space-y-4">
              {[
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'Files are handled locally in your browser' },
                { icon: <Zap className="w-5 h-5" />, title: 'No account or setup required' },
                { icon: <Layers className="w-5 h-5" />, title: 'Fast processing with no server delay' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <p className="text-sm font-black uppercase text-neutral-400 tracking-tight">{item.title}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[48px] p-12 flex flex-col justify-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white leading-tight">Private by Design</h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              Your files are processed within your browser environment.{' '}
              <span className="text-neutral-900 dark:text-white font-bold underline decoration-blue-500 underline-offset-4">Nothing is stored, tracked, or shared.</span>
            </p>
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Zero Server Footprint</span>
            </div>
          </section>
        </div>

        {/* USE CASES */}
        <section className="space-y-12">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white">Made for Everyday Tasks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <GraduationCap className="w-6 h-6" />, title: 'Students', desc: 'Preparing assignments' },
              { icon: <Briefcase className="w-6 h-6" />, title: 'Professionals', desc: 'Managing documents' },
              { icon: <Users className="w-6 h-6" />, title: 'Freelancers', desc: 'Handling client files' },
              { icon: <HardDrive className="w-6 h-6" />, title: 'Personal', desc: 'File organization' },
            ].map((use, i) => (
              <div key={i} className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-[32px] border border-neutral-100 dark:border-neutral-800 space-y-4 hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black flex items-center justify-center text-blue-600 shadow-sm">
                  {use.icon}
                </div>
                <div className="space-y-1">
                  <h6 className="font-black text-xs uppercase dark:text-white">{use.title}</h6>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">{use.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ToolGrid({ tools, favoriteIds }: { tools: typeof TOOL_REGISTRY; favoriteIds: Set<string> }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {tools.map((tool) => {
        const href = `/tools/${tool.slug}`;
        const isFav = favoriteIds.has(tool.id);
        return (
          <motion.div key={tool.id} variants={itemVariants} whileHover={{ scale: 1.02 }} className="group cursor-pointer relative">
            {isFav && (
              <div className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
            )}
            <Link
              to={href}
              className="block h-full p-8 rounded-[32px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="flex flex-col h-full justify-between gap-8">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                  <tool.icon className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase italic">{tool.name}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed uppercase tracking-tight line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
