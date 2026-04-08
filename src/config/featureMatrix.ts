export const FEATURE_KEYS = [
  'qr_code',
  'categories',
  'menu_items',
  'orders',
  'tables',
  'billing',
  'billing_analytics',
  'waiters',
  'chefs',
  'analytics',
  'shop_settings',
  'export',
  'qr_customization',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

export const FEATURE_MATRIX: Record<SubscriptionPlan, readonly FeatureKey[]> = {
  free: ['qr_code', 'menu_items', 'orders', 'shop_settings'],
  basic: ['qr_code', 'menu_items', 'orders', 'shop_settings', 'categories', 'billing', 'analytics'],
  premium: [
    'qr_code', 'menu_items', 'orders', 'shop_settings',
    'categories', 'billing', 'analytics',
    'waiters', 'chefs', 'tables', 'billing_analytics', 'export', 'qr_customization',
  ],
  enterprise: [...FEATURE_KEYS],
};

/**
 * Returns the array of enabled feature keys for a plan.
 * Returns empty array for unrecognized plans.
 */
export function getDefaultFeatures(plan: string): FeatureKey[] {
  return [...(FEATURE_MATRIX[plan as SubscriptionPlan] ?? [])];
}

/**
 * Merges plan defaults with per-shop overrides.
 * Override true  → feature enabled regardless of plan.
 * Override false → feature disabled regardless of plan.
 * Absent key    → falls back to plan default.
 */
export function resolveFeatures(
  plan: string,
  featureOverrides?: Partial<Record<FeatureKey, boolean>> | null,
): FeatureKey[] {
  const defaults = new Set<FeatureKey>(getDefaultFeatures(plan));
  const overrides = featureOverrides ?? {};

  for (const key of FEATURE_KEYS) {
    if (key in overrides) {
      if (overrides[key] === true) {
        defaults.add(key);
      } else if (overrides[key] === false) {
        defaults.delete(key);
      }
    }
  }

  return [...defaults];
}

export function isValidFeatureKey(key: string): key is FeatureKey {
  return (FEATURE_KEYS as readonly string[]).includes(key);
}

export function isValidPlan(plan: string): plan is SubscriptionPlan {
  return plan in FEATURE_MATRIX;
}
