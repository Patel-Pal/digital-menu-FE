import { motion } from "framer-motion";
import { QrCode, Eye, TrendingUp, Star, ArrowRight, Plus, BarChart3, ShoppingBag, Receipt, UtensilsCrossed, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { shopService, type Shop } from "@/services/shopService";
import { menuItemService, type MenuItem } from "@/services/menuItemService";
import { billingService } from "@/services/billingService";
import { useAnalytics } from "@/contexts/AnalyticsContext";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function ShopkeeperDashboard() {
  const { user } = useAuth();
  const { analytics } = useAnalytics();
  const [shop, setShop] = useState<Shop | null>(null);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopResponse = await shopService.getShopProfile();
        setShop(shopResponse.data);
        
        // Use user.shopId to fetch menu items (this is how they're stored)
        if (user?.shopId) {
          const menuResponse = await menuItemService.getMenuItemsByShop(user.shopId);
          setPopularItems(menuResponse.data?.slice(0, 3) || []);

          // Fetch today's revenue from paid bills
          try {
            const billsResponse = await billingService.getShopBills(user.shopId, 'paid', 1, 100);
            const today = new Date().toDateString();
            const todayBills = (billsResponse.data || []).filter(
              (b: any) => new Date(b.createdAt).toDateString() === today
            );
            setTodayRevenue(todayBills.reduce((sum: number, b: any) => sum + b.totalAmount, 0));
          } catch (e) {
            // billing may not be available
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold">{getGreeting()}, {user?.name}! 👋</h1>
        <p className="text-muted-foreground">Here's how {shop?.name || "your menu"} is performing</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="gradient" className="overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">QR Code Scans</p>
              <p className="text-2xl font-bold">{analytics.totalScans.toLocaleString()}</p>
              <p className="text-xs text-success font-medium">{analytics.scansChange}</p>
            </div>
            <Link to="/shop/qr">
              <div className="h-20 w-20 rounded-xl bg-background flex items-center justify-center shadow-md">
                <QrCode className="h-12 w-12 text-foreground" />
              </div>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatCard
          title="Menu Views"
          value={analytics.menuViews.toLocaleString()}
          change={analytics.viewsChange}
          changeType="positive"
          icon={<Eye className="h-5 w-5" />}
        />
        <StatCard
          title="Menu Items"
          value={popularItems.length.toString()}
          change={`${popularItems.length} items available`}
          changeType="neutral"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${todayRevenue.toFixed(2)}`}
          change="From paid bills today"
          changeType={todayRevenue > 0 ? "positive" : "neutral"}
          icon={<IndianRupee className="h-5 w-5" />}
          className="col-span-2"
        />
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-3 gap-3"
      >
        <Link to="/shop/menu">
          <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
            <UtensilsCrossed className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Add Item</p>
          </Card>
        </Link>
        <Link to="/shop/orders">
          <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
            <ShoppingBag className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">View Orders</p>
          </Card>
        </Link>
        <Link to="/shop/billing">
          <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
            <Receipt className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Generate Bill</p>
          </Card>
        </Link>
      </motion.div>

      {/* Subscription Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated" className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">
                  {shop?.subscription?.charAt(0).toUpperCase() + shop?.subscription?.slice(1) || "Free"} Plan
                </Badge>
                <p className="text-sm opacity-90">Manage your subscription</p>
              </div>
              <Link to="/shop/settings">
                <Button variant="secondary" size="sm">
                  Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Popular Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Menu Items</CardTitle>
              <Link to="/shop/menu" className="text-sm text-primary font-medium flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularItems.length > 0 ? (
              popularItems.map((item, index) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{item.rating || "4.8"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No menu items yet</p>
                <Link to="/shop/menu">
                  <Button variant="outline" size="sm" className="mt-2">
                    Add Items
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* FAB */}
      <Link to="/shop/menu">
        <Button
          className="fab fixed bottom-24 right-4 shadow-glow"
          size="icon-lg"
          variant="gradient"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
