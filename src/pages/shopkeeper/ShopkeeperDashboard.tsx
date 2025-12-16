import { motion } from "framer-motion";
import { QrCode, Eye, TrendingUp, Star, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { mockAnalytics, getPopularItems } from "@/utils/mockData";

export function ShopkeeperDashboard() {
  const popularItems = getPopularItems();

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold">Good Morning! 👋</h1>
        <p className="text-muted-foreground">Here's how your menu is performing</p>
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
              <p className="text-sm font-medium text-muted-foreground">Your QR Code</p>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-xs text-success font-medium">+12% this week</p>
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
          value="3,456"
          change="+8% from last week"
          changeType="positive"
          icon={<Eye className="h-5 w-5" />}
        />
        <StatCard
          title="Popular Items"
          value="12"
          change="2 trending now"
          changeType="neutral"
          icon={<TrendingUp className="h-5 w-5" />}
        />
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
                  Premium Plan
                </Badge>
                <p className="text-sm opacity-90">Your plan renews in 23 days</p>
              </div>
              <Link to="/shop/billing">
                <Button variant="secondary" size="sm">
                  Manage
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
              <CardTitle className="text-base">Popular Items</CardTitle>
              <Link to="/shop/menu" className="text-sm text-primary font-medium flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularItems.slice(0, 3).map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1 text-warning">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Activity Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {mockAnalytics.map((data, index) => (
                <div
                  key={data.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-md bg-primary/80"
                    style={{ height: `${(data.scans / 150) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {["M", "T", "W", "T", "F", "S", "S"][index]}
                  </span>
                </div>
              ))}
            </div>
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
