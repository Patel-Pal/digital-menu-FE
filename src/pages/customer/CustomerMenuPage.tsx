import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Globe, ChevronDown, UtensilsCrossed, Info, ShoppingCart, Plus, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { AboutDigitalMenu } from "@/components/AboutDigitalMenu";
import { AboutShop } from "@/components/AboutShop";
import { CustomerRating } from "@/components/CustomerRating";
import { OrderModal } from "@/components/OrderModal";
import { CustomerBillHistory } from "@/components/CustomerBillHistory";
import { UnbilledOrders } from "@/components/UnbilledOrders";
import { BillGenerationModal } from "@/components/BillGenerationModal";
import { menuItemService } from "@/services/menuItemService";
import { categoryService, type Category } from "@/services/categoryService";
import { shopService, type Shop } from "@/services/shopService";
import { useMenuTheme, menuThemes, MenuTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { type MenuItem } from "@/types";
import { toast } from "sonner";

type ViewTab = "menu" | "orders" | "about" | "digital-menu";

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
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  
  const { menuTheme, setMenuTheme } = useMenuTheme();
  const theme = menuThemes[menuTheme];
  const { user } = useAuth();
  const { cart, addToCart, getTotalItems } = useOrder();
  
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
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold">
              🍽️
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg">{shop?.name || "Digital Menu"}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>⭐ {shop?.rating || "4.8"}</span>
                <span>🕒 30-45 min</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">{activeTab === "menu" ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground border border-border"
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
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items */}
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedItem(item)}
                className="cursor-pointer"
              >
                <Card className="border-0 shadow-sm bg-card rounded-xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="mt-4 p-1 w-20 h-20 bg-muted flex items-center justify-center overflow-hidden rounded-lg flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover block"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement.innerHTML = '<span class="text-2xl">🍽️</span>';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">🍽️</span>
                        )}
                      </div>
                      
                      <div className="flex-1 p-2">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold leading-tight">{item.name}</h3>
                          <span className="font-bold text-primary ml-2">₹{item.price.toFixed(2)}</span>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {item.popular && <Badge className="text-xs h-5 bg-orange-100 text-orange-600 border-orange-200">Popular</Badge>}
                            {item.vegetarian && <Badge className="text-xs h-5 bg-green-100 text-green-600 border-green-200">🌱</Badge>}
                            {item.spicy && <Badge className="text-xs h-5 bg-red-100 text-red-600 border-red-200">🌶️</Badge>}
                          </div>
                          
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                              toast.success(`${item.name} added to cart!`);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {filteredItems.length === 0 && (
              <Card className="border-0 shadow-sm bg-card rounded-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
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
      ) : activeTab === "orders" ? (
        <div className="space-y-4">
          {/* Generate Bill Button */}
          <Card className="border-0 shadow-sm bg-card rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Ready to Pay?</h3>
                  <p className="text-sm text-muted-foreground">Generate bill for all completed orders</p>
                </div>
                <Button
                  onClick={() => setShowBillModal(true)}
                  className="flex items-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Generate Bill
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Orders and Bills Tabs */}
          <Tabs defaultValue="bills" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="orders">Pending Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="bills" className="mt-4">
              <CustomerBillHistory shopId={currentShopId} />
            </TabsContent>
            <TabsContent value="orders" className="mt-4">
              <UnbilledOrders shopId={currentShopId} />
            </TabsContent>
          </Tabs>
        </div>
      ) : activeTab === "about" ? (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm bg-card rounded-xl">
            <CardContent className="p-6">
              <AboutShop shop={shop} themeColor={theme.primary} />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card rounded-xl">
            <CardContent className="p-6">
              <CustomerRating themeColor={""} shopName={""} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-0 shadow-sm bg-card rounded-xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Transform Your Restaurant</h2>
              <p className="text-sm text-muted-foreground">Join thousands of restaurants using our digital menu platform</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  📊
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Boost Revenue</h3>
                  <p className="text-xs text-muted-foreground">Increase orders by 35% with instant menu access</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  💰
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Cut Costs</h3>
                  <p className="text-xs text-muted-foreground">Save on printing costs and reduce staff workload</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  📱
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm">QR Code Magic</h3>
                  <p className="text-xs text-muted-foreground">Customers scan once and access your full menu instantly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t safe-area-pb">
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
            onClick={() => setActiveTab("orders")}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all relative ${
              activeTab === "orders"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 mb-1" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[16px] border border-background">
                  {getTotalItems() > 99 ? '99+' : getTotalItems()}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Orders</span>
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

      {/* Floating Order Button */}
      {getTotalItems() > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <Button
            onClick={() => setShowOrderModal(true)}
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 relative"
            size="lg"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center min-w-[20px] border-2 border-background">
              {getTotalItems() > 99 ? '99+' : getTotalItems()}
            </span>
          </Button>
        </motion.div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        shopId={currentShopId}
      />

      {/* Bill Generation Modal */}
      <BillGenerationModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        shopId={currentShopId}
        tableNumber={shop?.name || "1"}
      />
    </div>
  );
}
