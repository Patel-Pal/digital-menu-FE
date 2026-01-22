import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, TrendingUp, Users, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSubscriptions();
      setSubscriptions(response.data);
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalShops = subscriptions?.subscriptions?.length || 0;
  const premiumCount = subscriptions?.distribution?.find((d: any) => d._id === 'premium')?.count || 0;
  const basicCount = subscriptions?.distribution?.find((d: any) => d._id === 'basic')?.count || 0;
  const freeCount = subscriptions?.distribution?.find((d: any) => d._id === 'free')?.count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage plans and billing</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Monthly Revenue" 
          value={`$${subscriptions?.monthlyRevenue?.toFixed(2) || '0.00'}`} 
          change="Estimated" 
          changeType="positive" 
          icon={<DollarSign className="h-5 w-5" />} 
        />
        <StatCard 
          title="Active Subs" 
          value={subscriptions?.activeSubscriptions?.toString() || "0"} 
          change="Paid plans" 
          changeType="positive" 
          icon={<Users className="h-5 w-5" />} 
        />
        <StatCard 
          title="Premium Plans" 
          value={premiumCount.toString()} 
          change="Highest tier" 
          changeType="positive" 
          icon={<CreditCard className="h-5 w-5" />} 
        />
        <StatCard 
          title="Total Shops" 
          value={totalShops.toString()} 
          change="All plans" 
          changeType="positive" 
          icon={<TrendingUp className="h-5 w-5" />} 
        />
      </div>

      {/* Plan Distribution */}
      <Card variant="elevated">
        <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Premium</span>
                <span className="font-medium">{premiumCount} shops ({totalShops > 0 ? Math.round((premiumCount / totalShops) * 100) : 0}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary" 
                  style={{ width: `${totalShops > 0 ? (premiumCount / totalShops) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Basic</span>
                <span className="font-medium">{basicCount} shops ({totalShops > 0 ? Math.round((basicCount / totalShops) * 100) : 0}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-accent" 
                  style={{ width: `${totalShops > 0 ? (basicCount / totalShops) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Free</span>
                <span className="font-medium">{freeCount} shops ({totalShops > 0 ? Math.round((freeCount / totalShops) * 100) : 0}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-muted-foreground" 
                  style={{ width: `${totalShops > 0 ? (freeCount / totalShops) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Subscriptions */}
      <Card variant="elevated">
        <CardHeader><CardTitle>All Subscriptions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {subscriptions?.subscriptions?.map((shop: any, index: number) => {
            const prices: { [key: string]: number } = { free: 0, basic: 9.99, premium: 24.99, enterprise: 49.99 };
            const price = prices[shop.subscription] || 0;
            
            return (
              <motion.div
                key={shop._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="p-3 rounded-xl bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {shop.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium truncate">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">{shop.ownerId?.name} • {shop.ownerId?.email}</p>
                      </div>
                      <span className="font-bold shrink-0">₹{price.toFixed(2)}/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(shop.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={shop.subscription === "premium" ? "default" : shop.subscription === "basic" ? "secondary" : "outline"}>
                        {shop.subscription}
                      </Badge>
                      <Badge variant={shop.isActive ? "success" : "destructive"}>
                        {shop.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        {shop.type || 'restaurant'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
