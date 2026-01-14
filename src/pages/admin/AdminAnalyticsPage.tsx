import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, QrCode, Eye, X } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

export function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7");
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [hoveredData, setHoveredData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnalytics(period);
      setAnalytics(response.data);
    } catch (error) {
      toast.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (type: string, title: string, data: any[], colorClass: string, isModal = false) => {
    const maxValue = Math.max(...data.map((d: any) => 
      type === 'weekly' ? d.scans : 
      type === 'scans' ? d.totalScans : d.totalViews
    ), 1);

    return (
      <div className={`flex items-end gap-${isModal ? '4' : '2'} ${isModal ? 'h-80' : 'h-48'}`}>
        {data.map((item: any, i: number) => {
          const value = type === 'weekly' ? item.scans : 
                       type === 'scans' ? item.totalScans : item.totalViews;
          const height = (value / maxValue) * (isModal ? 280 : 150);
          const label = type === 'weekly' ? item.day : 
                       new Date(item._id).toLocaleDateString('en', { weekday: 'short' });
          
          return (
            <div 
              key={i} 
              className="flex-1 flex flex-col items-center gap-2 relative"
              onMouseEnter={() => setHoveredData({ value, label, type: title })}
              onMouseLeave={() => setHoveredData(null)}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}px` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`w-full rounded-t-md ${colorClass} cursor-pointer`}
              />
              <span className={`${isModal ? 'text-sm' : 'text-xs'} text-muted-foreground`}>
                {label}
              </span>
              {hoveredData && hoveredData.label === label && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-12 bg-popover text-popover-foreground px-2 py-1 rounded text-xs shadow-lg border z-10"
                >
                  {hoveredData.value} {type === 'scans' ? 'scans' : type === 'views' ? 'views' : 'scans'}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalScans = analytics?.dailyData?.reduce((sum: number, day: any) => sum + day.totalScans, 0) || 0;
  const totalViews = analytics?.dailyData?.reduce((sum: number, day: any) => sum + day.totalViews, 0) || 0;
  const totalVisitors = analytics?.dailyData?.reduce((sum: number, day: any) => sum + day.uniqueVisitors, 0) || 0;

  // Prepare weekly data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = analytics?.dailyData?.find((d: any) => d._id === dateStr);
    return {
      scans: dayData?.totalScans || 0,
      day: ['S','M','T','W','T','F','S'][date.getDay()]
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform-wide performance metrics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Scans" 
          value={totalScans.toLocaleString()} 
          change={`Last ${period} days`} 
          changeType="positive" 
          icon={<QrCode className="h-5 w-5" />} 
        />
        <StatCard 
          title="Menu Views" 
          value={totalViews.toLocaleString()} 
          change={`Last ${period} days`} 
          changeType="positive" 
          icon={<Eye className="h-5 w-5" />} 
        />
        <StatCard 
          title="Unique Visitors" 
          value={totalVisitors.toLocaleString()} 
          change={`Last ${period} days`} 
          changeType="positive" 
          icon={<Users className="h-5 w-5" />} 
        />
        <StatCard 
          title="Avg. Daily Scans" 
          value={Math.round(totalScans / parseInt(period)).toString()} 
          change="Per day" 
          changeType="positive" 
          icon={<TrendingUp className="h-5 w-5" />} 
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card variant="elevated" className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedChart('weekly')}>
          <CardHeader><CardTitle>Weekly Overview</CardTitle></CardHeader>
          <CardContent>
            {renderChart('weekly', 'Weekly Overview', weeklyData, 'bg-primary')}
          </CardContent>
        </Card>

        <Card variant="elevated" className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedChart('scans')}>
          <CardHeader><CardTitle>Daily Scans</CardTitle></CardHeader>
          <CardContent>
            {renderChart('scans', 'Daily Scans', analytics?.dailyData || [], 'bg-primary')}
          </CardContent>
        </Card>

        <Card variant="elevated" className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedChart('views')}>
          <CardHeader><CardTitle>Daily Views</CardTitle></CardHeader>
          <CardContent>
            {renderChart('views', 'Daily Views', analytics?.dailyData || [], 'bg-accent')}
          </CardContent>
        </Card>
      </div>

      {/* Chart Modal */}
      <Dialog open={!!selectedChart} onOpenChange={() => setSelectedChart(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedChart === 'weekly' ? 'Weekly Overview' : 
               selectedChart === 'scans' ? 'Daily Scans' : 'Daily Views'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8">
            {selectedChart === 'weekly' && renderChart('weekly', 'Weekly Overview', weeklyData, 'bg-primary', true)}
            {selectedChart === 'scans' && renderChart('scans', 'Daily Scans', analytics?.dailyData || [], 'bg-primary', true)}
            {selectedChart === 'views' && renderChart('views', 'Daily Views', analytics?.dailyData || [], 'bg-accent', true)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Performing Shops */}
      <Card variant="elevated">
        <CardHeader><CardTitle>Top Performing Shops</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {analytics?.topShops?.slice(0, 10).map((shop: any, index: number) => (
            <div key={shop._id} className="flex items-center gap-4">
              <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                {shop.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{shop.name}</p>
                <p className="text-sm text-muted-foreground">
                  {shop.qrScans?.toLocaleString() || 0} scans • {shop.menuViews?.toLocaleString() || 0} views
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium capitalize">{shop.type || 'restaurant'}</p>
                <p className="text-xs text-muted-foreground">{shop.subscription}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
