import { motion, AnimatePresence } from 'motion/react';
import { Loader as Loader2, CircleCheck as CheckCircle2, Circle as XCircle, Clock, Wand as Wand2, PackageCheck } from 'lucide-react';
import type { ProgressUpdate } from '../../engine/types';
import { cn } from '../../lib/utils';

type StageKey = 'processing' | 'finalizing' | 'completed';

const STAGE_META: Record<StageKey, { label: string; icon: typeof Wand2 }> = {
  processing: { label: 'Processing', icon: Wand2 },
  finalizing: { label: 'Finalizing', icon: PackageCheck },
  completed: { label: 'Completed', icon: CheckCircle2 },
};

const ORDER: StageKey[] = ['processing', 'finalizing', 'completed'];

function classifyStage(stage: string, percent: number): StageKey {
  const s = stage.toLowerCase();
  if (s.includes('complete') || percent >= 100) return 'completed';
  if (s.includes('final') || s.includes('finish') || s.includes('done')) return 'finalizing';
  return 'processing';
}

export function ProgressBar({ progress }: { progress: ProgressUpdate | null }) {
  if (!progress) return null;
  const stageKey = classifyStage(progress.stage, progress.percent);
  const currentIdx = ORDER.indexOf(stageKey);
  const meta = STAGE_META[stageKey];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
          {meta.label}
        </span>
        <span className="text-[10px] font-black text-blue-600">{progress.percent}%</span>
      </div>

      {/* Linear bar */}
      <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          className="h-full bg-blue-600 transition-all duration-300"
        />
      </div>

      {/* 3-stage stepper aligned to bar */}
      <div className="flex items-center">
        {ORDER.map((key) => {
          const Icon = STAGE_META[key].icon;
          const idx = ORDER.indexOf(key);
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={key} className="flex items-center flex-1 last:flex-none">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 shrink-0',
                  done && 'bg-blue-600 text-white',
                  active && 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 ring-2 ring-blue-500/40',
                  !done && !active && 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600'
                )}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : active ? (
                  <Icon className="w-4 h-4 animate-pulse" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              {idx < ORDER.length - 1 && (
                <div className="relative h-0.5 flex-1 mx-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full transition-all duration-300',
                      idx < currentIdx ? 'bg-blue-600 w-full' : idx === currentIdx ? 'bg-blue-600' : 'bg-transparent w-0'
                    )}
                    style={idx === currentIdx ? { width: `${progress.percent % 100}%` } : undefined}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {progress.message && (
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
          {progress.message}
        </p>
      )}
    </div>
  );
}

export function ProcessingStatus({
  isProcessing,
  progress,
  elapsedMs,
  error,
  onCancel,
}: {
  isProcessing: boolean;
  progress: ProgressUpdate | null;
  elapsedMs: number;
  error: string | null;
  onCancel?: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">
              Processing
            </span>
            {onCancel && (
              <button
                onClick={onCancel}
                className="ml-auto text-[10px] font-black uppercase text-red-500 hover:text-red-600 tracking-widest"
              >
                Cancel
              </button>
            )}
          </div>
          <ProgressBar progress={progress} />
        </motion.div>
      )}
      {!isProcessing && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl"
        >
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-black uppercase text-red-600 tracking-tight">Processing Error</p>
            <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
          </div>
        </motion.div>
      )}
      {!isProcessing && !error && elapsedMs > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-green-600 tracking-widest"
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed in {(elapsedMs / 1000).toFixed(2)}s
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function QueueProgress({ progress }: { progress: ProgressUpdate | null }) {
  if (!progress) return null;
  const remaining = progress.total - progress.current;
  return (
    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-neutral-400 tracking-widest">
      <Clock className="w-3 h-3" />
      {remaining > 0 ? `${remaining} remaining` : 'All queued'}
    </div>
  );
}
