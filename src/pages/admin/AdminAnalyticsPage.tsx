import { motion } from "framer-motion";
import { TrendingUp, Users, QrCode, Eye } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAnalytics } from "@/utils/mockData";

export function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform-wide performance metrics</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Scans" value="45,678" change="+23%" changeType="positive" icon={<QrCode className="h-5 w-5" />} />
        <StatCard title="Menu Views" value="123,456" change="+18%" changeType="positive" icon={<Eye className="h-5 w-5" />} />
        <StatCard title="Active Users" value="2,345" change="+8%" changeType="positive" icon={<Users className="h-5 w-5" />} />
        <StatCard title="Avg. Session" value="3m 24s" change="+12%" changeType="positive" icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader><CardTitle>Weekly Scans</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {mockAnalytics.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.scans / 150) * 150}px` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-md bg-primary"
                  />
                  <span className="text-xs text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader><CardTitle>Weekly Views</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {mockAnalytics.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.views / 350) * 150}px` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-md bg-accent"
                  />
                  <span className="text-xs text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card variant="elevated">
        <CardHeader><CardTitle>Top Performing Shops</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Pizza Paradise", scans: 2341, growth: "+34%" },
            { name: "The Rustic Kitchen", scans: 1234, growth: "+28%" },
            { name: "Spice Garden", scans: 856, growth: "+15%" },
          ].map((shop, index) => (
            <div key={shop.name} className="flex items-center gap-4">
              <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                {shop.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{shop.name}</p>
                <p className="text-sm text-muted-foreground">{shop.scans.toLocaleString()} scans</p>
              </div>
              <span className="text-success font-semibold">{shop.growth}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
