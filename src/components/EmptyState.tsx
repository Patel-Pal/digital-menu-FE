import { motion } from "framer-motion";
import { LucideIcon, UtensilsCrossed, FolderOpen, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "menu" | "category" | "order" | "search" | "default";
}

const defaultIcons: Record<string, LucideIcon> = {
  menu: UtensilsCrossed,
  category: FolderOpen,
  order: ShoppingBag,
  search: Search,
  default: UtensilsCrossed,
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const Icon = icon || defaultIcons[variant];

  return (
    <Card className="border-dashed">
      <CardContent className="p-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
        >
          <Icon className="h-8 w-8 text-muted-foreground" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">{description}</p>
          {actionLabel && onAction && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
