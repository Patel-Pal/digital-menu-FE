import { motion } from "framer-motion";
import { Store, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockShops, mockAnalytics } from "@/utils/mockData";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Shops" value="156" change="+12 this month" changeType="positive" icon={<Store className="h-5 w-5" />} />
        <StatCard title="Active Users" value="2,345" change="+8%" changeType="positive" icon={<Users className="h-5 w-5" />} />
        <StatCard title="Revenue" value="$12,456" change="+15%" changeType="positive" icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="Total Scans" value="45,678" change="+23%" changeType="positive" icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {/* Chart & Recent Shops */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader><CardTitle>Weekly Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {mockAnalytics.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-primary" style={{ height: `${(data.scans / 150) * 150}px` }} />
                  <span className="text-xs text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader><CardTitle>Recent Shops</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {mockShops.slice(0, 4).map((shop) => (
              <div key={shop.id} className="flex items-center gap-3">
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
