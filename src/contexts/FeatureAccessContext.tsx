import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { shopService } from '@/services/shopService';
import { getDefaultFeatures, type FeatureKey, type SubscriptionPlan } from '@/config/featureMatrix';

interface FeatureAccessContextType {
  features: FeatureKey[];
  subscription: SubscriptionPlan;
  loading: boolean;
  hasFeature: (featureKey: string) => boolean;
  refreshFeatures: () => Promise<void>;
}

const FeatureAccessContext = createContext<FeatureAccessContextType | undefined>(undefined);

export const useFeatureAccess = () => {
  const context = useContext(FeatureAccessContext);
  if (!context) {
    throw new Error('useFeatureAccess must be used within a FeatureAccessProvider');
  }
  return context;
};

interface FeatureAccessProviderProps {
  children: ReactNode;
}

export const FeatureAccessProvider = ({ children }: FeatureAccessProviderProps) => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureKey[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionPlan>('free');
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shopService.getMyFeatures();
      const data = response.data;
      setFeatures(data.resolvedFeatures);
      setSubscription(data.subscription);
    } catch (error) {
      // No shop profile yet (new shopkeeper) — fall back to free plan defaults
      // so they can still access Settings and other free-tier pages
      console.error('Failed to fetch features, falling back to free plan:', error);
      setFeatures(getDefaultFeatures('free'));
      setSubscription('free');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'shopkeeper') {
      fetchFeatures();
    } else {
      setLoading(false);
    }
  }, [user, fetchFeatures]);

  const hasFeature = useCallback(
    (featureKey: string) => features.includes(featureKey as FeatureKey),
    [features],
  );

  const refreshFeatures = useCallback(async () => {
    await fetchFeatures();
  }, [fetchFeatures]);

  return (
    <FeatureAccessContext.Provider value={{ features, subscription, loading, hasFeature, refreshFeatures }}>
      {children}
    </FeatureAccessContext.Provider>
  );
};
