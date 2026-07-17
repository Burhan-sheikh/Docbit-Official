import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthShell({ title, subtitle, children, footer, className }: AuthShellProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-neutral-50 dark:bg-black">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-600/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-600/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[40px] shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden',
          className
        )}
      >
        <div className="p-8 md:p-10 space-y-8">
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-1">
              <span className="text-2xl font-black tracking-tighter">
                <span className="text-neutral-900 dark:text-white">Doc</span>
                <span className="text-blue-600">Bit</span>
                <span className="text-blue-600">.</span>
              </span>
            </Link>
            <h1 className="text-2xl font-black tracking-tight dark:text-white uppercase italic">{title}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{subtitle}</p>
          </div>

          {children}
        </div>

        {footer && (
          <div className="px-8 md:px-10 py-6 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 text-center">
            {footer}
          </div>
        )}

        <div className="bg-neutral-950 p-3 flex items-center justify-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-[0.2em] italic">
          <ShieldCheck className="w-3 h-3 text-blue-500" />
          Private by Design
        </div>
      </motion.div>
    </div>
  );
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthInput({ label, className, ...props }: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block">{label}</label>
      <input
        className={cn(
          'w-full px-4 py-3.5 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm font-bold text-neutral-900 dark:text-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none',
          className
        )}
        {...props}
      />
    </div>
  );
}

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function AuthButton({ loading, children, className, disabled, ...props }: AuthButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50 disabled:grayscale',
        className
      )}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

export function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-black rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">or</span>
      <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
      {message}
    </div>
  );
}
