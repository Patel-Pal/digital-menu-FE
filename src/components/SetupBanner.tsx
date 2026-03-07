import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { useShopSetup } from "@/contexts/ShopSetupContext";

export function SetupBanner() {
  const { isSetupComplete, setupChecklist } = useShopSetup();

  if (isSetupComplete) return null;

  const done = setupChecklist.filter((i) => i.done).length;
  const total = setupChecklist.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
            Complete your shop setup ({done}/{total})
          </h3>
          <p className="text-sm text-amber-600 dark:text-amber-300/80 mb-3">
            You need to fill in all required shop information before you can access other features.
          </p>
          <div className="space-y-1.5">
            {setupChecklist.map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-amber-400" />
                )}
                <span className={item.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 rounded-full bg-amber-200 dark:bg-amber-900/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(done / total) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
