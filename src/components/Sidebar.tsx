import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getActiveTools, getPopularTools, getToolsByCategory, TOOL_REGISTRY } from '../tools/registry';
import { CATEGORIES } from '../tools/categories';
import { CATEGORY_ICONS } from '../tools/registry';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { ShieldCheck, Moon, Sun, FileText, Shield, LogIn, ChevronDown, CircleUser as UserCircle, LogOut, Sparkles, X, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  onSelect?: () => void;
}

export function Sidebar({ onSelect }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
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

  const popularTools = getPopularTools().slice(0, 5);

  const handleLogout = async () => {
    await signOut();
    setProfileOpen(false);
    navigate('/');
    onSelect?.();
  };

  const goToProfile = () => {
    setProfileOpen(false);
    navigate('/all-tools');
    onSelect?.();
  };

  const goToLogin = () => {
    navigate('/login');
    onSelect?.();
  };

  const initials = (user?.email || 'U')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

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
          to="/all-tools"
          onClick={onSelect}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
            location.pathname === '/all-tools'
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          )}
        >
          <LayoutGrid className="w-5 h-5" />
          All Tools
        </Link>

        {/* Popular Tools */}
        <div className="py-2">
          <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800 my-2" />
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Popular
          </p>
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

        {/* Mega Menu Trigger */}
        <div className="py-2">
          <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800 my-2" />
          <button
            onClick={() => setMegaOpen(!megaOpen)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
              megaOpen
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            )}
            aria-expanded={megaOpen}
          >
            <span className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              Categories
            </span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", megaOpen && "rotate-180")} />
          </button>

          {megaOpen && (
            <div className="mt-2 space-y-4">
              {CATEGORIES.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.id];
                const tools = getToolsByCategory(cat.id);
                const totalInCat = TOOL_REGISTRY.filter((t) => t.category === cat.id).length;
                return (
                  <div key={cat.id} className="space-y-1">
                    <Link
                      to={cat.id === 'image' ? '/image-tools' : `/category/${cat.id}`}
                      onClick={onSelect}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <CatIcon className="w-4 h-4" />
                      {cat.name}
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        {totalInCat}
                      </span>
                    </Link>
                    <div className="ml-3 pl-3 border-l border-neutral-100 dark:border-neutral-800 space-y-0.5">
                      {tools.length > 0 ? (
                        tools.map((tool) => {
                          const href = `/tools/${tool.slug}`;
                          return (
                            <Link
                              key={tool.id}
                              to={href}
                              onClick={onSelect}
                              className={cn(
                                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                                location.pathname === href
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                              )}
                            >
                              <tool.icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{tool.name}</span>
                            </Link>
                          );
                        })
                      ) : (
                        <p className="px-2.5 py-1.5 text-[10px] text-neutral-400 italic">Coming soon</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        {session && user ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-2xl transition-all',
                profileOpen
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
              )}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xs font-black uppercase shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-black truncate text-neutral-900 dark:text-white">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[10px] text-neutral-400 font-bold truncate">
                  {user.email}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform shrink-0',
                  profileOpen && 'rotate-180'
                )}
              />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden z-10">
                <button
                  onClick={goToProfile}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <LayoutGrid className="w-4 h-4" />
                  All Tools
                </button>
                <div className="h-px bg-neutral-100 dark:bg-neutral-800" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={goToLogin}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <LogIn className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-black uppercase tracking-tight">Login</p>
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Sign in to sync</p>
            </div>
          </button>
        )}

        <div className="mt-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-3 flex flex-col gap-2">
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
