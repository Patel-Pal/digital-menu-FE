import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Globe, ChevronDown, UtensilsCrossed, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { AboutDigitalMenu } from "@/components/AboutDigitalMenu";
import { AboutShop } from "@/components/AboutShop";
import { CustomerRating } from "@/components/CustomerRating";
import { useMenuTheme, menuThemes } from "@/contexts/ThemeContext";
import { useMenu } from "@/hooks/useMenu";
import { useParams } from "react-router-dom";
import type { MenuItem } from "@/types";

type ViewTab = "menu" | "about";

export function CustomerMenuPageWithAPI() {
  const { shopId } = useParams();
  const [activeCategory, setActiveCategory] = useState("1");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("menu");
  
  const { menuTheme } = useMenuTheme();
  const theme = menuThemes[menuTheme];

  // Fetch menu data from API
  const { data: menuData, isLoading, error } = useMenu(shopId || "default-shop-id");

  const menu = menuData?.data;
  const categories = menu?.categories || [];
  const allItems = menu?.items || [];

  // Filter items by category and search
  const items = allItems.filter((item: MenuItem) => {
    const matchesCategory = activeCategory === "1" || item.categoryId === activeCategory;
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load menu</p>
          <p className="text-muted-foreground text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Shop Header with Dynamic Theme */}
      <header className="relative overflow-hidden">
        {/* Banner - uses dynamic theme colors */}
        <div 
          className="h-36"
          style={{
            background: `linear-gradient(135deg, hsl(${theme.primary} / 0.2), hsl(${theme.accent} / 0.1), hsl(var(--secondary)))`
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>

        {/* Shop Info */}
        <div className="relative -mt-16 px-4">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-2xl bg-background shadow-lg flex items-center justify-center text-2xl font-bold border-4 border-background">
              🍽️
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {menu?.name || "Digital Menu"}
              </h1>
              <p className="text-muted-foreground text-sm">
                Delicious food, served fresh
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
              activeTab === "menu"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Menu
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
              activeTab === "about"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="h-4 w-4" />
            About
          </button>
        </div>
      </div>

      {activeTab === "menu" ? (
        <>
          {/* Search Bar */}
          <div className="px-4 py-4">
            <Input
              placeholder="Search menu items..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            themeColor={theme.primary}
          />

          {/* Menu Items */}
          <div className="px-4 pb-4">
            <div className="space-y-3">
              {items.map((item: MenuItem) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                  themeColor={theme.primary}
                />
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "No items found matching your search" : "No items in this category"}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="px-4 py-6 space-y-6">
          <AboutShop />
          <AboutDigitalMenu />
          <CustomerRating />
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          themeColor={theme.primary}
        />
      )}
    </div>
  );
}
