import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

function useAnimatedNumber(target: string | number, duration = 800) {
  const [display, setDisplay] = useState("0");
  const prevRef = useRef(0);

  useEffect(() => {
    const numericStr = String(target).replace(/[^0-9.]/g, "");
    const end = parseFloat(numericStr) || 0;
    const start = prevRef.current;
    const startTime = performance.now();
    const isInteger = Number.isInteger(end) && !String(target).includes(".");

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (isInteger) {
        setDisplay(Math.round(current).toLocaleString());
      } else {
        setDisplay(current.toFixed(2));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
        // Use the original formatted value at the end
        setDisplay(String(target));
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return display;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
}: StatCardProps) {
  const animatedValue = useAnimatedNumber(value);

  return (
    <Card variant="elevated" className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight">{animatedValue}</p>
          {change && (
            <p
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
