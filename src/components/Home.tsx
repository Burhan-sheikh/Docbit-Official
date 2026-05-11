import React from 'react';
import { motion, Variants } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Zap,
  ArrowRight, 
  Globe,
  UploadCloud,
  FileCheck,
  Image as ImageIcon,
  MousePointer2,
  HardDrive,
  Users,
  Briefcase,
  GraduationCap,
  Layers,
  Link as LinkIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
import { cn } from '../lib/utils';
import { SEO } from './SEO';
import { SEO_CONFIG } from '../seo/seoConfig';
import { 
  getSoftwareAppSchema, 
  getBreadcrumbSchema,
  getWebSiteSchema
} from '../seo/structuredData';
import { APP_DOMAIN } from '../seo/seoConfig';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "circOut" }
  }
};

export function Home() {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('https://docbit.in/');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { 
      name: 'Twitter', 
      icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, 
      href: 'https://twitter.com/intent/tweet?url=https://docbit.in/&text=Check%20out%20DocBit%20for%20fast,%20private%20PDF%20tools!',
      color: 'bg-white text-black hover:bg-neutral-200'
    },
    { 
      name: 'WhatsApp', 
      icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821/0 00-3.48-8.413z"/></svg>, 
      href: 'https://wa.me/?text=Check%20out%20DocBit%20for%20fast,%20private%20PDF%20tools!%20https://docbit.in/',
      color: 'bg-[#25D366] text-white hover:brightness-110'
    },
    { 
      name: 'Facebook', 
      icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, 
      href: 'https://www.facebook.com/sharer/sharer.php?u=https://docbit.in/',
      color: 'bg-[#1877F2] text-white hover:brightness-110'
    },
    { 
      name: 'Reddit', 
      icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.04.21.06.425.06.643 0 2.734-3.11 4.95-6.953 4.95s-6.954-2.216-6.954-4.95c0-.214.02-.424.056-.633a1.737 1.737 0 0 1-1.048-1.591c0-.962.776-1.742 1.738-1.742.476 0 .91.196 1.217.514 1.192-.839 2.827-1.396 4.63-1.477l.933-4.39a.127.127 0 0 1 .118-.088c.01 0 .02.001.03.003l2.846.618a1.248 1.248 0 0 1 1.25-1.25zm-8.86 7.74a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1zm6.544 0a1.045 1.045 0 1 0 0 2.1 1.045 1.045 0 0 0 0-2.1zm-1.88 4.288a.25.25 0 0 0-.25.249l.001.002c0 .01.002.02.007.03a4.015 4.015 0 0 1-3.666 0 .25.25 0 1 0-.214.453 4.542 4.542 0 0 0 4.1.008l.019-.009c.123-.016.208-.13.192-.253a.251.251 0 0 0-.189-.23z"/></svg>, 
      href: 'https://www.reddit.com/submit?url=https://docbit.in/&title=Fast,%20Private%20PDF%20Tools%20-%20DocBit',
      color: 'bg-[#FF4500] text-white hover:brightness-110'
    },
    { 
      name: 'Telegram', 
      icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.307.28-.595.28l.21-3.03 5.48-4.947c.238-.21-.054-.319-.342-.142l-6.76 4.237-2.933-.915c-.641-.194-.658-.641.135-.95l11.45-4.414c.53-.194.993.127.815.899z"/></svg>, 
      href: 'https://t.me/share/url?url=https://docbit.in/&text=Check%20out%20DocBit%20for%20fast,%20private%20PDF%20tools!',
      color: 'bg-[#229ED9] text-white hover:brightness-110'
    },
  ];

  return (
    <div className="overflow-x-hidden">
      <SEO 
        {...SEO_CONFIG.home}
        schema={[
          getSoftwareAppSchema(SEO_CONFIG.home.description),
          getWebSiteSchema(),
          getBreadcrumbSchema([
            { name: 'Home', item: APP_DOMAIN }
          ])
        ]}
      />
      {/* ⬛ TOP HEAD (PC ONLY) */}
      <div className="hidden lg:flex items-center justify-between px-10 py-3 bg-[#2A3B3B] relative z-50 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
            Processing Thousands of Files Daily
          </span>
        </div>

        <div className="flex items-center gap-8">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Share</span>
          <div className="flex items-center gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Share on ${link.name}`}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 shadow-lg",
                  link.color
                )}
              >
                {link.icon}
              </a>
            ))}
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <button
              onClick={copyToClipboard}
              title="Copy Link"
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 border shadow-lg",
                copied 
                  ? "bg-green-500 text-white border-green-500" 
                  : "bg-neutral-800 text-white border-white/5 hover:border-white/20"
              )}
            >
              {copied ? <div className="text-[8px] font-bold">Copied</div> : <LinkIcon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-600/5" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] dark:bg-purple-600/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-20 md:space-y-20 lg:-mt-4">
        {/* 🟦 HERO SECTION */}
        <section className="text-center bg-[#A6C6C6] dark:bg-[#2A3B3B] rounded-[48px] py-10 px-6 md:px-12 relative overflow-hidden shadow-2xl shadow-black/5">
          {/* Subtle noise or texture could go here if needed, but keeping it clean per brand style */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 text-neutral-900 dark:text-white text-xs font-black uppercase tracking-widest mb-10"
          >
            <ShieldCheck className="w-4 h-4" />
            Your Files Stay Private
          </motion.div>

          <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
            <motion.h1 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-neutral-900 dark:text-white"
>
  <span className="text-white dark:text-blue-400 italic drop-shadow-sm">
    Fast. <br />
    Secure. <br />
    On Your Device.
  </span>
</motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs lg:text-xl text-neutral-800/80 dark:text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Convert, merge, split, and extract PDFs directly in your browser. <br className="hidden md:block" />
              Your files are processed on your device — <span className="text-neutral-900 dark:text-white font-bold underline decoration-white/50 underline-offset-4">not on external servers.</span>
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex flex-col items-center gap-4 mt-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/tools/image-to-pdf"
                className="px-8 py-5 bg-neutral-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-black/10 active:scale-95 transition-all text-sm tracking-widest uppercase flex items-center gap-2 group"
              >
                Start with Image to PDF
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/tools/merge-pdf"
                className="px-8 py-5 bg-white/40 dark:bg-neutral-800 border border-white/40 dark:border-neutral-700 text-neutral-900 dark:text-white font-black rounded-2xl hover:bg-white/60 dark:hover:bg-neutral-700 active:scale-95 transition-all text-sm tracking-widest uppercase"
              >
                Merge PDF
              </Link>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-800/60 dark:text-neutral-400">
              No server uploads
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 pt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-neutral-800/60 dark:text-neutral-400"
          >
            <span className="flex items-center gap-2 border-r border-black/10 dark:border-white/10 pr-8">No server uploads</span>
          
            <span className="flex items-center gap-2">Instant processing</span>
          </motion.div>
        </section>






        {/* 🟪 VISUAL MESSAGE */}
        <section className="py-12 border-y border-neutral-100 dark:border-neutral-900">
           <p className="text-center text-4xl md:text-6xl font-black text-neutral-200 dark:text-neutral-800 uppercase italic tracking-tighter leading-none select-none">
             Your device does the work — <span className="text-blue-600/20 dark:text-blue-500/10">not a remote server.</span>
           </p>
        </section>

        {/* 🟫 SEO CONTENT */}
        <section className="max-w-4xl mx-auto text-center space-y-8">
           <h2 className="text-2xl font-black uppercase italic tracking-tight text-neutral-400">All-in-One PDF Tools Online</h2>
           <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-[2] tracking-wide">
             DocBit provides essential PDF tools in one place, including image to PDF conversion, PDF merging, splitting, and PDF to image extraction. Everything runs locally in your browser, offering fast performance and complete control over your files without relying on external servers.
           </p>
        </section>




{/* 🟨 HOW IT WORKS */}
        <section className="space-y-20 py-12">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            {[
              { icon: <UploadCloud className="w-10 h-10" />, title: "1. Select your files", desc: "Pick documents from your local storage." },
              { icon: <Zap className="w-10 h-10" />, title: "2. Process locally", desc: "Fast browser engine works directly on your device." },
              { icon: <FileCheck className="w-10 h-10" />, title: "3. Download instantly", desc: "No wait times, no queues, just your file." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-8 group">
                <div className="w-24 h-24 rounded-[32px] bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {step.icon}
                </div>
                <div className="space-y-3">
                  <h5 className="text-xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white">{step.title}</h5>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed uppercase tracking-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>






                    {/* 🟨 COMPARISON */}
        <section className="space-y-12">
          <h2 className="text-center text-4xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white">A Better Way to Handle PDFs</h2>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] overflow-hidden shadow-2xl shadow-black/5">
            <div className="grid grid-cols-2">
              <div className="p-10 border-r border-neutral-100 dark:border-neutral-800 space-y-8 bg-blue-50/50 dark:bg-blue-900/5">
                <h3 className="text-3xl font-black text-blue-600 uppercase tracking-tighter italic">DocBit</h3>
                <ul className="space-y-6">
                  {['Free & Advanced', 'Local processing', 'Immediate results'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-black uppercase text-neutral-900 dark:text-neutral-300">
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-2.5 h-2.5 text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-10 space-y-8">
                <h3 className="text-3xl font-black text-neutral-400 uppercase tracking-tighter italic">Legacy</h3>
                <ul className="space-y-6">
                  {['Paid features', 'Server-based', 'Slower workflow'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-black uppercase text-neutral-400">
                      <div className="w-4 h-4 border-2 border-neutral-200 dark:border-neutral-800 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

       

       

        {/* 🟥 WHY DOCBIT & TRUST SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <section className="bg-neutral-950 rounded-[48px] p-12 space-y-12 isolate relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
             <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-tight">
                  Built for Privacy <br />
                  <span className="text-blue-500">and Speed</span>
                </h2>
             </div>
             
             <div className="space-y-6">
                {[
                  { icon: <ShieldCheck className="w-5 h-5" />, title: "Files are handled locally in your browser" },
                  { icon: <Zap className="w-5 h-5" />, title: "No account or setup required" },
                  { icon: <Layers className="w-5 h-5" />, title: "Fast processing with no server delay" }
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

           <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[48px] p-12 flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white leading-tight">Private by Design</h2>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                  Your files are processed within your browser environment. <br />
                  <span className="text-neutral-900 dark:text-white font-bold underline decoration-blue-500 underline-offset-4">Nothing is stored, tracked, or shared.</span>
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                 <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Zero Server Footprint</span>
              </div>
           </section>
        </div>




         {/* 🟦 USE CASES */}
        <section className="space-y-16">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white mt-4">Made for Everyday Tasks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <GraduationCap className="w-6 h-6" />, title: "Students", desc: "Preparing assignments" },
              { icon: <Briefcase className="w-6 h-6" />, title: "Professionals", desc: "Managing documents" },
              { icon: <Users className="w-6 h-6" />, title: "Freelancers", desc: "Handling client files" },
              { icon: <HardDrive className="w-6 h-6" />, title: "Personal", desc: "File organization" }
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


        
       
     



         {/* 🟩 TOOL SECTION */}
        <section id="tools" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
  <div className="space-y-2">
    <h2 className="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase italic">
      Choose a Tool
    </h2>
    <p className="text-neutral-500 dark:text-neutral-400 font-medium">
      Convert, merge, split, and extract PDFs — all in one place, processed locally.
    </p>
  </div>
</div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {TOOLS.map((tool) => (
              <motion.div 
                key={tool.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer"
              >
                <Link 
                  to={tool.href}
                  className="block h-full p-8 rounded-[32px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="flex flex-col h-full justify-between gap-10">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                      {tool.icon}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase italic">{tool.name}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed uppercase tracking-tight">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>


        
      </div>
    </div>
  );
}