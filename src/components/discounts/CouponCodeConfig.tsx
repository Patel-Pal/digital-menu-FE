import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Coupon } from "@/types/discount";

interface Props {
  coupons: Coupon[];
  onSave: (coupons: Coupon[]) => void;
}

const emptyCoupon: Omit<Coupon, '_id'> = {
  code: "", discountType: "percentage", discountValue: 0,
  expiryDate: "", maxUsage: 100, currentUsage: 0, minOrderAmount: 0, isActive: true,
};

export function CouponCodeConfig({ coupons: initial, onSave }: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Coupon, '_id'>>(emptyCoupon);

  const addCoupon = () => {
    if (!form.code.trim() || !form.expiryDate || form.discountValue <= 0) return;
    setCoupons([...coupons, { ...form, code: form.code.toUpperCase() }]);
    setForm(emptyCoupon);
    setShowForm(false);
  };

  const removeCoupon = (i: number) => setCoupons(coupons.filter((_, idx) => idx !== i));

  const toggleActive = (i: number) => {
    const next = [...coupons];
    next[i] = { ...next[i], isActive: !next[i].isActive };
    setCoupons(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""}</p>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New Coupon
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Code</Label>
              <Input placeholder="SAVE10" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Discount Type</Label>
              <Select value={form.discountType} onValueChange={v => setForm({ ...form, discountType: v as 'percentage' | 'flat' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="flat">Flat (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input type="number" min={0} value={form.discountValue || ""} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Expiry Date</Label>
              <Input type="date" value={form.expiryDate ? form.expiryDate.split('T')[0] : ""} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Usage</Label>
              <Input type="number" min={1} value={form.maxUsage || ""} onChange={e => setForm({ ...form, maxUsage: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Min Order (₹)</Label>
              <Input type="number" min={0} value={form.minOrderAmount || ""} onChange={e => setForm({ ...form, minOrderAmount: Number(e.target.value) })} />
            </div>
          </div>
          <Button onClick={addCoupon} size="sm">Add Coupon</Button>
        </div>
      )}

      {coupons.length > 0 && (
        <div className="space-y-2">
          {coupons.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-sm">{c.code}</span>
                  <Badge variant={c.isActive ? "default" : "secondary"} className="text-[10px]">
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c.discountType === "percentage" ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                  {c.minOrderAmount > 0 && ` · Min ₹${c.minOrderAmount}`}
                  {` · ${c.currentUsage}/${c.maxUsage} used`}
                  {c.expiryDate && ` · Expires ${new Date(c.expiryDate).toLocaleDateString()}`}
                </p>
              </div>
              <Switch checked={c.isActive} onCheckedChange={() => toggleActive(i)} />
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeCoupon(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => onSave(coupons)} className="w-full">Save Coupons</Button>
    </div>
  );
}
