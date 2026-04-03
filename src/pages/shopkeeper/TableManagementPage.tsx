import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Search, LayoutGrid, AlertCircle, Receipt, CheckCircle, Eye, Printer, ChevronDown, ChevronUp, Clock, CreditCard, ArrowUpDown } from 'lucide-react';
import { TableData, PaymentMethod, orderService } from '@/services/orderService';
import { Bill, billingService } from '@/services/billingService';
import { BillDetailModal } from '@/components/BillDetailModal';
import { TableCard } from '@/components/TableCard';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef as DTColumnDef } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotificationSoundSettings } from '@/contexts/NotificationSoundContext';
import { toast } from 'sonner';
import { SkeletonCard } from '@/components/SkeletonCard';
import { filterTables, searchTables } from '@/utils/tableUtils';
import type { TableFilterType } from '@/types';

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
  const [paidBills, setPaidBills] = useState<Bill[]>([]);
  const [paidBillsExpanded, setPaidBillsExpanded] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billSearch, setBillSearch] = useState('');
  const [billSortBy, setBillSortBy] = useState<'date' | 'amount' | 'table'>('date');
  const [billSortDir, setBillSortDir] = useState<'asc' | 'desc'>('desc');
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

  const fetchPaidBills = useCallback(async () => {
    if (!user?.shopId) return;
    try {
      const response = await billingService.getShopBills(user.shopId, 'paid', 1, 50);
      setPaidBills(response.data || []);
    } catch {
      // silent — paid bills section is supplementary
    }
  }, [user?.shopId]);

  useEffect(() => {
    fetchTables();
    fetchPaidBills();
  }, [fetchTables, fetchPaidBills]);

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
        fetchPaidBills();
      }
    },
    [playSound, fetchTables, fetchPaidBills],
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
        fetchPaidBills();
      } catch {
        toast.error('Failed to update payment status');
      }
    },
    [fetchTables, fetchPaidBills],
  );

  // Mark payment as failed handler
  const handleMarkFailed = useCallback(
    async (billId: string) => {
      try {
        await billingService.updatePaymentStatus(billId, {
          paymentStatus: 'failed',
          paymentMethod: 'cash',
        });
        toast.success('Payment marked as failed');
        fetchTables();
      } catch {
        toast.error('Failed to update payment status');
      }
    },
    [fetchTables],
  );

  // Print completed bill
  const handlePrintCompletedBill = useCallback((bill: Bill) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    const itemsHtml = bill.items.map(item => `
      <tr>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd">${item.name}</td>
        <td style="padding:4px 8px;text-align:center;border-bottom:1px dashed #ddd">${item.quantity}</td>
        <td style="padding:4px 0;text-align:right;border-bottom:1px dashed #ddd">₹${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');
    const dateStr = new Date(bill.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    printWindow.document.write(`
      <html><head><title>Bill - ${bill.billNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; font-size: 12px; }
        h2 { text-align: center; margin: 0 0 4px; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-weight: bold; font-size: 14px; }
        @media print { body { margin: 0; padding: 10px; } }
      </style></head><body>
        <h2>BILL</h2>
        <p class="center">${bill.billNumber}</p>
        <div class="line"></div>
        <p>Customer: ${bill.customerName}</p>
        <p>Table: ${bill.tableNumber}</p>
        <p>Date: ${dateStr}</p>
        <div class="line"></div>
        <table>
          <tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr>
          ${itemsHtml}
        </table>
        <div class="line"></div>
        <table>
          <tr><td>Subtotal</td><td style="text-align:right">₹${bill.subtotal.toFixed(2)}</td></tr>
          <tr><td>Tax (5%)</td><td style="text-align:right">₹${bill.taxAmount.toFixed(2)}</td></tr>
        </table>
        <div class="line"></div>
        <table><tr class="total"><td>TOTAL</td><td style="text-align:right">₹${bill.totalAmount.toFixed(2)}</td></tr></table>
        <div class="line"></div>
        <p class="center">Payment: ${bill.paymentMethod.toUpperCase()}</p>
        <p class="center">Status: PAID</p>
        <div class="line"></div>
        <p class="center" style="margin-top:12px">Thank you!</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }, []);

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

  // Sorted and filtered paid bills
  const sortedPaidBills = useMemo(() => {
    let filtered = paidBills;
    if (billSearch.trim()) {
      const q = billSearch.toLowerCase();
      filtered = filtered.filter(b =>
        b.billNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.tableNumber.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      const dir = billSortDir === 'asc' ? 1 : -1;
      if (billSortBy === 'amount') return (a.totalAmount - b.totalAmount) * dir;
      if (billSortBy === 'table') return a.tableNumber.localeCompare(b.tableNumber) * dir;
      return (new Date(a.paidAt || a.updatedAt).getTime() - new Date(b.paidAt || b.updatedAt).getTime()) * dir;
    });
  }, [paidBills, billSearch, billSortBy, billSortDir]);

  const toggleBillSort = (field: 'date' | 'amount' | 'table') => {
    if (billSortBy === field) {
      setBillSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setBillSortBy(field);
      setBillSortDir('desc');
    }
  };

  // Bill columns for DataTable
  const billColumns: DTColumnDef<Bill>[] = useMemo(() => [
    {
      id: 'srNo', header: '#', headerClassName: 'w-[50px] text-center', cellClassName: 'text-center',
      accessorFn: (_row, _i) => '',
      cell: (row) => {
        const idx = sortedPaidBills.indexOf(row);
        return <span className="text-xs text-muted-foreground font-medium">{idx >= 0 ? idx + 1 : '—'}</span>;
      },
    },
    {
      id: 'billNumber', header: 'Bill #', headerClassName: 'w-[140px]',
      accessorFn: (row) => row.billNumber, searchable: true,
      cell: (row) => <span className="font-mono text-xs font-semibold">{row.billNumber}</span>,
    },
    {
      id: 'customer', header: 'Customer',
      accessorFn: (row) => row.customerName, searchable: true,
      cell: (row) => <span className="font-medium text-sm">{row.customerName}</span>,
    },
    {
      id: 'table', header: 'Table', headerClassName: 'w-[70px] text-center', cellClassName: 'text-center',
      accessorFn: (row) => row.tableNumber, searchable: true,
      cell: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
          {row.tableNumber}
        </span>
      ),
    },
    {
      id: 'amount', header: 'Amount', headerClassName: 'w-[100px] text-right', cellClassName: 'text-right',
      accessorFn: (row) => row.totalAmount,
      cell: (row) => <span className="font-bold text-primary text-sm tabular-nums">₹{row.totalAmount.toFixed(2)}</span>,
    },
    {
      id: 'method', header: 'Payment', headerClassName: 'w-[90px] text-center', cellClassName: 'text-center',
      accessorFn: (row) => row.paymentMethod,
      cell: (row) => <span className="text-xs capitalize text-muted-foreground">{row.paymentMethod || '—'}</span>,
    },
    {
      id: 'date', header: 'Paid At', headerClassName: 'w-[140px]',
      accessorFn: (row) => row.paidAt || row.updatedAt,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.paidAt || row.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      id: 'actions', header: '', headerClassName: 'w-[80px]', cellClassName: 'text-center',
      accessorFn: () => null,
      cell: (row) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedBill(row)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handlePrintCompletedBill(row)}>
            <Printer className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [handlePrintCompletedBill, sortedPaidBills]);

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
              onMarkFailed={handleMarkFailed}
            />
          ))}
        </div>
      )}

      {/* Completed Bills (Ready for Print) */}
      {paidBills.length > 0 && (
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setPaidBillsExpanded(!paidBillsExpanded)}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-semibold">Completed Bills</h3>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 border-0">
                {paidBills.length} paid
              </Badge>
            </div>
            {paidBillsExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>

          {paidBillsExpanded && (
            <div className="space-y-3">
              {/* Search and Sort Controls */}
              <div className="flex items-center justify-end gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search bills..."
                    className="pl-8 h-8 text-xs"
                    value={billSearch}
                    onChange={(e) => setBillSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-1">
                  {([
                    { key: 'date' as const, label: 'Date' },
                    { key: 'amount' as const, label: 'Amount' },
                    { key: 'table' as const, label: 'Table' },
                  ]).map((s) => (
                    <Button
                      key={s.key}
                      variant={billSortBy === s.key ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-[11px] px-2.5 gap-1"
                      onClick={() => toggleBillSort(s.key)}
                    >
                      {s.label}
                      {billSortBy === s.key && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Desktop DataTable */}
              <div className="hidden sm:block">
                <DataTable<Bill>
                  mode="client"
                  columns={billColumns}
                  data={sortedPaidBills}
                  pageSize={10}
                  emptyState={{
                    icon: <Receipt className="h-8 w-8" />,
                    title: 'No completed bills found',
                    description: billSearch ? 'Try adjusting your search' : 'Bills will appear here after payment',
                  }}
                />
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden space-y-2">
                {sortedPaidBills.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {billSearch ? 'No bills match your search' : 'No completed bills yet'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  sortedPaidBills.map((bill) => (
                    <Card key={bill._id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex-shrink-0">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-semibold">{bill.billNumber}</span>
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0 border-0">
                                  ✓ Paid
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {bill.customerName} · Table {bill.tableNumber} · {bill.paymentMethod?.toUpperCase() || 'N/A'}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(bill.paidAt || bill.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <p className="font-bold text-primary text-sm tabular-nums">₹{bill.totalAmount.toFixed(2)}</p>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                              onClick={() => setSelectedBill(bill)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                              onClick={() => handlePrintCompletedBill(bill)}>
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bill Detail Modal */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          onBillUpdate={() => { fetchPaidBills(); setSelectedBill(null); }}
        />
      )}
    </div>
  );
}
