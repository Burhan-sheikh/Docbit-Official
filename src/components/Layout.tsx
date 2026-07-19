import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SearchView } from './SearchView';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import Offline from './Offline';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  activeToolName?: string;
  onReset?: () => void;
}

export function Layout({ children, activeToolName, onReset }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      if (isTyping) return;
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
        <div className="md:hidden">
          <Header
            activeToolName={activeToolName}
            onMenuClick={() => setIsSidebarOpen(true)}
            onReset={onReset}
            onSearchClick={() => setIsSearchOpen(true)}
          />
        </div>

        <main className="flex-1 overflow-y-auto relative">
          <div className="flex flex-col min-h-full">
            <div className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </div>
            <Footer variant={location.pathname.startsWith('/tools/') ? 'minimal' : 'full'} />
          </div>
        </main>

        <Offline />
      </div>

      <SearchView open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
