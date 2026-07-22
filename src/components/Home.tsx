import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, Variants } from 'motion/react';
import { ShieldCheck, Zap, Search, X, Sparkles, Heart, Clock, TrendingUp, Layers, Lock, CloudUpload as UploadCloud, FileCheck, HardDrive, Users, Briefcase, GraduationCap, FileImage, FileText, FileType, FileSpreadsheet, Presentation, ArrowRight, CircleCheck as CheckCircle2, Cloud, Cpu, Smartphone, Gauge, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TOOL_REGISTRY,
  getActiveTools,
  getPopularTools,
  searchTools,
  getToolsByCategory,
  CATEGORY_ICONS,
} from '../tools/registry';
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

const QUICK_ACTIONS = [
  'Merge PDF',
  'Split PDF',
  'Compress PDF',
  'PDF to Word',
  'Word to PDF',
  'Image to PDF',
  'Compress Image',
  'Resize Image',
];

const TRUST_BADGES = [
  'No Watermark',
  'Fast Processing',
  'Browser First',
  'Privacy Focused',
];

const STATS = [
  { value: '100+', label: 'Professional Tools', icon: Layers },
  { value: 'Millions', label: 'Files Processed', icon: TrendingUp },
  { value: 'Fast', label: 'Browser Processing', icon: Zap },
  { value: 'Privacy', label: 'Files Never Stored', icon: Lock },
];

const WHY_FEATURES = [
  { icon: Cpu, title: 'Browser Processing', desc: 'All conversions run locally in your browser. No uploads, no waiting.' },
  { icon: ShieldCheck, title: 'Privacy First', desc: 'Files never leave your device. Zero server footprint by design.' },
  { icon: Zap, title: 'Fast Conversion', desc: 'Instant results powered by WebAssembly and web workers.' },
  { icon: Sparkles, title: 'Modern Interface', desc: 'A clean, intuitive UI built for speed and clarity.' },
  { icon: Smartphone, title: 'Cross Platform', desc: 'Works on desktop, tablet, and mobile — anywhere a browser runs.' },
  { icon: Gauge, title: 'High Quality Output', desc: 'Lossless conversions that preserve your file fidelity.' },
  { icon: Cloud, title: 'No Installation', desc: 'No downloads, no plugins. Open the page and start working.' },
];

const HOW_STEPS = [
  { icon: UploadCloud, title: 'Upload Files', desc: 'Drag & drop or pick files from your device.' },
  { icon: Layers, title: 'Choose Options', desc: 'Configure output settings in one click.' },
  { icon: FileCheck, title: 'Download Results', desc: 'Get your converted files instantly.' },
];

const UPLOAD_SIDEBAR_ITEMS = [
  { label: 'PDF', icon: FileText },
  { label: 'Images', icon: FileImage },
  { label: 'Documents', icon: FileType },
  { label: 'Excel', icon: FileSpreadsheet },
  { label: 'AI', icon: Sparkles },
  { label: 'Utilities', icon: Layers },
];

