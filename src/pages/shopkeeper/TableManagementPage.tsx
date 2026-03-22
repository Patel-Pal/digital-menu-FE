import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Search, LayoutGrid, AlertCircle } from 'lucide-react';
import { TableData, TableFilterType, PaymentMethod, orderService } from '@/services/orderService';
import { billingService } from '@/services/billingService';
import { TableCard } from '@/components/TableCard';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotificationSoundSettings } from '@/contexts/NotificationSoundContext';
import { toast } from 'sonner';
import { SkeletonCard } from '@/components/SkeletonCard';

function filterTables(tables: TableData[], filter: TableFilterType): TableData[] {
  switch (filter) {
    case 'pending':
      return tables.filter((t) => t.orders.some((o) => o.status === 'pending'));
    case 'approved':
      return tables.filter((t) => t.orders.some((o) => o.status === 'approved'));
    default:
      return tables;
  }
}

function searchTables(tables: TableData[], query: string): TableData[] {
  if (!query.trim()) return tables;
  const q = query.toLowerCase();
  return tables.filter(
    (t) =>
      t.tableNumber.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q),
  );
}

const FILTER_LABELS: Record<TableFilterType, string> = {
  all: 'All Tables',
  pending: 'New Orders',
  approved: 'In Progress',
};

const FILTER_BADGE_COLORS: Record<TableFilterType, string> = {
  all: 'bg-gray-500',
  pending: 'bg-amber-500',
  approved: 'bg-blue-500',
};

const FILTERS: TableFilterType[] = ['all', 'pending', 'approved'];

export function TableManagementPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<TableFilterType>('all');
  const { user } = useAuth();
  const { playSound } = useNotificationSoundSettings();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchTables = useCallback(async () => {
    if (!user?.shopId) return;
    try {
      setError(null);
      const response = await orderService.getTableAggregation(user.shopId);
      setTables(response.data || []);
    } catch {
      setError('Failed to fetch table data');
    } finally {
      setLoading(false);
    }
  }, [user?.shopId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // WebSocket event handler
  const handleWebSocketEvent = useCallback(
    (event: string, data: any) => {
      if (event === 'new_order') {
        playSound();
        toast.success(`New order from ${data.customerName} — Table ${data.tableNumber}`);
        fetchTables();
      } else if (event === 'order_status_updated') {
        fetchTables();
      } else if (event === 'bill_generated') {
        playSound();
        toast.info(`Bill generated for Table ${data.tableNumber}`);
        fetchTables();
      } else if (event === 'payment_received') {
        playSound();
        toast.success(`Payment received — Table ${data.tableNumber}`);
        fetchTables();
      }
    },
    [playSound, fetchTables],
  );

  useWebSocket({ room: user?.shopId || '', roomType: 'shop', onEvent: handleWebSocketEvent });

  // Order action handlers
  const handleApproveOrder = useCallback(
    async (orderId: string) => {
      try {
        await orderService.updateOrderStatus(orderId, { status: 'approved' });
        toast.success('Order approved');
        fetchTables();
      } catch {
        toast.error('Failed to approve order');
      }
    },
    [fetchTables],
  );

  const handleRejectOrder = useCallback(
    async (orderId: string, rejectionReason: string) => {
      try {
        await orderService.updateOrderStatus(orderId, { status: 'rejected', rejectionReason });
        toast.success('Order rejected');
        fetchTables();
      } catch {
        toast.error('Failed to reject order');
      }
    },
    [fetchTables],
  );

  const handleCompleteOrder = useCallback(
    async (orderId: string) => {
      try {
        await orderService.updateOrderStatus(orderId, { status: 'completed' });
        toast.success('Order completed');
        fetchTables();
      } catch {
        toast.error('Failed to complete order');
      }
    },
    [fetchTables],
  );

  // Bill generation handler
  const handleGenerateBill = useCallback(
    async (table: TableData) => {
      if (!user?.shopId) return;
      const deviceId = table.orders[0]?.deviceId;
      if (!deviceId) {
        toast.error('No device ID found for this table');
        return;
      }
      try {
        await billingService.generateBill({
          customerName: table.customerName,
          deviceId,
          shopId: user.shopId,
          tableNumber: table.tableNumber,
        });
        toast.success('Bill generated successfully');
        fetchTables();
      } catch {
        toast.error('Failed to generate bill');
      }
    },
    [user?.shopId, fetchTables],
  );

  // Payment handler
  const handleMarkPaid = useCallback(
    async (billId: string, paymentMethod: PaymentMethod) => {
      try {
        await billingService.updatePaymentStatus(billId, {
          paymentStatus: 'paid',
          paymentMethod,
        });
        toast.success('Payment recorded successfully');
        fetchTables();
      } catch {
        toast.error('Failed to update payment status');
      }
    },
    [fetchTables],
  );

  // Filtered and searched tables
  const filteredTables = useMemo(() => {
    const filtered = filterTables(tables, activeFilter);
    return searchTables(filtered, debouncedSearch);
  }, [tables, activeFilter, debouncedSearch]);

  // Filter counts
  const filterCounts = useMemo(() => {
    const searched = searchTables(tables, debouncedSearch);
    return FILTERS.reduce(
      (acc, f) => {
        acc[f] = filterTables(searched, f).length;
        return acc;
      },
      {} as Record<TableFilterType, number>,
    );
  }, [tables, debouncedSearch]);

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SkeletonCard count={6} variant="order" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive" />
            <p className="text-lg font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchTables} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Table Management</h2>
          <Badge variant="outline" className="text-xs font-medium">
            {filterCounts['all'] === 0 ? 'No' : filterCounts['all']} active
          </Badge>
        </div>
        <Button onClick={fetchTables} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by table number or customer name..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={activeFilter}
        onValueChange={(val) => setActiveFilter(val as TableFilterType)}
      >
        <TabsList className="grid w-full grid-cols-3">
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f} className="gap-1 text-xs sm:text-sm">
              <span className="hidden sm:inline">{FILTER_LABELS[f]}</span>
              <span className="sm:hidden">{FILTER_LABELS[f].split(' ').pop()}</span>
              <Badge className={`h-5 min-w-[18px] px-1 text-[10px] font-bold ${FILTER_BADGE_COLORS[f]} text-white hover:${FILTER_BADGE_COLORS[f]} rounded-full`}>
                {filterCounts[f]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Table Cards Grid */}
      {filteredTables.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <LayoutGrid className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium mb-1">No active tables</p>
            <p className="text-sm text-muted-foreground">
              {debouncedSearch
                ? 'No tables match your search'
                : 'Tables will appear here when customers place orders'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <TableCard
              key={table.tableNumber}
              table={table}
              onApproveOrder={handleApproveOrder}
              onRejectOrder={handleRejectOrder}
              onCompleteOrder={handleCompleteOrder}
              onGenerateBill={handleGenerateBill}
              onMarkPaid={handleMarkPaid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
