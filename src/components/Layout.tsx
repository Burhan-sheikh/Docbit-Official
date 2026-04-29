import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'motion/react';
import { FileImage, Scissors, FileDown, Menu, Home as HomeIcon, FileStack } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeToolName?: string;
  onReset?: () => void;
}

export function Layout({ children, activeToolName, onReset }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Organize', icon: <FileStack className="w-5 h-5" />, href: '/tool/organize' },
    { label: 'Img ➔ PDF', icon: <FileImage className="w-5 h-5" />, href: '/tool/img-to-pdf' },
    { label: 'Split', icon: <Scissors className="w-5 h-5" />, href: '/tool/split' },
    { label: 'Compress', icon: <FileDown className="w-5 h-5" />, href: '/tool/compress' },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden font-sans text-neutral-900 dark:text-neutral-100">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar aria-label="Desktop Sidebar" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 md:hidden shadow-2xl"
            >
              <Sidebar onSelect={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header 
          activeToolName={activeToolName} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onReset={onReset}
        />
        
        <main className="flex-1 overflow-y-auto relative p-4 md:p-6 lg:p-8 pb-40 md:pb-6">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>

        {/* Bottom Navigation Bar - Mobile Only */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-18 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-2 pb-safe z-30">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1.5 h-full transition-all duration-200",
                location.pathname === item.href 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-neutral-500 dark:text-neutral-400 opacity-60 hover:opacity-100"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                location.pathname === item.href ? "bg-blue-50 dark:bg-blue-900/30" : ""
              )}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
