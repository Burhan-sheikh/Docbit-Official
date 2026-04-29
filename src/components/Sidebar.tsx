import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
import { cn } from '../lib/utils';
import { LayoutGrid, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  onSelect?: () => void;
}

export function Sidebar({ onSelect }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-72 h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-colors">
      <div className="p-6">
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
              PDF Engine
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        {TOOLS.map((tool) => (
          <Link
            key={tool.id}
            to={tool.href}
            onClick={onSelect}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
              location.pathname === tool.href
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            )}
          >
            <div className={cn(
              "transition-transform group-hover:scale-110",
              location.pathname === tool.href ? "text-blue-600 dark:text-blue-400" : "text-neutral-400"
            )}>
              {tool.icon}
            </div>
            {tool.name}
          </Link>
        ))}
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
