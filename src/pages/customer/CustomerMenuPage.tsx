import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { shopService, type Shop } from "@/services/shopService";
import { useMenuTheme, menuThemes, MenuTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

type ViewTab = "menu" | "about" | "digital-menu";

export function CustomerMenuPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("menu");
  const [loading, setLoading] = useState(true);
  
  const { menuTheme, setMenuTheme } = useMenuTheme();
  const theme = menuThemes[menuTheme];
  const { user } = useAuth();
  
  // For demo, use current user's shopId or a default
  const currentShopId = shopId || user?.shopId || "";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shopResponse, menuResponse, categoryResponse] = await Promise.all([
        shopService.getShopByOwnerId(currentShopId),
        menuItemService.getMenuItemsByShop(currentShopId),
        categoryService.getCategoriesByShop(currentShopId)
      ]);
      
      setShop(shopResponse.data || null);
      setMenuItems(menuResponse.data || []);
      setCategories(categoryResponse.data || []);
      
      // Set shop's theme if available
      if (shopResponse.data?.menuTheme) {
        setMenuTheme(shopResponse.data.menuTheme as MenuTheme);
      }
      
      // Increment view count when menu is loaded
      if (currentShopId) {
        shopService.incrementView(currentShopId).catch(err => 
          console.error('Failed to increment view count:', err)
        );
      }
      
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
      {/* Mobile App Header - Fixed */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b">
        {/* Shop Info - Compact Mobile Style */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold flex-shrink-0">
              🍽️
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{shop?.name || "Digital Menu Demo"}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>⭐ {shop?.rating || "4.8"}</span>
                <span>🕒 30-45 min</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area with Mobile App Spacing */}
      <main className="pb-6">{activeTab === "menu" ? (
        <div className="px-4 pt-4 space-y-4">
          {/* Search - Mobile App Style */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-0 bg-muted/50"
            />
          </div>

          {/* Categories - Horizontal Scroll */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setActiveCategory(category._id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    activeCategory === category._id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items - Mobile App Cards */}
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedItem(item)}
                className="cursor-pointer"
              >
                <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-xl">🍽️</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2">
                              {item.popular && <Badge variant="outline" className="text-xs h-5">Popular</Badge>}
                              {item.vegetarian && <Badge variant="outline" className="text-xs h-5 text-green-600">🌱</Badge>}
                              {item.spicy && <Badge variant="outline" className="text-xs h-5 text-red-600">🌶️</Badge>}
                            </div>
                          </div>
                          
                          <div className="text-right ml-2">
                            <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {filteredItems.length === 0 && (
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground text-sm">
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
      ) : activeTab === "about" ? (
        <div className="px-4 pt-4 space-y-4">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <AboutShop shop={shop} themeColor={theme.primary} />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <CustomerRating />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">Transform Your Restaurant</h2>
                  <p className="text-sm text-muted-foreground">Join thousands of restaurants using our digital menu platform</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      📊
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Boost Revenue</h3>
                      <p className="text-xs text-muted-foreground">Increase orders by 35% with instant menu access and real-time updates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      💰
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Cut Costs</h3>
                      <p className="text-xs text-muted-foreground">Save on printing costs and reduce staff workload with contactless ordering</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      📱
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">QR Code Magic</h3>
                      <p className="text-xs text-muted-foreground">Customers scan once and access your full menu instantly on any device</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      📈
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Smart Analytics</h3>
                      <p className="text-xs text-muted-foreground">Track menu views, popular items, and customer behavior to optimize sales</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      🎨
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Brand Your Way</h3>
                      <p className="text-xs text-muted-foreground">Customize themes, colors, and layout to match your restaurant's identity</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Instant Updates</h3>
                      <p className="text-xs text-muted-foreground">Change prices, add specials, or update availability in real-time</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-xl text-center">
                  <h3 className="font-semibold mb-2 text-sm">Ready to Go Digital?</h3>
                  <p className="text-xs text-muted-foreground mb-3">Start with our free plan and upgrade as you grow</p>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>✓ Free Plan Available</span>
                    <span>✓ No Setup Fees</span>
                    <span>✓ 24/7 Support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </main>

      {/* Bottom Navigation - Mobile App Style */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t">
        <div className="flex">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all ${
              activeTab === "menu"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <UtensilsCrossed className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Menu</span>
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all ${
              activeTab === "about"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Info className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">About</span>
          </button>
          <button
            onClick={() => setActiveTab("digital-menu")}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all ${
              activeTab === "digital-menu"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Globe className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Digital</span>
          </button>
        </div>
      </div>

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
