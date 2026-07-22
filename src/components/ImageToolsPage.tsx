import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  CloudUpload as UploadCloud,
  FileCheck,
  FileImage,
} from 'lucide-react';
import { SEO } from './SEO';
import { ImageToolGrid } from './ImageToolCard';
import { getToolsByCategory } from '../tools/registry';
import { APP_DOMAIN, SITE_NAME } from '../seo/seoConfig';
import { getCollectionPageSchema, getBreadcrumbSchema } from '../seo/structuredData';

const FEATURES = [
  { icon: ShieldCheck, title: '100% Secure', desc: 'All processing happens locally in your browser. Your images never leave your device.' },
  { icon: Zap, title: 'Fast Processing', desc: 'WebAssembly-powered engine delivers near-instant conversions with zero upload time.' },
  { icon: Sparkles, title: 'High Quality', desc: 'Lossless conversions that preserve full image fidelity, color depth, and resolution.' },
  { icon: Layers, title: 'Batch Support', desc: 'Convert up to 50 images at once with our powerful batch processing pipeline.' },
];

const HOW_STEPS = [
  { icon: UploadCloud, title: 'Upload', desc: 'Drag & drop or pick images from your device.' },
  { icon: Zap, title: 'Process', desc: 'Conversion runs instantly in your browser.' },
  { icon: FileCheck, title: 'Download', desc: 'Get your converted images immediately.' },
];

const FORMAT_BADGES = ['PNG', 'JPG', 'WebP', 'HEIC', 'GIF', 'BMP', 'TIFF'];

export default function ImageToolsPage() {
  const tools = getToolsByCategory('image');

  const title = `Image Tools Online Free | ${SITE_NAME}`;
  const description = `Convert, compress, and transform images with ${tools.length} free online image tools. Supports PNG, JPG, WebP, HEIC, GIF, BMP, and TIFF — all processed privately in your browser.`;
  const canonical = `${APP_DOMAIN}/image-tools`;

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        keywords="image tools, image converter, png to jpg, jpg to png, webp converter, heic to jpg, compress image, grayscale image, online image tools"
        schema={[
          getCollectionPageSchema(title, description, canonical),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN },
            { name: 'Image Tools', item: canonical },
          ]),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-20">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              All Tools
            </Link>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <FileImage className="w-4 h-4" />
              {tools.length} Free Image Tools
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] text-neutral-900 dark:text-white"
            >
              Image{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Tools
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-neutral-600 dark:text-neutral-300 font-medium max-w-xl leading-relaxed"
            >
              Convert, compress, and transform images between PNG, JPG, WebP, HEIC, GIF, BMP, and TIFF formats. Fast, private, and 100% browser-based.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {FORMAT_BADGES.map((fmt) => (
                <span
                  key={fmt}
                  className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-black uppercase tracking-widest"
                >
                  {fmt}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link
                to="/all-tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest"
              >
                Explore All Tools <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-[32px] bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-10 lg:p-14 overflow-hidden min-h-[360px] flex items-center justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[80px] -ml-32 -mb-32" />

              <div className="relative z-10 grid grid-cols-3 gap-4 lg:gap-6">
                {FORMAT_BADGES.map((fmt, i) => (
                  <motion.div
                    key={fmt}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-lg shadow-blue-500/10 flex items-center justify-center">
                      <FileImage className="w-7 h-7 lg:w-9 lg:h-9 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {fmt}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature cards */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.05 }}
                className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black tracking-tight text-neutral-900 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* All Image Tools */}
        <section className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileImage className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-600">All Tools</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
              All Image Tools
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              {tools.length} tools for converting, compressing, and transforming images.
            </p>
          </div>

          <ImageToolGrid tools={tools} />
        </section>

        {/* How It Works */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">How It Works</span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
              Three Steps to Done
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 relative">
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

        {/* Pricing / Upgrade banner */}
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
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all active:scale-95 text-sm uppercase tracking-widest border border-white/20"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
