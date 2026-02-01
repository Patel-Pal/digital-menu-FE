import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  CheckCircle,
  CreditCard,
  BarChart3,
  Calendar,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { billingService } from '@/services/billingService';
import { useAuth } from '@/contexts/AuthContext';
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
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const ENHANCED_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald  
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
];

export function BillingAnalyticsPage() {
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState(30);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [period, days]);

  const fetchAnalytics = async () => {
    if (!user?.shopId) return;

    try {
      setLoading(true);
      const response = await billingService.getBillingAnalytics(user.shopId, period, days);
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Failed to fetch billing analytics:', error);
      
      // Set default empty data if API fails
      const demoData = {
        summary: {
          totalRevenue: 1250.50,
          totalBills: 15,
          paidBills: 12,
          pendingBills: 3,
          avgBillAmount: 104.21,
          paymentRate: "80.0"
        },
        chartData: [
          { date: '2024-01-01', totalBills: 5, paidBills: 4, revenue: 420.50, avgAmount: 105.13 },
          { date: '2024-01-02', totalBills: 3, paidBills: 3, revenue: 315.75, avgAmount: 105.25 },
          { date: '2024-01-03', totalBills: 7, paidBills: 5, revenue: 514.25, avgAmount: 102.85 }
        ],
        paymentMethods: { cash: 8, card: 3, upi: 1 },
        topItems: [
          { name: 'Margherita Pizza', quantity: 8, revenue: 320.00 },
          { name: 'Chicken Burger', quantity: 5, revenue: 275.50 },
          { name: 'Caesar Salad', quantity: 6, revenue: 180.00 }
        ],
        period: period,
        dateRange: {
          startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }
      };
      
      setAnalytics(demoData);
      
      toast.error('Using demo data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (period === 'daily') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === 'weekly') {
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const paymentMethodData = analytics ? Object.entries(analytics.paymentMethods).map(([method, count]) => ({
    name: method.toUpperCase(),
    value: count,
    percentage: ((count / analytics.summary.paidBills) * 100).toFixed(1)
  })) : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Failed to load analytics data</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Billing Analytics 📊</h1>
            <p className="text-muted-foreground">Revenue insights and performance metrics</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Period Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Period:</span>
                </div>
                <div className="flex gap-2">
                  {['daily', 'weekly', 'monthly'].map((p) => (
                    <Button
                      key={p}
                      variant={period === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPeriod(p as any)}
                      className="capitalize"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <select 
                value={days} 
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-1 border rounded-lg text-sm bg-background"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(analytics.summary.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Bills</p>
                <p className="text-xl font-bold">{analytics.summary.totalBills}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">+8.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Avg Bill</p>
                <p className="text-xl font-bold">{formatCurrency(analytics.summary.avgBillAmount)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDown className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">-2.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Payment Rate</p>
                <p className="text-xl font-bold">{analytics.summary.paymentRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+5.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                Revenue Trend
              </CardTitle>
              <p className="text-green-100 text-sm mt-1">Track your earnings over time</p>
            </div>
            <CardContent className="p-0">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981"/>
                        <stop offset="100%" stopColor="#059669"/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      fontSize={12}
                      stroke="#64748b"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value}`} 
                      fontSize={12}
                      stroke="#64748b"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={formatDate}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        color: '#1f2937',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: '600' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="url(#strokeGradient)"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bills Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Receipt className="h-4 w-4" />
                </div>
                Bills Overview
              </CardTitle>
              <p className="text-blue-100 text-sm mt-1">Monitor bill generation & payments</p>
            </div>
            <CardContent className="p-0">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.chartData} barGap={10}>
                    <defs>
                      <linearGradient id="totalBillsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6"/>
                        <stop offset="100%" stopColor="#1d4ed8"/>
                      </linearGradient>
                      <linearGradient id="paidBillsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981"/>
                        <stop offset="100%" stopColor="#059669"/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      fontSize={12}
                      stroke="#64748b"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      fontSize={12} 
                      stroke="#64748b"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      labelFormatter={formatDate}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        color: '#1f2937',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: '600' }}
                    />
                    <Bar 
                      dataKey="totalBills" 
                      fill="url(#totalBillsGradient)" 
                      name="Total Bills" 
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar 
                      dataKey="paidBills" 
                      fill="url(#paidBillsGradient)" 
                      name="Paid Bills" 
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                Payment Methods
              </CardTitle>
              <p className="text-purple-100 text-sm mt-1">Customer payment preferences</p>
            </div>
            <CardContent className="p-4">
              <div className="space-y-6">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <defs>
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1"/>
                        </filter>
                      </defs>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        filter="url(#shadow)"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={ENHANCED_COLORS[index % ENHANCED_COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          color: '#1f2937',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: '600' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{analytics.summary.paidBills}</p>
                      <p className="text-xs text-muted-foreground">Total Payments</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethodData.map((method, index) => (
                    <div key={method.name} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm" 
                          style={{ backgroundColor: ENHANCED_COLORS[index % ENHANCED_COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{method.name}</span>
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs font-semibold">
                        {method.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topItems.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
