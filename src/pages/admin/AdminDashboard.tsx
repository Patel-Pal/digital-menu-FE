import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard stats");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Shops" 
          value={stats?.totalShops?.toString() || "0"} 
          change={`${stats?.activeShops || 0} active`} 
          changeType="positive" 
          icon={<Store className="h-5 w-5" />} 
        />
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers?.toString() || "0"} 
          change="All users" 
          changeType="positive" 
          icon={<Users className="h-5 w-5" />} 
        />
        <StatCard 
          title="Total Scans" 
          value={stats?.totalScans?.toLocaleString() || "0"} 
          change="QR code scans" 
          changeType="positive" 
          icon={<CreditCard className="h-5 w-5" />} 
        />
        <StatCard 
          title="Menu Views" 
          value={stats?.totalViews?.toLocaleString() || "0"} 
          change="Total views" 
          changeType="positive" 
          icon={<TrendingUp className="h-5 w-5" />} 
        />
      </div>

      {/* Subscription Distribution & Recent Shops */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader><CardTitle>Subscription Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.subscriptionStats?.map((sub: any) => (
                <div key={sub._id} className="flex items-center justify-between">
                  <span className="capitalize font-medium">{sub._id}</span>
                  <Badge variant={sub._id === 'premium' ? 'default' : sub._id === 'basic' ? 'secondary' : 'outline'}>
                    {sub.count} shops
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader><CardTitle>Recent Shops</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {stats?.recentShops?.map((shop: any) => (
              <div key={shop._id} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {shop.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{shop.name}</p>
                  <p className="text-sm text-muted-foreground">{shop.qrScans} scans</p>
                </div>
                <Badge variant={shop.isActive ? "success" : "secondary"}>
                  {shop.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
