import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Globe, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { mockCategories, getItemsByCategory } from "@/utils/mockData";
import { useMenuTheme, menuThemes } from "@/contexts/ThemeContext";
import type { MenuItem } from "@/types";

export function CustomerMenuPage() {
  const [activeCategory, setActiveCategory] = useState("1");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const { menuTheme } = useMenuTheme();
  const theme = menuThemes[menuTheme];

  const items = getItemsByCategory(activeCategory).filter((item) =>
    searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Shop Header with Dynamic Theme */}
      <header className="relative overflow-hidden">
        {/* Banner - uses dynamic theme colors */}
        <div 
          className="h-40"
          style={{
            background: `linear-gradient(135deg, hsl(${theme.primary} / 0.2), hsl(${theme.accent} / 0.1), hsl(var(--secondary)))`
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>

        {/* Shop Info */}
        <div className="relative -mt-16 px-4 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-4"
          >
            <div 
              className="h-24 w-24 flex-shrink-0 rounded-2xl shadow-lg flex items-center justify-center text-4xl border-4 border-background"
              style={{ backgroundColor: `hsl(${theme.primary} / 0.1)` }}
            >
              🍳
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold">The Rustic Kitchen</h1>
              <p className="text-sm text-muted-foreground">Farm-to-table dining</p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Search & Language */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search menu..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex h-10 items-center gap-1 rounded-xl border-2 border-input bg-background px-3 text-sm font-medium"
            >
              <Globe className="h-4 w-4" />
              EN
              <ChevronDown className="h-3 w-3" />
            </button>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 z-50 rounded-xl border bg-card shadow-lg"
              >
                {["EN", "ES", "FR", "DE"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setShowLangMenu(false)}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-muted first:rounded-t-xl last:rounded-b-xl"
                  >
                    {lang}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs with Dynamic Theme */}
      <CategoryTabs
        categories={mockCategories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        themeColor={theme.primary}
      />

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MenuItemCard
                item={item}
                onClick={() => setSelectedItem(item)}
                themeColor={theme.primary}
              />
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No items found
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different search term
            </p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        themeColor={theme.primary}
      />
    </div>
  );
}
