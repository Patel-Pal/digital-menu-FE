import { motion, AnimatePresence } from "framer-motion";
import { X, Leaf, Flame, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/types";

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

export function ItemDetailModal({ item, isOpen, onClose, themeColor }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const primaryColor = themeColor ? `hsl(${themeColor})` : "hsl(var(--primary))";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-card"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-muted" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Image */}
            <div className="relative h-56 w-full bg-muted">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">
                  🍽️
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
              {/* Title & Badges */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <span className="text-xl font-bold" style={{ color: primaryColor }}>
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.popular && (
                    <Badge variant="warning">
                      <Flame className="h-3 w-3" /> Popular
                    </Badge>
                  )}
                  {item.vegetarian && (
                    <Badge variant="success">
                      <Leaf className="h-3 w-3" /> Vegetarian
                    </Badge>
                  )}
                  {item.spicy && (
                    <Badge variant="destructive">
                      <Flame className="h-3 w-3" /> Spicy
                    </Badge>
                  )}
                  {!item.available && (
                    <Badge variant="secondary">Currently Unavailable</Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{item.description}</p>

              {/* Quantity Selector (for demo) */}
              {item.available && (
                <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                  <span className="font-medium">Quantity</span>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 safe-bottom">
              <Button
                className="w-full"
                size="xl"
                style={{ 
                  background: themeColor 
                    ? `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor} / 0.8))` 
                    : undefined 
                }}
                variant={themeColor ? undefined : "gradient"}
                disabled={!item.available}
              >
                {item.available
                  ? `Add to Order • $${(item.price * quantity).toFixed(2)}`
                  : "Currently Unavailable"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
