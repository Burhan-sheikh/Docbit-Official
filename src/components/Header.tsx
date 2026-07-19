import React from 'react';
import { Menu, RotateCcw, ShieldCheck, Moon, Sun, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  activeToolName?: string;
  onMenuClick: () => void;
  onReset?: () => void;
  onSearchClick: () => void;
}

export function Header({ activeToolName, onMenuClick, onReset, onSearchClick }: HeaderProps) {
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

  return (
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link to="/" className="flex items-center gap-1.5 group shrink-0">
          <span className="text-2xl font-black tracking-tighter flex items-center">
            <span className="text-neutral-900 dark:text-white">Doc</span>
            <span className="text-blue-600">Bit</span>
            <span className="text-blue-600 ml-0.5 group-hover:animate-bounce">.</span>
          </span>
        </Link>

        {activeToolName && (
          <>
            <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-2 hidden sm:block" />
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hidden sm:block truncate">
              {activeToolName}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search trigger - opens full page search */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-xl text-xs font-bold transition-all"
          aria-label="Search tools"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search tools...</span>
          <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-400">
            /
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-900/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Local Processing
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
            title="Reset active tool"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