const FLOATING_FILE_ICONS = [
  { Icon: FileText, className: 'top-6 left-8', delay: 0 },
  { Icon: FileImage, className: 'top-12 right-10', delay: 0.4 },
  { Icon: FileType, className: 'bottom-14 left-12', delay: 0.8 },
  { Icon: FileSpreadsheet, className: 'bottom-8 right-14', delay: 1.2 },
  { Icon: Presentation, className: 'top-1/2 left-1/2', delay: 0.2 },
];

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
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

  const filteredTools = useMemo(() => {
    if (searchQuery) return searchTools(searchQuery);
    return getActiveTools();
  }, [searchQuery]);

  const popularTools = getPopularTools().slice(0, 12);
  const featuredTools = getPopularTools().slice(0, 6);
  const activeTools = getActiveTools();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredTools.length > 0) {
      navigate(`/tools/${filteredTools[0].slug}`);
    }
  };

  const handleQuickAction = (action: string) => {
    const results = searchTools(action);
    if (results.length > 0) {
      navigate(`/tools/${results[0].slug}`);
    }
  };

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

      {/* Soft gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-600/5" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-blue-400/10 rounded-full blur-[120px] dark:bg-blue-500/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 space-y-24">
        {/* ===================== HERO ===================== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <div className="space-y-8">
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Browser Processing
              <span className="text-blue-300 dark:text-blue-700">•</span>
              Secure
              <span className="text-blue-300 dark:text-blue-700">•</span>
              No Installation
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] text-neutral-900 dark:text-white"
            >
              Convert Any File Into a{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Usable Business Asset
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-neutral-600 dark:text-neutral-300 font-medium max-w-xl leading-relaxed"
            >
              100+ professional file tools to convert, compress, edit, merge, organize, and optimize your files. Fast, private, and browser-first.
            </motion.p>

            {/* Search bar */}
            <motion.form
              onSubmit={handleSearchSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              <div className={cn(
                'relative flex items-center bg-white dark:bg-neutral-900 rounded-2xl shadow-lg shadow-blue-500/5 border border-neutral-200 dark:border-neutral-800 transition-all',
                searchFocused ? 'ring-4 ring-blue-500/20 border-blue-400' : ''
              )}>
                <Search className="absolute left-5 w-5 h-5 text-neutral-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search 100+ tools...  e.g. Merge PDF, JPG to PDF, Compress Image"
                  className="w-full pl-14 pr-12 py-4 bg-transparent text-sm font-medium text-neutral-900 dark:text-white outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick action chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => handleQuickAction(action)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                      i < 4
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    )}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </motion.form>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-x-6 gap-y-2 pt-2"
            >
              {TRUST_BADGES.map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column - Upload card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <UploadCard />
          </motion.div>
        </section>

        {/* ===================== TRUST STATS ===================== */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.05 }}
                className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
              >
                <stat.icon className="w-6 h-6 text-blue-500 mb-4" />
                <div className="text-2xl lg:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================== POPULAR TOOLS ===================== */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Popular</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
                Most Used Tools
              </h2>
            </div>
            <Link
              to="/all-tools"
              className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
          >
            {popularTools.map((tool) => {
              const CatIcon = CATEGORY_ICONS[tool.category];
              const href = `/tools/${tool.slug}`;
              const isFav = favoriteIds.has(tool.id);
              return (
                <motion.div key={tool.id} variants={itemVariants} whileHover={{ y: -4 }} className="group relative">
                  {isFav && (
                    <div className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                  <Link
                    to={href}
                    className="block h-full p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <CatIcon className="w-6 h-6" />
                      </div>
                      {tool.isPopular && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest">
                          <Star className="w-2.5 h-2.5 fill-current" /> Popular
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black tracking-tight text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <span className="truncate">{tool.name}</span>
                      {tool.comingSoon && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0">
                          <Clock className="w-2 h-2" /> Soon
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed line-clamp-2 mb-3">
                      {tool.description}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      {tool.category}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="flex justify-center sm:hidden">
            <Link
              to="/all-tools"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ===================== BROWSE BY CATEGORY ===================== */}
        <section className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-600">Categories</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
              Browse by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {CATEGORIES.map((cat, i) => {
              const CatIcon = CATEGORY_ICONS[cat.id];
              const count = TOOL_REGISTRY.filter((t) => t.category === cat.id).length;
              const activeCount = getToolsByCategory(cat.id).length;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    to={`/category/${cat.id}`}
                    className="block p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <CatIcon className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-black text-neutral-400 bg-neutral-50 dark:bg-neutral-800 px-3 py-1 rounded-full">
                        {count} tools
                      </span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white mb-2">
                      {cat.name} Tools
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                      {cat.description}
                    </p>
                    {activeCount === 0 && (
                      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-amber-500">
                        Coming Soon
                      </p>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ===================== WHY DOCBIT ===================== */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">Why DocBit</span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
              Built for Modern Workflows
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {WHY_FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.04 }}
                className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black tracking-tight text-neutral-900 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">How It Works</span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
              Three Steps to Done
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900" />

            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center space-y-5"
              >
                <div className="relative inline-flex w-24 h-24 rounded-[32px] bg-white dark:bg-neutral-900 border-2 border-blue-100 dark:border-blue-900/40 items-center justify-center text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10 mx-auto">
                  <step.icon className="w-10 h-10" />
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                    {i + 1}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================== FEATURED TOOLS ===================== */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Featured</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
                Spotlight Tools
              </h2>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
            {featuredTools.map((tool, i) => {
              const CatIcon = CATEGORY_ICONS[tool.category];
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="snap-start shrink-0 w-[280px] sm:w-[340px]"
                >
                  <Link
                    to={`/tools/${tool.slug}`}
                    className="block p-8 rounded-3xl bg-gradient-to-br from-white to-blue-50/50 dark:from-neutral-900 dark:to-blue-900/10 border border-neutral-100 dark:border-neutral-800 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 h-full"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <CatIcon className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                        {tool.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed line-clamp-2 mb-5">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-blue-600">
                      Try Now <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ===================== CTA ===================== */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 to-blue-700 p-10 lg:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-white leading-tight">
                Ready to Convert Smarter?
              </h2>
              <p className="text-blue-100 font-medium text-lg">
                Join millions processing files privately in their browser. No account needed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/all-tools"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Explore Tools <ArrowRight className="w-4 h-4" />
                </Link>
                {!session && (
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all active:scale-95 text-sm uppercase tracking-widest border border-white/20"
                  >
                    Get Started Free
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

/* ===================== Upload Card ===================== */
function UploadCard() {
  const [activeItem, setActiveItem] = useState('PDF');
  const navigate = useNavigate();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') navigate('/tools/merge-pdf');
      else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) navigate('/tools/image-to-pdf');
      else navigate('/');
    }
  };

  return (
    <div className="relative rounded-[32px] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-2xl shadow-blue-500/10 overflow-hidden">
      {/* Soft gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/30 dark:from-blue-900/10 dark:to-transparent pointer-events-none" />

      <div className="relative grid grid-cols-[auto_1fr] min-h-[420px]">
        {/* Sidebar */}
        <div className="border-r border-neutral-100 dark:border-neutral-800 p-3 space-y-1">
          {UPLOAD_SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all w-full',
                activeItem === item.label
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main upload area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative flex flex-col items-center justify-center p-8 text-center"
        >
          {/* Floating icons */}
          {FLOATING_FILE_ICONS.map(({ Icon, className, delay }, i) => (
            <motion.div
              key={i}
              className={cn('absolute opacity-20 text-blue-500 dark:text-blue-400', className)}
              animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
            >
              <Icon className="w-8 h-8" />
            </motion.div>
          ))}

          {/* Empty state */}
          <div className="relative z-10 space-y-5">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mx-auto"
            >
              <UploadCloud className="w-10 h-10" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                Drop your files here
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-xs">
                Drag & drop or browse — files are processed privately in your browser.
              </p>
            </div>
            <Link
              to="/all-tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
            >
              Browse Tools <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Supported formats */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {[
                { Icon: FileText, label: 'PDF' },
                { Icon: FileImage, label: 'IMG' },
                { Icon: FileType, label: 'DOC' },
                { Icon: FileSpreadsheet, label: 'XLS' },
                { Icon: Presentation, label: 'PPT' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-neutral-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
