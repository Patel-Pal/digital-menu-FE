import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { discountService } from "@/services/discountService";

interface Props {
  shopId: string;
  deviceId: string;
  stampsRequired: number;
  rewardType: string;
  rewardValue: number;
}

export function LoyaltyProgress({ shopId, deviceId, stampsRequired, rewardType, rewardValue }: Props) {
  const [stamps, setStamps] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await discountService.getLoyaltyProgress(shopId, deviceId);
        setStamps(data.currentStamps || 0);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [shopId, deviceId]);

  if (loading) return null;

  const rewardLabel = rewardType === "percentage" ? `${rewardValue}% off` : `₹${rewardValue} off`;

  return (
    <div className="p-3 rounded-xl border bg-muted/30 space-y-2">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-pink-500" />
        <span className="text-sm font-medium">Loyalty Card</span>
        <span className="text-xs text-muted-foreground ml-auto">{stamps}/{stampsRequired} stamps</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: stampsRequired }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i < stamps ? "bg-pink-500" : "bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {stamps >= stampsRequired
          ? "🎉 Reward unlocked! Check your rewards."
          : `${stampsRequired - stamps} more to earn ${rewardLabel}`}
      </p>
    </div>
  );
}
