import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeElement = activeRef.current;
      const scrollLeft = activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeCategory]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3 bg-background/95 backdrop-blur-md sticky top-0 z-40"
    >
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        return (
          <button
            key={category.id}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(category.id)}
            className={cn(
              "relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{category.icon}</span>
            <span className="relative z-10">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
