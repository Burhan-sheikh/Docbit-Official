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
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
import { cn } from '../lib/utils';

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
  return (
    <div className="overflow-x-hidden">
      {/* Advertisement Banner */}
      <div className="overflow-hidden border-b border-neutral-100 dark:border-neutral-900">

       {/* Small Ad Label */}
  <span className="absolute top-2 text-[10px] md:text-xs px-2 py-0.5 rounded bg-black/60 text-white tracking-wide">
    Advertisement
  </span>
        <a 
          href="https://www.amazon.in/s?k=scanner+and+printer&rh=p_n_g-101016755008111%3A207843966031%2Cp_123%3A233970%257C242668%257C308445%257C359121&s=review-rank&dc=&crid=ZKF17C1Q8UEW&qid=1778002784&rnid=91049095031&sprefix=scanner+and+%2Caps%2C419&ds=v1%3AgkW2eXYAtP5SCNuxFqiQvi2slUQAtB4xfYonl8AJaHM&linkCode=ll2&tag=clue4shop-21&linkId=50607adcf19e078cccdc2239c9dca979&ref_=as_li_ss_tl" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full"
        >
          <img 
            src="https://res.cloudinary.com/dlesei0kn/image/upload/v1778004247/TOp_rated_printers_bvenzf.jpg" 
            alt="Top Rated Printers and Scanners" 
            className="w-full h-auto md:max-h-[120px] object-cover md:object-center block transition-opacity hover:opacity-95"
          />
        </a>
      </div>

      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-600/5" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] dark:bg-purple-600/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-24 md:space-y-32">
        {/* 🟦 HERO SECTION */}
        <section className="text-center bg-[#A6C6C6] dark:bg-[#2A3B3B] rounded-[48px] py-20 px-6 md:px-12 relative overflow-hidden shadow-2xl shadow-black/5 -mt-8 lg:-mt-4">
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
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] text-neutral-900 dark:text-white"
            >
              Free PDF Tools <br />
              <span className="text-white dark:text-blue-400 italic drop-shadow-sm">Fast, Secure, and On Your Device</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-neutral-800/80 dark:text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Convert, merge, split, and extract PDFs directly in your browser. <br className="hidden md:block" />
              Your files are processed on your device — <span className="text-neutral-900 dark:text-white font-bold underline decoration-white/50 underline-offset-4">not on external servers.</span>
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex flex-col items-center gap-4 mt-12"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/tool/img-to-pdf"
                className="px-8 py-5 bg-neutral-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-black/10 active:scale-95 transition-all text-sm tracking-widest uppercase flex items-center gap-2 group"
              >
                Start with Image to PDF
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/tool/merge"
                className="px-8 py-5 bg-white/40 dark:bg-neutral-800 border border-white/40 dark:border-neutral-700 text-neutral-900 dark:text-white font-black rounded-2xl hover:bg-white/60 dark:hover:bg-neutral-700 active:scale-95 transition-all text-sm tracking-widest uppercase"
              >
                Merge PDF
              </Link>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-800/60 dark:text-neutral-400 animate-pulse">
              No signup required
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 pt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-neutral-800/60 dark:text-neutral-400"
          >
            <span className="flex items-center gap-2 border-r border-black/10 dark:border-white/10 pr-8">No server uploads</span>
            <span className="flex items-center gap-2 border-r border-black/10 dark:border-white/10 pr-8">No signup</span>
            <span className="flex items-center gap-2">Instant processing</span>
          </motion.div>
        </section>

        {/* 🟩 TOOL SECTION */}
        <section id="tools" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase italic">Choose a Tool</h2>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium">Convert, merge, split, and extract PDFs — all in one place, processed locally.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping opacity-50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">READY TO PROCESS LOCALLY</span>
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

        {/* 🟨 HOW IT WORKS */}
        <section className="space-y-20 py-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase italic">Simple and Direct</h2>
            <p className="text-neutral-500 dark:text-neutral-400">The complexity happens under the hood. For you, it's 1-2-3.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            {[
              { icon: <UploadCloud className="w-10 h-10" />, title: "1. Select your files", desc: "Pick documents from your local storage." },
              { icon: <Zap className="w-10 h-10" />, title: "2. Process locally", desc: "WASM engine works directly in your browser." },
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

        {/* 🟦 USE CASES */}
        <section className="space-y-16">
          <h2 className="text-center text-4xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white">Made for Everyday Tasks</h2>
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

        {/* 🟨 COMPARISON */}
        <section className="space-y-12">
          <h2 className="text-center text-4xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white">A Better Way to Handle PDFs</h2>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] overflow-hidden shadow-2xl shadow-black/5">
            <div className="grid grid-cols-2">
              <div className="p-10 border-r border-neutral-100 dark:border-neutral-800 space-y-8 bg-blue-50/50 dark:bg-blue-900/5">
                <h3 className="text-3xl font-black text-blue-600 uppercase tracking-tighter italic">DocBit</h3>
                <ul className="space-y-6">
                  {['Everything free', 'Local processing', 'Immediate results'].map((item, i) => (
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
                <h3 className="text-3xl font-black text-neutral-400 uppercase tracking-tighter italic">Typical Tools</h3>
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

        {/* 🟥 FINAL CTA */}
        <section className="relative p-12 md:p-24 rounded-[64px] bg-blue-600 text-center space-y-10 overflow-hidden isolate shadow-2xl shadow-blue-500/20 px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent)]" />
          <div className="space-y-4 relative">
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-tight">
               Start working with <br className="hidden md:block" />
               your files.
             </h2>
            
          </div>
          <div className="relative">
            <Link 
              to="/tool/img-to-pdf"
              className="inline-block px-12 py-6 bg-white text-blue-600 font-black rounded-2xl shadow-2xl shadow-black/10 hover:scale-105 active:scale-95 transition-all text-sm tracking-widest uppercase italic"
            >
              Try Image to PDF
            </Link>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-200 relative">
           Create your PDF now
          </p>
        </section>
      </div>
    </div>
  );
}
