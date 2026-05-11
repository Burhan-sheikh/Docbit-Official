import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      name: 'X',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'bg-black text-white hover:bg-neutral-800'
    },
    {
      name: 'WhatsApp',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      color: 'bg-[#25D366] text-white hover:bg-[#20bd5c]'
    },
    {
      name: 'Facebook',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-[#1877F2] text-white hover:bg-[#166fe5]'
    },
    {
      name: 'Reddit',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.04.21.06.425.06.643 0 2.734-3.11 4.95-6.953 4.95s-6.954-2.216-6.954-4.95c0-.214.02-.424.056-.633a1.737 1.737 0 0 1-1.048-1.591c0-.962.776-1.742 1.738-1.742.476 0 .91.196 1.217.514 1.192-.839 2.827-1.396 4.63-1.477l.933-4.39a.127.127 0 0 1 .118-.088c.01 0 .02.001.03.003l2.846.618a1.248 1.248 0 0 1 1.25-1.25zm-8.86 7.74a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1zm6.544 0a1.045 1.045 0 1 0 0 2.1 1.045 1.045 0 0 0 0-2.1zm-1.88 4.288a.25.25 0 0 0-.25.249l.001.002c0 .01.002.02.007.03a4.015 4.015 0 0 1-3.666 0 .25.25 0 1 0-.214.453 4.542 4.542 0 0 0 4.1.008l.019-.009c.123-.016.208-.13.192-.253a.251.251 0 0 0-.189-.23z"/></svg>,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      color: 'bg-[#FF4500] text-white hover:bg-[#e03d00]'
    },
    {
      name: 'Telegram',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.307.28-.595.28l.21-3.03 5.48-4.947c.238-.21-.054-.319-.342-.142l-6.76 4.237-2.933-.915c-.641-.194-.658-.641.135-.95l11.45-4.414c.53-.194.993.127.815.899z"/></svg>,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'bg-[#229ED9] text-white hover:bg-[#1e8ec3]'
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-[40px] shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black dark:text-white uppercase italic tracking-tight">Share Guide</h3>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Social Grid */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {platforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md group-hover:scale-110 group-hover:-rotate-3 active:scale-95",
                      platform.color
                    )}>
                      {platform.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {platform.name}
                    </span>
                  </a>
                ))}
              </div>

              {/* Copy Link Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block ml-1">
                  Direct Link
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Copy className="w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    readOnly 
                    value={url}
                    className="w-full pl-12 pr-12 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl text-xs font-bold text-neutral-500 dark:text-neutral-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className={cn(
                      "absolute inset-y-2 right-2 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95",
                      copied 
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                        : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-700 hover:border-blue-600 hover:text-blue-600"
                    )}
                  >
                    {copied ? (
                      <div className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Copied
                      </div>
                    ) : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Tip */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 text-center">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] leading-relaxed">
                Thank you for spreading the word about <br /> 
                <span className="text-blue-600 dark:text-blue-400">Private PDF Processing</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
