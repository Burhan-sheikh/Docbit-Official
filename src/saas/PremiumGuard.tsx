/**
 * Premium Guard Component — wraps tool routes that require a paid plan.
 * Shows an upgrade prompt instead of the tool when the user's plan is insufficient.
 * Currently all tools are free, so this is architecture-only.
 */
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPlan, type PlanId } from './plans';

interface PremiumGuardProps {
  requiredPlan: PlanId;
  children: ReactNode;
  toolName?: string;
}

const PLAN_RANK: PlanId[] = ['free', 'pro', 'team', 'enterprise'];

export function PremiumGuard({ requiredPlan, children, toolName }: PremiumGuardProps) {
  const { session } = useAuth();
  const userPlan: PlanId = 'free';
  const hasAccess = PLAN_RANK.indexOf(userPlan) >= PLAN_RANK.indexOf(requiredPlan);

  if (hasAccess) return <>{children}</>;

  const plan = getPlan(requiredPlan);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mx-auto">
        <Lock className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight uppercase italic dark:text-white">
          {toolName ? `${toolName} is a Premium Tool` : 'Premium Tool'}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Upgrade to {plan.name} to unlock this tool and {plan.limits.maxFileSizeMb === 0 ? 'unlimited' : plan.limits.maxFileSizeMb}MB files.
        </p>
      </div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors"
      >
        <Crown className="w-4 h-4" />
        Upgrade Now
      </Link>
      {!session && (
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <Link to="/login" className="text-blue-600">Sign in</Link> to manage your subscription
        </p>
      )}
    </div>
  );
}
