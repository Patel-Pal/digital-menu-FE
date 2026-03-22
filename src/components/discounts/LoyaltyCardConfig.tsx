import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LoyaltyCardConfig as LoyaltyConfig } from "@/types/discount";

interface Props {
  config: LoyaltyConfig;
  onSave: (config: Partial<LoyaltyConfig>) => void;
}

export function LoyaltyCardConfig({ config, onSave }: Props) {
  const [stampsRequired, setStampsRequired] = useState(config.stampsRequired || 5);
  const [rewardType, setRewardType] = useState(config.rewardType || "percentage");
  const [rewardValue, setRewardValue] = useState(config.rewardValue || 10);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Customers earn a stamp per paid bill. Reward unlocks at the threshold.</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Stamps Required (3-20)</Label>
          <Input type="number" min={3} max={20} value={stampsRequired} onChange={e => setStampsRequired(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Reward Type</Label>
          <Select value={rewardType} onValueChange={v => setRewardType(v as 'percentage' | 'flat')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="flat">Flat (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Reward Value</Label>
          <Input type="number" min={1} value={rewardValue} onChange={e => setRewardValue(Number(e.target.value))} />
        </div>
      </div>
      <Button onClick={() => onSave({ stampsRequired, rewardType: rewardType as 'percentage' | 'flat', rewardValue })} className="w-full">
        Save Loyalty Settings
      </Button>
    </div>
  );
}
