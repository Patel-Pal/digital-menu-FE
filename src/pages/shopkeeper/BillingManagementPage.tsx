import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Receipt, 
  Eye, 
  RefreshCw, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download
} from 'lucide-react';
import { Bill, billingService } from '@/services/billingService';
import { BillDetailModal } from '@/components/BillDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef, PaginationState } from '@/components/DataTable';

export function BillingManagementPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
  });
  const { user } = useAuth();

  const handleWebSocketEvent = useCallback((event: string, data: any) => {
    if (event === 'payment_received') {
      toast.success(`Payment received from ${data.customerName} - ₹${data.amount}`);
      fetchBills(pagination.currentPage);
    }
  }, [pagination.currentPage]);

  useWebSocket({
    room: user?.shopId || '',
    roomType: 'shop',
    onEvent: handleWebSocketEvent
  });

  useEffect(() => {
    fetchBills(1, true);
  }, [activeTab]);

  const fetchBills = useCallback(async (page = 1, isTabSwitch = false) => {
    if (!user?.shopId) return;
    if (isTabSwitch) setTabLoading(true);

    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await billingService.getShopBills(user.shopId, status, page, pagination.pageSize);
      setBills(response.data || []);
      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.page,
          pageSize: response.pagination.limit,
          totalItems: response.pagination.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  }, [user?.shopId, activeTab, pagination.pageSize]);

  const handlePageChange = useCallback((page: number) => {
    fetchBills(page);
  }, [fetchBills]);

  const handleBillUpdate = () => {
    fetchBills(pagination.currentPage);
    setSelectedBill(null);
  };

  // Client-side search within the current page (backend doesn't support search)
  const filteredBills = useMemo(() => {
    if (!searchQuery) return bills;
    const q = searchQuery.toLowerCase();
    return bills.filter(bill =>
      bill.billNumber.toLowerCase().includes(q) ||
      bill.customerName.toLowerCase().includes(q) ||
      bill.tableNumber.toLowerCase().includes(q)
    );
  }, [bills, searchQuery]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      paid: { icon: <CheckCircle className="h-3 w-3" />, className: 'bg-green-100 text-green-800 border-green-200' },
      failed: { icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-800 border-red-200' },
    };
    const c = config[status] || { icon: <Clock className="h-3 w-3" />, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <Badge className={`${c.className} text-xs gap-1 px-2 py-0.5 rounded-full border`}>
        {c.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  // Stats computed from the current page of bills
  const counts = useMemo(() => ({
    pending: bills.filter(b => b.paymentStatus === 'pending').length,
    paid: bills.filter(b => b.paymentStatus === 'paid').length,
    failed: bills.filter(b => b.paymentStatus === 'failed').length,
    all: bills.length,
  }), [bills]);

  const totalRevenue = useMemo(() =>
    bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0),
    [bills]
  );

  const exportToCSV = () => {
    const headers = ['Bill Number', 'Customer', 'Table', 'Amount', 'Status', 'Payment Method', 'Date'];
    const rows = filteredBills.map(b => [
      b.billNumber,
      b.customerName,
      b.tableNumber,
      b.totalAmount.toFixed(2),
      b.paymentStatus,
      b.paymentMethod || '',
      new Date(b.createdAt).toLocaleString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Bills exported to CSV');
  };

  // Column definitions for the DataTable
  const billColumns: ColumnDef<Bill>[] = [
    {
      id: 'billNumber',
      header: 'Bill #',
      headerClassName: 'w-[120px]',
      accessorFn: (row) => row.billNumber,
      cell: (row) => <span className="font-mono text-sm font-medium">{row.billNumber}</span>,
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (row) => row.customerName,
      cell: (row) => <span className="font-medium">{row.customerName}</span>,
    },
    {
      id: 'table',
      header: 'Table',
      headerClassName: 'w-[80px] text-center',
      cellClassName: 'text-center',
      accessorFn: (row) => row.tableNumber,
      cell: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
          {row.tableNumber}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      headerClassName: 'w-[110px] text-right',
      cellClassName: 'text-right font-bold text-primary',
      accessorFn: (row) => row.totalAmount,
      cell: (row) => <span>₹{row.totalAmount.toFixed(2)}</span>,
    },
    {
      id: 'paymentStatus',
      header: 'Status',
      headerClassName: 'w-[120px] text-center',
      cellClassName: 'text-center',
      accessorFn: (row) => row.paymentStatus,
      cell: (row) => getStatusBadge(row.paymentStatus),
    },
    {
      id: 'paymentMethod',
      header: 'Payment',
      headerClassName: 'w-[100px] text-center',
      cellClassName: 'text-center',
      accessorFn: (row) => row.paymentMethod,
      cell: (row) => (
        <span className="text-sm capitalize text-muted-foreground">
          {row.paymentMethod || '—'}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      headerClassName: 'w-[160px]',
      accessorFn: (row) => row.createdAt,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      headerClassName: 'w-[130px] text-center',
      cellClassName: 'text-center',
      accessorFn: () => null,
      cell: (row) => (
        <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
          {row.paymentStatus === 'pending' && (
            <Button
              size="sm"
              className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await billingService.updatePaymentStatus(row._id, {
                    paymentStatus: 'paid',
                    paymentMethod: row.paymentMethod
                  });
                  toast.success('Payment marked as paid');
                  fetchBills(pagination.currentPage);
                } catch (error: any) {
                  toast.error('Failed to update payment');
                }
              }}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Pay
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setSelectedBill(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && bills.length === 0) {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">Manage customer bills and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" disabled={filteredBills.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => fetchBills(pagination.currentPage, false)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bills</p>
                <p className="text-2xl font-bold">{counts.all}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Bills</p>
                <p className="text-2xl font-bold">{counts.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{counts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + DataTable */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({counts.paid})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({counts.failed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <DataTable<Bill>
            mode="server"
            columns={billColumns}
            data={filteredBills}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearchChange}
            loading={tabLoading}
            search={{ placeholder: 'Search by bill number, customer, or table...' }}
            emptyState={{
              icon: <Receipt className="h-8 w-8" />,
              title: 'No bills found',
              description: searchQuery
                ? 'Try adjusting your search terms'
                : 'Bills will appear here when customers generate them',
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          onBillUpdate={handleBillUpdate}
        />
      )}
    </div>
  );
}
