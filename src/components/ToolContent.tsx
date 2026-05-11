import React from 'react';
import { Shield, Zap, Lock, Cpu, Star, CheckCircle2, Globe, Database, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants/tools';

interface ToolContentProps {
  toolId: string;
  toolName: string;
  toolType: string;
  description: string;
  longContent?: React.ReactNode;
}

export const ToolContent: React.FC<ToolContentProps> = ({ toolId, toolName, toolType, description, longContent }) => {
  const otherTools = TOOLS.filter(t => t.id !== toolId);

  return (
    <div className="mt-24 max-w-5xl mx-auto space-y-32 pb-40 px-6 overflow-hidden">
      {/* 1. Integrated Professional SEO Content Section */}
      {longContent && (
        <section className="prose prose-neutral dark:prose-invert max-w-none 
          prose-h2:text-4xl prose-h2:font-black prose-h2:tracking-tight prose-h2:mb-8
          prose-h3:text-2xl prose-h3:font-black prose-h3:tracking-tight prose-h3:mt-16 prose-h3:mb-6
          prose-p:text-neutral-600 dark:prose-p:text-neutral-400 prose-p:leading-relaxed prose-p:text-lg
          prose-li:text-neutral-600 dark:prose-li:text-neutral-400"
        >
          {longContent}
        </section>
      )}

      {/* 2. Core Value Pillars */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-none uppercase italic">The DocBit Advantage for {toolName}</h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium text-lg max-w-2xl mx-auto italic uppercase">
            Security. Velocity. Sovereignty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Sovereign Privacy",
              desc: "Traditional tools are data silos. DocBit is a processing engine that executes entirely on your device, ensuring zero server-side exposure.",
              icon: <Lock className="w-10 h-10 text-blue-600" />
            },
            {
              title: "Hardware Velocity",
              desc: "Eliminate the upload-bottleneck. Our WebAssembly engine leverages your device's native CPU for near-instant processing.",
              icon: <Zap className="w-10 h-10 text-amber-500" />
            },
            {
              title: "Encrypted Workflow",
              desc: "All document manipulation happens in a transient memory stack. Once the browser session ends, no data remains.",
              icon: <Shield className="w-10 h-10 text-emerald-500" />
            }
          ].map((item, i) => (
            <div key={i} className="p-10 rounded-[40px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-2xl hover:shadow-black/5 transition-all group lg:hover:-translate-y-2">
              <div className="mb-8 transform group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-4 uppercase tracking-tighter italic">{item.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Tech Stack Deep Dive */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 ring-1 ring-neutral-200 dark:ring-neutral-800 rounded-[48px] overflow-hidden bg-white dark:bg-neutral-950 shadow-2xl shadow-black/5 items-stretch">
          <div className="md:col-span-7 p-12 lg:p-20 flex flex-col justify-center space-y-8 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800">
            <h3 className="text-4xl font-black text-neutral-900 dark:text-white leading-none uppercase italic tracking-tighter">Zero-Trust Architecture</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg leading-relaxed font-medium">
              DocBit represents a paradigm shift in document utility services. By utilizing the latest WebAssembly (WASM) binary format, we execute complex PDF manipulation algorithms with near-native performance—directly inside your browser. No files are ever uploaded, ensuring GDPR, HIPAA, and proprietary data compliance by design.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {['WASM Native', 'No Cloud Storage', 'On-Device Cache', 'Bit-Perfect Conversion'].map(tag => (
                <span key={tag} className="px-5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest">{tag}</span>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-5 bg-neutral-900 dark:bg-black p-12 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-8">
              <Cpu className="w-16 h-16 text-blue-500" />
              <div className="space-y-4">
                <h4 className="text-2xl font-black text-white leading-tight uppercase italic">Unlimited Performance</h4>
                <p className="text-neutral-400 font-medium text-sm leading-relaxed">
                  "By moving the compute-layer to the client, we eliminate server queues and subscription barriers. DocBit is built to be fast, free, and secure forever."
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-blue-500">
                <Globe className="w-4 h-4" />
                Edge Processing Enabled
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Professional Implementation */}
      <section className="bg-neutral-50 dark:bg-neutral-900 p-12 md:p-24 rounded-[64px] border border-neutral-100 dark:border-neutral-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-neutral-900 dark:text-white leading-none uppercase italic tracking-tighter">A Security First Workflow</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg leading-relaxed font-medium">
              Our {toolName} tool is designed for institutions where data privacy is non-negotiable. We've removed the primary attack vector of online tools: the server.
            </p>
            <div className="space-y-6">
              {[
                { title: "No Transient Storage", desc: "Files exist only in RAM during the active session.", icon: <Database /> },
                { title: "No Analytics Tracking", desc: "User documents are never parsed for keywords or advertising.", icon: <CheckCircle2 /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-blue-600 group-hover:text-blue-500 transition-colors shrink-0">
                    {React.cloneElement(item.icon as React.ReactElement, { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <h4 className="font-black text-neutral-900 dark:text-white text-sm uppercase tracking-widest mb-1 italic">{item.title}</h4>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
             <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full transform group-hover:scale-110 transition-transform duration-700" />
             <div className="relative bg-white dark:bg-neutral-800 p-10 rounded-[40px] shadow-3xl border border-neutral-100 dark:border-neutral-700">
                <Lock className="w-14 h-14 text-blue-600 mb-8" />
                <h4 className="text-2xl font-black text-neutral-900 dark:text-white mb-4 uppercase italic">End-to-End Local Integrity</h4>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-bold text-sm">
                  Document processing shouldn't require trust—it should require architecture that makes trust unnecessary. DocBit establishes a new standard for web-based document residency.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* 5. FAQs / About Tool Section */}
      <section className="space-y-16">
        <h2 className="text-4xl font-black text-neutral-900 dark:text-white text-center uppercase italic tracking-tighter">Technical FAQ & Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-6">
             <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase italic tracking-widest text-blue-600">Enterprise Compatibility</h3>
             <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
               DocBit's {toolType} operations are compatible with PDF 1.4 through 2.0 standards, maintaining layer integrity and vector path precision. Whether you are generating reports for internal review or final client deliverables, the structural fidelity is guaranteed.
             </p>
           </div>
           <div className="space-y-6">
             <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase italic tracking-widest text-blue-600">Resource Allocation</h3>
             <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
               The on-device engine dynamically allocates resources based on your system's available power. This allows for high-concurrency operations (processing multiple files) without the interface ever becoming unresponsive.
             </p>
           </div>
        </div>
      </section>

      {/* 6. Discover More Section */}
      <section className="space-y-16 border-t border-neutral-100 dark:border-neutral-800 pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-none uppercase italic">Discover More Tools</h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-lg uppercase italic">
              Professional utilities for every document need.
            </p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:gap-3 transition-all group">
            View All Tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherTools.map((tool) => (
            <Link 
              key={tool.id} 
              to={tool.href}
              className="p-8 rounded-[32px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-blue-500/30 group transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />
              <div className="mb-6 w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                {tool.icon}
              </div>
              <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight italic mb-2">{tool.name}</h3>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mb-6 line-clamp-2">
                {tool.description}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Launch <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
