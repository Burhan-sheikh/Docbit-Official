/**
 * DocBit SaaS Plans — pricing tiers and feature limits.
 * Architecture-only: no payments are processed. Razorpay integration
 * is stubbed via the billing abstraction in billingService.ts.
 */

export type PlanId = 'free' | 'pro' | 'team' | 'enterprise';

export interface PlanLimits {
  maxConversionsPerDay: number;
  maxFileSizeMb: number;
  maxBatchFiles: number;
  cloudProcessing: boolean;
  priorityQueue: boolean;
  apiAccess: boolean;
  teamMembers: number;
  savedFilesRetentionDays: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  description: string;
  features: string[];
  limits: PlanLimits;
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'INR',
    description: 'For individuals exploring DocBit with local-only processing.',
    features: [
      'Unlimited local conversions',
      'Up to 50MB per file',
      'Batch up to 10 files',
      'All core PDF tools',
      'Community support',
    ],
    limits: {
      maxConversionsPerDay: 50,
      maxFileSizeMb: 50,
      maxBatchFiles: 10,
      cloudProcessing: false,
      priorityQueue: false,
      apiAccess: false,
      teamMembers: 1,
      savedFilesRetentionDays: 0,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 299,
    priceYearly: 2999,
    currency: 'INR',
    description: 'For power users who need cloud tools and higher limits.',
    features: [
      'Everything in Free',
      'Up to 200MB per file',
      'Batch up to 50 files',
      'Cloud processing (OCR, AI)',
      'Priority queue',
      'No daily limits',
      'Email support',
    ],
    limits: {
      maxConversionsPerDay: 0,
      maxFileSizeMb: 200,
      maxBatchFiles: 50,
      cloudProcessing: true,
      priorityQueue: true,
      apiAccess: false,
      teamMembers: 1,
      savedFilesRetentionDays: 30,
    },
    highlight: true,
  },
  {
    id: 'team',
    name: 'Team',
    priceMonthly: 999,
    priceYearly: 9999,
    currency: 'INR',
    description: 'For teams collaborating on document workflows.',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'API access',
      'Shared saved files',
      'Admin dashboard',
      'Priority support',
    ],
    limits: {
      maxConversionsPerDay: 0,
      maxFileSizeMb: 500,
      maxBatchFiles: 100,
      cloudProcessing: true,
      priorityQueue: true,
      apiAccess: true,
      teamMembers: 5,
      savedFilesRetentionDays: 90,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'INR',
    description: 'Custom limits, SSO, and dedicated support for organizations.',
    features: [
      'Everything in Team',
      'Unlimited team members',
      'SSO / SAML',
      'Custom integrations',
      'Dedicated support',
      'SLA',
    ],
    limits: {
      maxConversionsPerDay: 0,
      maxFileSizeMb: 0,
      maxBatchFiles: 0,
      cloudProcessing: true,
      priorityQueue: true,
      apiAccess: true,
      teamMembers: 0,
      savedFilesRetentionDays: 365,
    },
  },
];

export const PLAN_MAP: Record<PlanId, Plan> = PLANS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PlanId, Plan>
);

export const getPlan = (id: PlanId): Plan => PLAN_MAP[id] || PLAN_MAP.free;

export interface FeatureGate {
  feature: keyof PlanLimits;
  minPlan: PlanId;
}

export function hasFeatureAccess(userPlan: PlanId, gate: FeatureGate): boolean {
  const plan = getPlan(userPlan);
  const planRank: PlanId[] = ['free', 'pro', 'team', 'enterprise'];
  const userRank = planRank.indexOf(userPlan);
  const requiredRank = planRank.indexOf(gate.minPlan);
  return userRank >= requiredRank && Boolean(plan.limits[gate.feature]);
}

export function isWithinFileSizeLimit(userPlan: PlanId, fileSizeMb: number): boolean {
  const limit = getPlan(userPlan).limits.maxFileSizeMb;
  return limit === 0 || fileSizeMb <= limit;
}

export function isWithinBatchLimit(userPlan: PlanId, fileCount: number): boolean {
  const limit = getPlan(userPlan).limits.maxBatchFiles;
  return limit === 0 || fileCount <= limit;
}
