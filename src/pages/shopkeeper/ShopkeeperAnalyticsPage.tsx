import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { mockAnalytics } from "@/utils/mockData";
import { Eye, QrCode, TrendingUp, Users } from "lucide-react";

export function ShopkeeperAnalyticsPage() {
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
          value="1,234"
          change="+12%"
          changeType="positive"
          icon={<QrCode className="h-5 w-5" />}
        />
        <StatCard
          title="Menu Views"
          value="3,456"
          change="+8%"
          changeType="positive"
          icon={<Eye className="h-5 w-5" />}
        />
        <StatCard
          title="Unique Visitors"
          value="987"
          change="+15%"
          changeType="positive"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Avg. Time"
          value="2m 34s"
          change="+5%"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </motion.div>

      {/* Chart Placeholder */}
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
              {mockAnalytics.map((data, index) => (
                <div
                  key={data.date}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full space-y-1">
                    <div
                      className="w-full rounded-t-md bg-primary"
                      style={{ height: `${(data.scans / 150) * 100}px` }}
                    />
                    <div
                      className="w-full rounded-t-md bg-accent/50"
                      style={{ height: `${(data.views / 400) * 50}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))}
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
            {[
              { name: "Butter Chicken", views: 234, percentage: 100 },
              { name: "Margherita Pizza", views: 198, percentage: 85 },
              { name: "Classic Cheeseburger", views: 156, percentage: 67 },
              { name: "Chocolate Lava Cake", views: 123, percentage: 53 },
            ].map((item, index) => (
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
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Device Breakdown */}
      <motion.div
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
                <div className="text-3xl font-bold text-primary">78%</div>
                <p className="text-sm text-muted-foreground">Mobile</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">18%</div>
                <p className="text-sm text-muted-foreground">Tablet</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">4%</div>
                <p className="text-sm text-muted-foreground">Desktop</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
