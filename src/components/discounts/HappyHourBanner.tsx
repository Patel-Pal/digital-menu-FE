import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  startTime: string; // "HH:MM"
  endTime: string;
  discountPercentage: number;
  applicableDays: number[];
}

export function HappyHourBanner({ startTime, endTime, discountPercentage, applicableDays }: Props) {
  const [remaining, setRemaining] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const day = now.getDay();
      if (!applicableDays.includes(day)) { setActive(false); return; }

      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;

      if (nowMins >= startMins && nowMins < endMins) {
        setActive(true);
        const diff = endMins - nowMins;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setRemaining(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
      } else {
        setActive(false);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [startTime, endTime, applicableDays]);

  if (!active) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
      <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
      <div className="flex-1">
        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
          Happy Hour — {discountPercentage}% off!
        </span>
      </div>
      <span className="text-xs font-medium text-orange-500">{remaining}</span>
    </div>
  );
}
