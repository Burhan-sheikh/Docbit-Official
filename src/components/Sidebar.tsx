import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getActiveTools, getPopularTools } from '../tools/registry';
import { cn } from '../lib/utils';
import { ShieldCheck, Moon, Sun, FileText, Shield, Heart, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  onSelect?: () => void;
}

export function Sidebar({ onSelect }: SidebarProps) {
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const popularTools = getPopularTools();
  const allTools = getActiveTools();

  return (
    <aside className="w-72 h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-colors">
      <div className="p-6 flex items-center justify-between">
        <Link to="/" onClick={onSelect} className="flex items-center group">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-3xl font-black tracking-tighter">
                <span className="text-neutral-900 dark:text-white">Doc</span>
                <span className="text-blue-600">Bit</span>
                <span className="text-blue-600 ml-0.5 group-hover:animate-bounce transition-all">.</span>
              </span>
            </div>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-neutral-400 mt-1 dark:text-neutral-500">
              File Engine
            </p>
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          className="hidden md:flex p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        <Link
          to="/"
          onClick={onSelect}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
            location.pathname === '/'
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          )}
        >
          <FileText className="w-5 h-5" />
          All Tools
        </Link>

        <Link
          to="/dashboard"
          onClick={onSelect}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
            location.pathname === '/dashboard'
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        <div className="py-4">
          <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800 my-2" />
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">Popular</p>
          {popularTools.map((tool) => {
            const href = `/tools/${tool.slug}`;
            return (
              <Link
                key={tool.id}
                to={href}
                onClick={onSelect}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                  location.pathname === href
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                )}
              >
                <tool.icon className="w-5 h-5" />
                {tool.name}
              </Link>
            );
          })}
        </div>

        <div className="py-4">
          <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800 my-2" />
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">All Tools</p>
          {allTools.map((tool) => {
            const href = `/tools/${tool.slug}`;
            return (
              <Link
                key={tool.id}
                to={href}
                onClick={onSelect}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                  location.pathname === href
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                )}
              >
                <tool.icon className="w-5 h-5" />
                {tool.name}
              </Link>
            );
          })}
        </div>

        <div className="py-4">
          <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800 my-2" />
          <Link
            to="/privacy"
            onClick={onSelect}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
              location.pathname === '/privacy'
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            )}
          >
            <Shield className="w-5 h-5" />
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            onClick={onSelect}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
              location.pathname === '/terms'
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            )}
          >
            <FileText className="w-5 h-5" />
            Terms of Service
          </Link>
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-neutral-100 dark:border-neutral-800">
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Secure</span>
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            All processing happens locally in your browser. Your files never leave your device.
          </p>
        </div>
      </div>
    </aside>
  );
}
