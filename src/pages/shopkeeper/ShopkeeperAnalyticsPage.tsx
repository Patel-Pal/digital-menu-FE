import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Eye, QrCode, TrendingUp, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { shopService } from "@/services/shopService";
import { PageLoader } from "@/components/PageLoader";

interface AnalyticsData {
  totalScans: number;
  menuViews: number;
  scansChange: string;
  viewsChange: string;
  uniqueVisitors: number;
  avgTime: string;
  weeklyData: Array<{
    date: string;
    scans: number;
    views: number;
  }>;
  topItems: Array<{
    name: string;
    views: number;
    percentage: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export function ShopkeeperAnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalScans: 0,
    menuViews: 0,
    scansChange: "+0%",
    viewsChange: "+0%",
    uniqueVisitors: 0,
    avgTime: "0m 0s",
    weeklyData: [],
    topItems: [],
    deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await shopService.getDetailedAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return <PageLoader message="Loading analytics..." />;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatCard
          title="Total Scans"
          value={analytics.totalScans.toLocaleString()}
          change={analytics.scansChange}
          changeType="positive"
          icon={<QrCode className="h-5 w-5" />}
        />
        <StatCard
          title="Menu Views"
          value={analytics.menuViews.toLocaleString()}
          change={analytics.viewsChange}
          changeType="positive"
          icon={<Eye className="h-5 w-5" />}
        />
        <StatCard
          title="Unique Visitors"
          value={analytics.uniqueVisitors.toLocaleString()}
          change="+15%"
          changeType="positive"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Avg. Time"
          value={analytics.avgTime}
          change="+5%"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {analytics.weeklyData.map((data, index) => {
                const maxScans = Math.max(...analytics.weeklyData.map(d => d.scans));
                const maxViews = Math.max(...analytics.weeklyData.map(d => d.views));
                
                return (
                  <div
                    key={data.date}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full space-y-1">
                      <div
                        className="w-full rounded-t-md bg-primary transition-all duration-500"
                        style={{ 
                          height: `${Math.max((data.scans / maxScans) * 120, 8)}px` 
                        }}
                      />
                      <div
                        className="w-full rounded-t-md bg-accent/50 transition-all duration-500"
                        style={{ 
                          height: `${Math.max((data.views / maxViews) * 60, 4)}px` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-primary" />
                <span className="text-xs text-muted-foreground">Scans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-accent/50" />
                <span className="text-xs text-muted-foreground">Views</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Most Viewed Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topItems.length > 0 ? (
              analytics.topItems.map((item, index) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.views} views</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No menu items data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Device Breakdown */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{analytics.deviceBreakdown.mobile}%</div>
                <p className="text-sm text-muted-foreground">Mobile</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{analytics.deviceBreakdown.tablet}%</div>
                <p className="text-sm text-muted-foreground">Tablet</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">{analytics.deviceBreakdown.desktop}%</div>
                <p className="text-sm text-muted-foreground">Desktop</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}
    </div>
  );
}
