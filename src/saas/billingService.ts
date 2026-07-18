/**
 * Billing Abstraction — provider-agnostic interface for payment providers.
 * Currently stubbed for Razorpay (not enabled). Swap implementations via
 * the BILLING_PROVIDER env var when ready to go live.
 */
import type { PlanId } from './plans';

export type BillingProvider = 'razorpay' | 'stripe' | 'mock';

export interface CheckoutSession {
  id: string;
  url: string;
  provider: BillingProvider;
}

export interface SubscriptionState {
  planId: PlanId;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface BillingAdapter {
  provider: BillingProvider;
  createCheckoutSession(planId: PlanId, userId: string, email: string): Promise<CheckoutSession>;
  cancelSubscription(userId: string): Promise<void>;
  getSubscriptionState(userId: string): Promise<SubscriptionState | null>;
  webhookSignatureValid: (payload: string, signature: string) => boolean;
}

class MockBillingAdapter implements BillingAdapter {
  provider: BillingProvider = 'mock';
  async createCheckoutSession(_planId: PlanId): Promise<CheckoutSession> {
    return { id: 'mock_session', url: '/dashboard?checkout=mock', provider: 'mock' };
  }
  async cancelSubscription(): Promise<void> {}
  async getSubscriptionState(): Promise<SubscriptionState | null> {
    return { planId: 'free', status: 'active', currentPeriodEnd: null, cancelAtPeriodEnd: false };
  }
  webhookSignatureValid = () => true;
}

class RazorpayBillingAdapter implements BillingAdapter {
  provider: BillingProvider = 'razorpay';
  async createCheckoutSession(planId: PlanId, userId: string, email: string): Promise<CheckoutSession> {
    throw new Error(
      `Razorpay not configured. Call initializeBilling({ provider: 'razorpay', keyId, keySecret }) before use. Plan=${planId} user=${userId} email=${email}`
    );
  }
  async cancelSubscription(): Promise<void> {
    throw new Error('Razorpay cancel not configured');
  }
  async getSubscriptionState(): Promise<SubscriptionState | null> {
    return null;
  }
  webhookSignatureValid = () => false;
}

let activeAdapter: BillingAdapter = new MockBillingAdapter();

export function initializeBilling(config: { provider: BillingProvider; keyId?: string; keySecret?: string }): void {
  if (config.provider === 'razorpay') {
    activeAdapter = new RazorpayBillingAdapter();
  } else if (config.provider === 'mock') {
    activeAdapter = new MockBillingAdapter();
  }
  // stripe adapter can be added here when needed
}

export function getBillingAdapter(): BillingAdapter {
  return activeAdapter;
}

export async function createCheckoutSession(planId: PlanId, userId: string, email: string): Promise<CheckoutSession> {
  return activeAdapter.createCheckoutSession(planId, userId, email);
}

export async function cancelSubscription(userId: string): Promise<void> {
  return activeAdapter.cancelSubscription(userId);
}

export async function getSubscriptionState(userId: string): Promise<SubscriptionState | null> {
  return activeAdapter.getSubscriptionState(userId);
}
