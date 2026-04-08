import { useState, useEffect, useCallback } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import {
  FEATURE_KEYS,
  FEATURE_MATRIX,
  type FeatureKey,
  type SubscriptionPlan,
} from "@/config/featureMatrix";
import type { FeatureOverrides } from "@/types";

const PLANS: SubscriptionPlan[] = ["free", "basic", "premium", "enterprise"];

function humanize(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface ShopFeaturePanelProps {
  shopId: string;
  onClose?: () => void;
}

export function ShopFeaturePanel({ shopId, onClose }: ShopFeaturePanelProps) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [overrides, setOverrides] = useState<FeatureOverrides>({});
  const [resolvedFeatures, setResolvedFeatures] = useState<FeatureKey[]>([]);

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getShopFeatures(shopId);
      const data = res.data ?? res;
      setPlan(data.subscription);
      setOverrides(data.featureOverrides ?? {});
      setResolvedFeatures(data.resolvedFeatures ?? []);
    } catch {
      toast.error("Failed to load shop features");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handlePlanChange = async (newPlan: string) => {
    const prev = plan;
    setPlan(newPlan as SubscriptionPlan);
    try {
      await adminService.updateShopSubscription(shopId, newPlan);
      toast.success("Subscription updated");
      await fetchFeatures();
    } catch {
      setPlan(prev);
      toast.error("Failed to update subscription");
    }
  };

  const handleToggle = async (featureKey: FeatureKey, newValue: boolean) => {
    const prevOverrides = { ...overrides };
    const prevResolved = [...resolvedFeatures];

    // Optimistic update
    setOverrides((o) => ({ ...o, [featureKey]: newValue }));
    setResolvedFeatures((rf) =>
      newValue ? [...new Set([...rf, featureKey])] : rf.filter((k) => k !== featureKey),
    );

    try {
      await adminService.toggleFeatureOverride(shopId, featureKey, newValue);
      toast.success("Feature override updated");
      await fetchFeatures();
    } catch {
      setOverrides(prevOverrides);
      setResolvedFeatures(prevResolved);
      toast.error("Failed to update feature override");
    }
  };

  const handleReset = async (featureKey: FeatureKey) => {
    const prevOverrides = { ...overrides };
    const prevResolved = [...resolvedFeatures];

    // Optimistic: remove override
    setOverrides((o) => {
      const next = { ...o };
      delete next[featureKey];
      return next;
    });

    try {
      await adminService.toggleFeatureOverride(shopId, featureKey, null);
      toast.success("Override removed");
      await fetchFeatures();
    } catch {
      setOverrides(prevOverrides);
      setResolvedFeatures(prevResolved);
      toast.error("Failed to reset override");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const planDefaults = new Set(FEATURE_MATRIX[plan] ?? []);

  return (
    <div className="space-y-6">
      {/* Plan selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Subscription Plan</label>
        <Select value={plan} onValueChange={handlePlanChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLANS.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feature toggles */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Features</label>
        <div className="divide-y rounded-md border">
          {FEATURE_KEYS.map((featureKey) => {
            const isOverridden = featureKey in overrides;
            const isEnabled = resolvedFeatures.includes(featureKey);

            return (
              <div
                key={featureKey}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{humanize(featureKey)}</span>
                  {isOverridden && (
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-600 text-xs gap-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                      Override
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOverridden && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleReset(featureKey)}
                      title="Reset to plan default"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(val) => handleToggle(featureKey, val)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
