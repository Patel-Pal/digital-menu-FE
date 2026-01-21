import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { MenuItem } from "@/types";
import { Flame, Leaf } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
  onClick?: () => void;
  showToggle?: boolean;
  onToggle?: (available: boolean) => void;
  themeColor?: string;
}

export function MenuItemCard({ item, onClick, showToggle, onToggle, themeColor }: MenuItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="interactive"
        className="overflow-hidden"
        onClick={onClick}
      >
        <div className="flex gap-4 p-4">
          {/* Image placeholder */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">
                🍽️
              </div>
            )}
            {item.popular && (
              <Badge className="absolute -top-1 -right-1" variant="warning">
                <Flame className="h-3 w-3" />
                Popular
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {item.name}
                </h3>
                {item.vegetarian && (
                  <Leaf className="h-4 w-4 flex-shrink-0 text-success" />
                )}
                {item.spicy && (
                  <Flame className="h-4 w-4 flex-shrink-0 text-destructive" />
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span 
                className="text-lg font-bold"
                style={{ color: themeColor ? `hsl(${themeColor})` : "hsl(var(--primary))" }}
              >
                ₹{item.price.toFixed(2)}
              </span>
              {showToggle && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-muted-foreground">
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                  <Switch
                    checked={item.available}
                    onCheckedChange={onToggle}
                  />
                </div>
              )}
              {!showToggle && !item.available && (
                <Badge variant="destructive">Unavailable</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
