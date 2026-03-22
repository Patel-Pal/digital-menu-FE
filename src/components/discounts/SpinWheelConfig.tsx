import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SpinWheelSegment } from "@/types/discount";

interface Props {
  segments: SpinWheelSegment[];
  onSave: (segments: SpinWheelSegment[]) => void;
}

export function SpinWheelConfig({ segments: initial, onSave }: Props) {
  const [segments, setSegments] = useState<SpinWheelSegment[]>(
    initial.length > 0 ? initial : [
      { label: "", rewardType: "percentage", rewardValue: 0, probability: 1 },
      { label: "", rewardType: "percentage", rewardValue: 0, probability: 1 },
    ]
  );

  const addSegment = () => {
    if (segments.length >= 8) return;
    setSegments([...segments, { label: "", rewardType: "percentage", rewardValue: 0, probability: 1 }]);
  };

  const removeSegment = (i: number) => {
    if (segments.length <= 2) return;
    setSegments(segments.filter((_, idx) => idx !== i));
  };

  const update = (i: number, field: string, value: string | number) => {
    const next = [...segments];
    next[i] = { ...next[i], [field]: value };
    setSegments(next);
  };

  const handleSave = () => {
    if (segments.some(s => !s.label.trim())) return;
    onSave(segments);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Configure 2-8 prize segments</p>
        <Button size="sm" variant="outline" onClick={addSegment} disabled={segments.length >= 8}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      <div className="space-y-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-end gap-2 p-3 rounded-lg border bg-muted/30">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Label</Label>
              <Input placeholder="e.g. 10% Off" value={seg.label} onChange={e => update(i, "label", e.target.value)} />
            </div>
            <div className="w-28 space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={seg.rewardType} onValueChange={v => update(i, "rewardType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="flat">Flat ₹</SelectItem>
                  <SelectItem value="freeItem">Free Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-20 space-y-1">
              <Label className="text-xs">Value</Label>
              <Input type="number" min={0} value={seg.rewardValue || ""} onChange={e => update(i, "rewardValue", Number(e.target.value))} />
            </div>
            <div className="w-20 space-y-1">
              <Label className="text-xs">Weight</Label>
              <Input type="number" min={1} value={seg.probability || ""} onChange={e => update(i, "probability", Number(e.target.value))} />
            </div>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeSegment(i)} disabled={segments.length <= 2}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} className="w-full">Save Segments</Button>
    </div>
  );
}
