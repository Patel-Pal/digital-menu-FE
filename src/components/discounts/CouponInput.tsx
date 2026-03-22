import { useState } from "react";
import { Tag, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { discountService } from "@/services/discountService";
import type { CouponValidation } from "@/types/discount";

interface Props {
  shopId: string;
  orderAmount: number;
  onApply: (coupon: CouponValidation) => void;
  onClear: () => void;
  applied?: CouponValidation | null;
}

export function CouponInput({ shopId, orderAmount, onApply, onClear, applied }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await discountService.validateCoupon(shopId, code.trim(), orderAmount);
      onApply(result);
      setCode("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid coupon");
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-green-500/30 bg-green-500/5">
        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {applied.code} applied — ₹{applied.discountAmount.toFixed(2)} off
          </span>
        </div>
        <button onClick={onClear} className="p-1 rounded hover:bg-muted">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter coupon code"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
            className="pl-9"
            onKeyDown={e => e.key === "Enter" && handleApply()}
          />
        </div>
        <Button onClick={handleApply} disabled={loading || !code.trim()} size="sm">
          {loading ? "..." : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
