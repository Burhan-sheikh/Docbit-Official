import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Instagram } from 'lucide-react';
import { cn } from '../lib/utils';
import { getPopularTools } from '../tools/registry';

interface FooterProps {
  variant?: 'full' | 'minimal';
}

export default function Footer({ variant = 'full' }: FooterProps) {
  const isMinimal = variant === 'minimal';

  return (
    <footer className={cn(
      "w-full border-t border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black",
      isMinimal ? "pt-8 pb-28 md:py-8" : "pt-24 pb-28 md:pb-12"
    )}>
      <div className="px-6 md:px-10 lg:px-12 w-full">
        {!isMinimal && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link to="/" className="flex items-center group">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-3xl font-black tracking-tighter">
                      <span className="text-neutral-900 dark:text-white">Doc</span>
                      <span className="text-blue-600">Bit</span>
                      <span className="text-blue-600 ml-0.5 group-hover:animate-bounce transition-all">.</span>
                    </span>
                  </div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] text-neutral-400 mt-1 dark:text-neutral-500">
                    PDF Engine
                  </p>
                </div>
              </Link>
              <p className="text-neutral-500 font-medium max-w-sm leading-relaxed">
                The privacy-first PDF utility suite. High-performance document processing that happens entirely on your device, not on our servers.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/docbit.app/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-pink-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tools</h4>
              <ul className="space-y-4">
                {getPopularTools().map((tool) => (
                  <li key={tool.id}><Link to={`/tools/${tool.slug}`} className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors">{tool.name}</Link></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Legal & Transparency</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors">Mission</Link></li>
                <li><Link to="/contact" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        )}

        <div className={cn(
          "flex flex-col md:flex-row items-center justify-between gap-6",
          !isMinimal && "pt-8 border-t border-neutral-100 dark:border-neutral-900"
        )}>
          <div className="flex items-center gap-4 order-2 md:order-1">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tight">© 2026 DocBit</span>
            <div className="w-1 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full uppercase tracking-tighter">
              <ShieldCheck className="w-3 h-3" />
              Your files never leave your device.
            </div>
          </div>
          
          <div className="flex items-center gap-6 order-1 md:order-2">
            {isMinimal ? (
              <>
                <Link to="/about" className="text-[10px] font-black uppercase text-neutral-400 hover:text-blue-600 transition-colors tracking-widest">About</Link>
                <Link to="/privacy" className="text-[10px] font-black uppercase text-neutral-400 hover:text-blue-600 transition-colors tracking-widest">Privacy</Link>
                <Link to="/contact" className="text-[10px] font-black uppercase text-neutral-400 hover:text-blue-600 transition-colors tracking-widest">Contact</Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
