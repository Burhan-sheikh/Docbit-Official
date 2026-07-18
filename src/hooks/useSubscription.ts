/**
 * Subscription Middleware — reads the user's current subscription state
 * and exposes plan + limits to any component. Acts as the client-side
 * middleware between auth and feature-gated UI.
 */
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getSubscription } from '../services/userDataService';
import { getPlan, type PlanId, type PlanLimits } from '../saas/plans';
import type { Subscription } from '../supabase/database.types';

export interface SubscriptionState {
  subscription: Subscription | null;
  planId: PlanId;
  limits: PlanLimits;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const { session } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    (async () => {
      const sub = await getSubscription();
      setSubscription(sub);
      setLoading(false);
    })();
  }, [session]);

  const planId: PlanId = (subscription?.plan as PlanId) || 'free';
  const limits = getPlan(planId).limits;

  return { subscription, planId, limits, loading };
}
