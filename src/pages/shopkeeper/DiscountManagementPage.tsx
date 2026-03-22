import { useState, useEffect } from "react";
import { Disc3, Ticket, Tag, Heart, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PageLoader } from "@/components/PageLoader";
import { discountService } from "@/services/discountService";
import { useAuth } from "@/contexts/AuthContext";
import { SpinWheelConfig } from "@/components/discounts/SpinWheelConfig";
import { ScratchCardConfig } from "@/components/discounts/ScratchCardConfig";
import { CouponCodeConfig } from "@/components/discounts/CouponCodeConfig";
import { LoyaltyCardConfig } from "@/components/discounts/LoyaltyCardConfig";
import { HappyHourConfig } from "@/components/discounts/HappyHourConfig";
import type { DiscountConfig } from "@/types/discount";

const DISCOUNT_TYPES = [
  { key: "spinWheel", label: "Spin & Win", desc: "Customers spin a wheel after ordering to win prizes", icon: Disc3 },
  { key: "scratchCard", label: "Scratch Card", desc: "Scratch-to-reveal rewards after bill payment", icon: Ticket },
  { key: "couponCode", label: "Coupon Codes", desc: "Create promo codes customers can apply at checkout", icon: Tag },
  { key: "loyaltyCard", label: "Loyalty Card", desc: "Stamp card — earn a reward after N paid bills", icon: Heart },
  { key: "happyHour", label: "Happy Hour", desc: "Auto-apply discount during a time window", icon: Clock },
] as const;

type DiscountKey = typeof DISCOUNT_TYPES[number]["key"];

export function DiscountManagementPage() {
  const [config, setConfig] = useState<DiscountConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<DiscountKey | null>(null);
  const { user } = useAuth();
  const shopId = user?.shopId;

  useEffect(() => {
    if (shopId) fetchConfig();
  }, [shopId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await discountService.getDiscountConfig(shopId!);
      setConfig(data);
    } catch {
      toast.error("Failed to load discount config");
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = async (key: DiscountKey) => {
    if (!config) return;
    const section = config[key] as { enabled: boolean };
    try {
      const updated = await discountService.updateDiscountConfig(shopId!, {
        [key]: { ...config[key], enabled: !section.enabled },
      } as Partial<DiscountConfig>);
      setConfig(updated);
      toast.success(`${DISCOUNT_TYPES.find(d => d.key === key)?.label} ${!section.enabled ? "enabled" : "disabled"}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const saveSection = async (key: DiscountKey, data: Record<string, unknown>) => {
    if (!config) return;
    try {
      const updated = await discountService.updateDiscountConfig(shopId!, {
        [key]: { ...config[key], ...data },
      } as Partial<DiscountConfig>);
      setConfig(updated);
      toast.success("Saved successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enable and configure discount types for your customers. Each type can be turned on/off independently.
      </p>

      <div className="space-y-3">
        {DISCOUNT_TYPES.map(({ key, label, desc, icon: Icon }) => {
          const section = config?.[key] as { enabled: boolean } | undefined;
          const isEnabled = section?.enabled ?? false;
          const isExpanded = expanded === key;

          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{label}</h3>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={isEnabled} onCheckedChange={() => toggleEnabled(key)} />
                  <button
                    onClick={() => setExpanded(isExpanded ? null : key)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {isExpanded && config && (
                  <div className="mt-4 pt-4 border-t">
                    {key === "spinWheel" && (
                      <SpinWheelConfig
                        segments={config.spinWheel.segments || []}
                        onSave={segments => saveSection("spinWheel", { segments })}
                      />
                    )}
                    {key === "scratchCard" && (
                      <ScratchCardConfig
                        rewards={config.scratchCard.rewards || []}
                        onSave={rewards => saveSection("scratchCard", { rewards })}
                      />
                    )}
                    {key === "couponCode" && (
                      <CouponCodeConfig
                        coupons={config.couponCode.coupons || []}
                        onSave={coupons => saveSection("couponCode", { coupons })}
                      />
                    )}
                    {key === "loyaltyCard" && (
                      <LoyaltyCardConfig
                        config={config.loyaltyCard}
                        onSave={data => saveSection("loyaltyCard", data)}
                      />
                    )}
                    {key === "happyHour" && (
                      <HappyHourConfig
                        config={config.happyHour}
                        onSave={data => saveSection("happyHour", data)}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
