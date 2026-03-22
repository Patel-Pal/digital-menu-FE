import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ScratchCardReward } from "@/types/discount";

interface Props {
  rewards: ScratchCardReward[];
  onSave: (rewards: ScratchCardReward[]) => void;
}

export function ScratchCardConfig({ rewards: initial, onSave }: Props) {
  const [rewards, setRewards] = useState<ScratchCardReward[]>(
    initial.length > 0 ? initial : [
      { label: "", rewardType: "percentage", rewardValue: 0, probability: 1 },
      { label: "", rewardType: "percentage", rewardValue: 0, probability: 1 },
    ]
  );

  const addReward = () => {
    if (rewards.length >= 6) return;
    setRewards([...rewards, { label: "", rewardType: "percentage", rewardValue: 0, probability: 1 }]);
  };

  const removeReward = (i: number) => {
    if (rewards.length <= 2) return;
    setRewards(rewards.filter((_, idx) => idx !== i));
  };

  const update = (i: number, field: string, value: string | number) => {
    const next = [...rewards];
    next[i] = { ...next[i], [field]: value };
    setRewards(next);
  };

  const handleSave = () => {
    if (rewards.some(r => !r.label.trim())) return;
    onSave(rewards);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Configure 2-6 scratch rewards</p>
        <Button size="sm" variant="outline" onClick={addReward} disabled={rewards.length >= 6}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      <div className="space-y-3">
        {rewards.map((r, i) => (
          <div key={i} className="flex items-end gap-2 p-3 rounded-lg border bg-muted/30">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Label</Label>
              <Input placeholder="e.g. 15% Off" value={r.label} onChange={e => update(i, "label", e.target.value)} />
            </div>
            <div className="w-28 space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={r.rewardType} onValueChange={v => update(i, "rewardType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="flat">Flat ₹</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-20 space-y-1">
              <Label className="text-xs">Value</Label>
              <Input type="number" min={0} value={r.rewardValue || ""} onChange={e => update(i, "rewardValue", Number(e.target.value))} />
            </div>
            <div className="w-20 space-y-1">
              <Label className="text-xs">Weight</Label>
              <Input type="number" min={1} value={r.probability || ""} onChange={e => update(i, "probability", Number(e.target.value))} />
            </div>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeReward(i)} disabled={rewards.length <= 2}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} className="w-full">Save Rewards</Button>
    </div>
  );
}
