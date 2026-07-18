/**
 * Usage Quota Service — tracks daily conversion counts per user against plan limits.
 * Reads from conversion_history (server-side) and enforces limits client-side
 * before a conversion begins. For hard enforcement, mirror this in an Edge Function.
 */
import { supabase } from '../supabase/client';
import { getPlan, type PlanId } from './plans';

export interface UsageState {
  usedToday: number;
  dailyLimit: number;
  remaining: number;
  unlimited: boolean;
}

export async function getDailyUsage(userId: string, planId: PlanId): Promise<UsageState> {
  const plan = getPlan(planId);
  const unlimited = plan.limits.maxConversionsPerDay === 0;
  if (unlimited) {
    return { usedToday: 0, dailyLimit: 0, remaining: 0, unlimited: true };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('conversion_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString());

  if (error) {
    console.error('Usage quota check failed:', error.message);
    return { usedToday: 0, dailyLimit: plan.limits.maxConversionsPerDay, remaining: plan.limits.maxConversionsPerDay, unlimited: false };
  }

  const usedToday = count || 0;
  return {
    usedToday,
    dailyLimit: plan.limits.maxConversionsPerDay,
    remaining: Math.max(0, plan.limits.maxConversionsPerDay - usedToday),
    unlimited: false,
  };
}

export function canConvert(usage: UsageState): boolean {
  return usage.unlimited || usage.remaining > 0;
}
