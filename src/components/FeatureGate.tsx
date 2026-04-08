import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';
import { FEATURE_MATRIX, type FeatureKey, type SubscriptionPlan } from '@/config/featureMatrix';

const PLAN_ORDER: SubscriptionPlan[] = ['free', 'basic', 'premium', 'enterprise'];

function getMinimumPlan(featureKey: FeatureKey): SubscriptionPlan {
  for (const plan of PLAN_ORDER) {
    if (FEATURE_MATRIX[plan].includes(featureKey)) {
      return plan;
    }
  }
  return 'enterprise';
}

interface FeatureGateProps {
  featureKey: FeatureKey;
  children: ReactNode;
}

export function FeatureGate({ featureKey, children }: FeatureGateProps) {
  const { hasFeature, loading, subscription } = useFeatureAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasFeature(featureKey)) {
    const minimumPlan = getMinimumPlan(featureKey);
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Feature not available</h2>
          <p className="text-muted-foreground text-sm mb-4">
            This feature is not included in your current <span className="font-medium capitalize">{subscription}</span> plan.
            Upgrade to the <span className="font-medium capitalize">{minimumPlan}</span> plan or higher to unlock it.
          </p>
          <Link
            to="/shop/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Settings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
