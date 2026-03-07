import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, ChefHat } from "lucide-react";

interface OrderTimelineProps {
  status: string;
  createdAt: string;
  estimatedReadyTime?: number;
}

const steps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "approved", label: "Preparing", icon: ChefHat },
  { key: "completed", label: "Ready", icon: CheckCircle },
];

export function OrderTimeline({ status, createdAt, estimatedReadyTime }: OrderTimelineProps) {
  const isRejected = status === "rejected";
  const currentIndex = isRejected ? 0 : steps.findIndex(s => s.key === status);

  if (isRejected) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
        <XCircle className="h-5 w-5 text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Order Rejected</p>
          <p className="text-xs text-muted-foreground">
            Placed at {new Date(createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isCurrent ? 1.1 : 1 }}
              className={`flex flex-col items-center gap-1 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/40"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActive ? "bg-primary text-primary-foreground" : "bg-muted"
              } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">{step.label}</span>
            </motion.div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded ${
                index < currentIndex ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
