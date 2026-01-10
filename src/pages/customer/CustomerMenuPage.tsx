import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Globe, ChevronDown, UtensilsCrossed, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { AboutDigitalMenu } from "@/components/AboutDigitalMenu";
import { AboutShop } from "@/components/AboutShop";
import { CustomerRating } from "@/components/CustomerRating";
import { menuItemService, type MenuItem } from "@/services/menuItemService";
import { categoryService, type Category } from "@/services/categoryService";
import { useMenuTheme, menuThemes } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

type ViewTab = "menu" | "about";

export function CustomerMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("menu");
  const [loading, setLoading] = useState(true);
  
  const { menuTheme } = useMenuTheme();
  const theme = menuThemes[menuTheme];
  const { user } = useAuth();
  
  // For demo, use current user's shopId or a default
  const shopId = user?.shopId || "507f1f77bcf86cd799439011";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuResponse, categoryResponse] = await Promise.all([
        menuItemService.getMenuItemsByShop(shopId),
        categoryService.getCategoriesByShop(shopId)
      ]);
      
      setMenuItems(menuResponse.data || []);
      setCategories(categoryResponse.data || []);
      
      // Set first category as active if available
      if (categoryResponse.data && categoryResponse.data.length > 0) {
        setActiveCategory(categoryResponse.data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.categoryId._id === activeCategory;
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch && item.isActive;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <div className="relative px-4 -mt-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold">
                🍽️
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">Digital Menu Demo</h1>
                <p className="text-muted-foreground text-sm">Delicious food, great experience</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">⭐ 4.8 (120 reviews)</span>
                  <span className="text-xs text-muted-foreground">🕒 30-45 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b px-4 py-3">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
              activeTab === "menu"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Menu
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
              activeTab === "about"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <Info className="h-4 w-4" />
            About
          </button>
        </div>
      </div>

      {activeTab === "menu" ? (
        <div className="px-4 py-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setActiveCategory(category._id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    activeCategory === category._id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items */}
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedItem(item)}
                className="cursor-pointer"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">🍽️</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2">
                              {item.popular && <Badge variant="outline" className="text-xs">Popular</Badge>}
                              {item.vegetarian && <Badge variant="outline" className="text-xs text-green-600">🌱 Veg</Badge>}
                              {item.spicy && <Badge variant="outline" className="text-xs text-red-600">🌶️ Spicy</Badge>}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "Try adjusting your search terms" 
                      : "No menu items available in this category"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
        />
      )}
    </div>
  );
}
