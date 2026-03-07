import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function PageLoader({ message = "Loading...", fullScreen = false }: PageLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? "min-h-screen" : "h-64"}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-14 h-14 rounded-full border-[3px] border-muted" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-transparent border-t-primary" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex items-center gap-2"
      >
        <UtensilsCrossed className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      </motion.div>
    </div>
  );
}
