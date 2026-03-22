import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, DollarSign, Receipt, CheckCircle, CreditCard,
  BarChart3, Calendar, RefreshCw, ArrowUp, ArrowDown,
} from 'lucide-react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { billingService } from '@/services/billingService';
import { useAuth } from '@/contexts/AuthContext';
import { useMenuTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface BillingAnalytics {
  summary: {
    totalRevenue: number;
    totalBills: number;
    paidBills: number;
    pendingBills: number;
    avgBillAmount: number;
    paymentRate: string;
  };
  chartData: Array<{
    date: string;
    totalBills: number;
    paidBills: number;
    revenue: number;
    avgAmount: number;
  }>;
  paymentMethods: Record<string, number>;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  period: string;
  dateRange: { startDate: string; endDate: string };
}

/** Convert HSL string like "16 85% 58%" to hex */
function hslToHex(hslStr: string): string {
  const parts = hslStr.replace(/%/g, '').split(/\s+/).map(Number);
  const h = parts[0] / 360;
  const s = parts[1] / 100;
  const l = parts[2] / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/** Generate a palette of colors derived from primary and accent */
function generatePalette(primary: string, accent: string): string[] {
  const pHex = hslToHex(primary);
  const aHex = hslToHex(accent);
  // Shift hue for additional variety
  const parts = primary.replace(/%/g, '').split(/\s+/).map(Number);
  const h = parts[0], s = parts[1], l = parts[2];
  return [
    pHex,
    aHex,
    hslToHex(`${(h + 120) % 360} ${s}% ${l}%`),
    hslToHex(`${(h + 240) % 360} ${s}% ${l}%`),
    hslToHex(`${(h + 60) % 360} ${Math.max(s - 10, 30)}% ${Math.min(l + 10, 70)}%`),
    hslToHex(`${(h + 180) % 360} ${Math.max(s - 15, 30)}% ${Math.min(l + 5, 65)}%`),
  ];
}

export function BillingAnalyticsPage() {
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState(30);
  const { user } = useAuth();
  const { getThemeStyles, appMode } = useMenuTheme();

  const themeStyles = getThemeStyles();
  const primaryHex = hslToHex(themeStyles.primary);
  const accentHex = hslToHex(themeStyles.accent);
  const palette = useMemo(() => generatePalette(themeStyles.primary, themeStyles.accent), [themeStyles.primary, themeStyles.accent]);
  const isDark = appMode === 'dark';

  const muiTheme = useMemo(() => createTheme({
    palette: { mode: isDark ? 'dark' : 'light' },
    components: {
      MuiPopper: {
        styleOverrides: {
          root: {
            '& .MuiChartsTooltip-root': {
              backgroundColor: isDark ? '#1e293b !important' : '#ffffff !important',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
            },
            '& .MuiChartsTooltip-table': { color: isDark ? '#e2e8f0' : '#1e293b' },
            '& .MuiChartsTooltip-cell': { color: isDark ? '#e2e8f0' : '#1e293b', borderColor: isDark ? '#334155' : '#e2e8f0' },
            '& .MuiChartsTooltip-labelCell': { color: isDark ? '#94a3b8' : '#64748b' },
            '& .MuiChartsTooltip-valueCell': { color: isDark ? '#e2e8f0' : '#1e293b' },
            '& .MuiChartsTooltip-mark': { borderColor: isDark ? '#334155' : '#e2e8f0' },
          },
        },
      },
    },
  }), [isDark]);

  const chartSx = useMemo(() => ({
    '.MuiChartsAxis-tickLabel': { fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 },
    '.MuiChartsAxis-line': { stroke: 'transparent' },
    '.MuiChartsAxis-tick': { stroke: 'transparent' },
    '.MuiChartsGrid-line': { stroke: isDark ? '#334155' : '#e2e8f0', strokeDasharray: '4 4' },
    '.MuiChartsLegend-label': { fill: `${isDark ? '#94a3b8' : '#64748b'} !important`, fontSize: '12px !important' },
  }), [isDark]);

  useEffect(() => { fetchAnalytics(); }, [period, days]);

  const fetchAnalytics = async () => {
    if (!user?.shopId) return;
    try {
      setLoading(true);
      const response = await billingService.getBillingAnalytics(user.shopId, period, days);
      setAnalytics(response.data);
    } catch {
      const demoData: BillingAnalytics = {
        summary: { totalRevenue: 1250.5, totalBills: 15, paidBills: 12, pendingBills: 3, avgBillAmount: 104.21, paymentRate: '80.0' },
        chartData: [
          { date: '2024-01-01', totalBills: 5, paidBills: 4, revenue: 420.5, avgAmount: 105.13 },
          { date: '2024-01-02', totalBills: 3, paidBills: 3, revenue: 315.75, avgAmount: 105.25 },
          { date: '2024-01-03', totalBills: 7, paidBills: 5, revenue: 514.25, avgAmount: 102.85 },
        ],
        paymentMethods: { cash: 8, card: 3, upi: 1 },
        topItems: [
          { name: 'Margherita Pizza', quantity: 8, revenue: 320 },
          { name: 'Chicken Burger', quantity: 5, revenue: 275.5 },
          { name: 'Caesar Salad', quantity: 6, revenue: 180 },
        ],
        period,
        dateRange: { startDate: new Date(Date.now() - days * 86400000).toISOString(), endDate: new Date().toISOString() },
      };
      setAnalytics(demoData);
      toast.error('Using demo data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  /** Calculate % change comparing first half vs second half of chart data */
  const calcTrend = (extractor: (d: BillingAnalytics['chartData'][0]) => number): { change: string; up: boolean } => {
    if (!analytics || analytics.chartData.length < 2) return { change: '0.0%', up: true };
    const data = analytics.chartData;
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid);
    const secondHalf = data.slice(mid);
    const firstSum = firstHalf.reduce((s, d) => s + extractor(d), 0);
    const secondSum = secondHalf.reduce((s, d) => s + extractor(d), 0);
    if (firstSum === 0) return { change: secondSum > 0 ? '+100%' : '0.0%', up: secondSum >= 0 };
    const pct = ((secondSum - firstSum) / firstSum) * 100;
    return { change: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, up: pct >= 0 };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (period === 'daily') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (period === 'weekly') return `Wk ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const paymentMethodData = analytics
    ? Object.entries(analytics.paymentMethods).map(([method, count], i) => ({
        id: i, value: count, label: method.toUpperCase(), color: palette[i % palette.length],
      }))
    : [];

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <p>Failed to load analytics data</p>
        <Button onClick={fetchAnalytics} className="mt-4"><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    );
  }

  const xLabels = analytics.chartData.map((d) => formatDate(d.date));
  const revenueData = analytics.chartData.map((d) => d.revenue);
  const totalBillsData = analytics.chartData.map((d) => d.totalBills);
  const paidBillsData = analytics.chartData.map((d) => d.paidBills);

  const revenueTrend = calcTrend((d) => d.revenue);
  const billsTrend = calcTrend((d) => d.totalBills);
  const avgTrend = calcTrend((d) => d.avgAmount);
  const paymentRateTrend = calcTrend((d) => d.totalBills > 0 ? (d.paidBills / d.totalBills) * 100 : 0);

  return (
    <ThemeProvider theme={muiTheme}>
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Revenue insights and performance metrics</p>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-2">
            <RefreshCw className="h-4 w-4" />Refresh
          </Button>
        </div>
      </motion.div>

      {/* Period Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Period:</span>
                </div>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                    <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)} className="capitalize">{p}</Button>
                  ))}
                </div>
              </div>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-3 py-1 border rounded-lg text-sm bg-background w-full sm:w-auto">
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, bg: 'bg-green-100', iconColor: 'text-green-600', label: 'Total Revenue', value: formatCurrency(analytics.summary.totalRevenue), ...revenueTrend },
          { icon: Receipt, bg: 'bg-blue-100', iconColor: 'text-blue-600', label: 'Total Bills', value: analytics.summary.totalBills, ...billsTrend },
          { icon: BarChart3, bg: 'bg-purple-100', iconColor: 'text-purple-600', label: 'Avg Bill', value: formatCurrency(analytics.summary.avgBillAmount), ...avgTrend },
          { icon: CheckCircle, bg: 'bg-orange-100', iconColor: 'text-orange-600', label: 'Payment Rate', value: `${analytics.summary.paymentRate}%`, ...paymentRateTrend },
        ].map((card) => (
          <Card key={card.label} variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.up ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />}
                    <span className={`text-xs font-medium ${card.up ? 'text-green-600' : 'text-red-600'}`}>{card.change}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend - Line/Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card variant="elevated">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Revenue Trend
              </CardTitle>
              <p className="text-muted-foreground text-sm">Track your earnings over time</p>
            </CardHeader>
            <CardContent className="p-2">
              <LineChart
                height={300}
                series={[{
                  data: revenueData,
                  label: 'Revenue',
                  color: primaryHex,
                  area: true,
                  showMark: true,
                }]}
                xAxis={[{ data: xLabels, scaleType: 'point' }]}
                yAxis={[{ valueFormatter: (v: number) => `₹${v}` }]}
                sx={{
                  '.MuiLineElement-root': { strokeWidth: 3 },
                  '.MuiAreaElement-root': { fillOpacity: 0.15 },
                  ...chartSx,
                }}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Bills Overview - Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card variant="elevated">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4 text-blue-500" />
                Bills Overview
              </CardTitle>
              <p className="text-muted-foreground text-sm">Monitor bill generation & payments</p>
            </CardHeader>
            <CardContent className="p-2">
              <BarChart
                height={300}
                series={[
                  { data: totalBillsData, label: 'Total Bills', color: primaryHex },
                  { data: paidBillsData, label: 'Paid Bills', color: accentHex },
                ]}
                xAxis={[{ data: xLabels, scaleType: 'band' }]}
                sx={chartSx}
                grid={{ horizontal: true }}
                borderRadius={8}
                slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods - Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card variant="elevated">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-purple-500" />
                Payment Methods
              </CardTitle>
              <p className="text-muted-foreground text-sm">Customer payment preferences</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <PieChart
                  height={260}
                  series={[{
                    data: paymentMethodData,
                    innerRadius: 60,
                    outerRadius: 100,
                    paddingAngle: 3,
                    cornerRadius: 6,
                    highlightScope: { fade: 'global', highlight: 'item' },
                  }]}
                  slotProps={{
                    legend: {
                      position: { vertical: 'bottom', horizontal: 'center' as const },
                    },
                  }}
                  sx={{
                    '.MuiChartsLegend-mark': { rx: 6 },
                    ...chartSx,
                  }}
                />
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethodData.map((method) => (
                    <div key={method.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all">
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: method.color }} />
                      <span className="text-sm font-medium">{method.label}</span>
                      <Badge variant="outline" className="ml-auto text-xs font-semibold">
                        {analytics.summary.paidBills > 0 ? ((method.value / analytics.summary.paidBills) * 100).toFixed(1) : 0}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card variant="elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topItems.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                    </div>
                    <p className="font-bold text-sm">{formatCurrency(item.revenue)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </ThemeProvider>
  );
}
