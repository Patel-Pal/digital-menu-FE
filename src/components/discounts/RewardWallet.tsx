import { useState, useEffect } from "react";
import { Gift, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { discountService } from "@/services/discountService";
import type { DiscountReward } from "@/types/discount";

interface Props {
  shopId: string;
  deviceId: string;
  selectedRewardId?: string | null;
  onSelect: (rewardId: string | null) => void;
}

const TYPE_LABELS: Record<string, string> = {
  spin_win: "Spin & Win",
  scratch_card: "Scratch Card",
  loyalty: "Loyalty Reward",
};

export function RewardWallet({ shopId, deviceId, selectedRewardId, onSelect }: Props) {
  const [rewards, setRewards] = useState<DiscountReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, [shopId, deviceId]);

  const fetchRewards = async () => {
    try {
      const data = await discountService.getCustomerRewards(shopId, deviceId);
      // Only show available, non-expired rewards
      const available = data.filter(r =>
        r.status === "available" &&
        r.type !== "loyalty_progress" &&
        (!r.expiresAt || new Date(r.expiresAt) > new Date())
      );
      setRewards(available);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  if (loading || rewards.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">My Rewards</span>
        <Badge variant="secondary" className="text-[10px]">{rewards.length}</Badge>
      </div>
      <div className="space-y-1.5">
        {rewards.map(r => {
          const isSelected = selectedRewardId === r._id;
          return (
            <button
              key={r._id}
              onClick={() => onSelect(isSelected ? null : r._id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{r.label}</span>
                <p className="text-xs text-muted-foreground">
                  {TYPE_LABELS[r.type] || r.type}
                  {r.rewardType === "percentage" ? ` · ${r.rewardValue}% off` : ` · ₹${r.rewardValue} off`}
                  {r.expiresAt && ` · Expires ${new Date(r.expiresAt).toLocaleDateString()}`}
                </p>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
