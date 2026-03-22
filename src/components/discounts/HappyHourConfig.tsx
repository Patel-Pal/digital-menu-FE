import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HappyHourConfig as HHConfig } from "@/types/discount";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  config: HHConfig;
  onSave: (config: Partial<HHConfig>) => void;
}

export function HappyHourConfig({ config, onSave }: Props) {
  const [startTime, setStartTime] = useState(config.startTime || "14:00");
  const [endTime, setEndTime] = useState(config.endTime || "17:00");
  const [discountPercentage, setDiscountPercentage] = useState(config.discountPercentage || 10);
  const [applicableDays, setApplicableDays] = useState<number[]>(config.applicableDays || []);

  const toggleDay = (d: number) => {
    setApplicableDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSave = () => {
    if (startTime >= endTime) return;
    onSave({ startTime, endTime, discountPercentage, applicableDays });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Auto-apply discount during the configured time window.</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Start Time</Label>
          <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End Time</Label>
          <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Discount % (1-50)</Label>
          <Input type="number" min={1} max={50} value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} />
        </div>
      </div>
      {startTime >= endTime && <p className="text-xs text-destructive">Start time must be before end time</p>}
      <div className="space-y-1">
        <Label className="text-xs">Applicable Days</Label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((label, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                applicableDays.includes(i)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={handleSave} className="w-full" disabled={startTime >= endTime}>Save Happy Hour</Button>
    </div>
  );
}
