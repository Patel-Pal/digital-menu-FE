import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useMenuTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ThemeToggle({ size = "md", showLabel = false }: ThemeToggleProps) {
  const { appMode, toggleAppMode } = useMenuTheme();
  const isDark = appMode === "dark";

  const sizeClasses = {
    sm: "h-8 w-14",
    md: "h-10 w-[72px]",
    lg: "h-12 w-20",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const knobSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
      <button
        onClick={toggleAppMode}
        className={`relative ${sizeClasses[size]} rounded-full bg-muted p-1 transition-colors duration-300`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <motion.div
          className={`${knobSizes[size]} flex items-center justify-center rounded-full bg-background shadow-md`}
          animate={{ x: isDark ? (size === "sm" ? 22 : size === "md" ? 30 : 28) : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isDark ? (
            <Moon className={`${iconSizes[size]} text-primary`} />
          ) : (
            <Sun className={`${iconSizes[size]} text-warning`} />
          )}
        </motion.div>
      </button>
    </div>
  );
}
