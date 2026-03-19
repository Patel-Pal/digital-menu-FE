import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Receipt, Eye, RefreshCw, DollarSign, Clock, CheckCircle, XCircle, Download, Search, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import { Bill, billingService } from '@/services/billingService';
import { BillDetailModal } from '@/components/BillDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotificationSoundSettings } from '@/contexts/NotificationSoundContext';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef, PaginationState } from '@/components/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { shopService } from '@/services/shopService';

export function BillingManagementPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [counts, setCounts] = useState({ pending: 0, paid: 0, failed: 0, all: 0 });
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, pageSize: 20, totalItems: 0 });
  const [shopName, setShopName] = useState('');
  const { user } = useAuth();
  const { playSound } = useNotificationSoundSettings();

  useEffect(() => {
    shopService.getShopProfile().then(r => setShopName(r.data?.name || '')).catch(() => {});
  }, []);

  const handleWebSocketEvent = useCallback((event: string, data: any) => {
    if (event === 'payment_received') {
      playSound();
      toast.success(`Payment received from ${data.customerName} - ₹${data.amount}`);
      fetchBills(pagination.currentPage);
    }
  }, [pagination.currentPage, playSound]);

  useWebSocket({ room: user?.shopId || '', roomType: 'shop', onEvent: handleWebSocketEvent });

  useEffect(() => { fetchBills(1, true); }, [activeTab]);

  const fetchBills = useCallback(async (page = 1, isTabSwitch = false) => {
    if (!user?.shopId) return;
    if (isTabSwitch) setTabLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await billingService.getShopBills(user.shopId, status, page, pagination.pageSize);
      setBills(response.data || []);
      setCounts(response.counts || { pending: 0, paid: 0, failed: 0, all: 0 });
      if (response.pagination) {
        setPagination({ currentPage: response.pagination.page, pageSize: response.pagination.limit, totalItems: response.pagination.total });
      }
    } catch {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  }, [user?.shopId, activeTab, pagination.pageSize]);

  const handlePageChange = useCallback((page: number) => { fetchBills(page); }, [fetchBills]);
  const handleBillUpdate = () => { fetchBills(pagination.currentPage); setSelectedBill(null); };
  const handleSearchChange = useCallback((query: string) => { setSearchQuery(query); }, []);

  const filteredBills = useMemo(() => {
    const q = (searchQuery || mobileSearch).toLowerCase();
    if (!q) return bills;
    return bills.filter(b => b.billNumber.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q) || b.tableNumber.toLowerCase().includes(q));
  }, [bills, searchQuery, mobileSearch]);

  const totalRevenue = useMemo(() => bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0), [bills]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatDateShort = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      paid: { icon: <CheckCircle className="h-3 w-3" />, className: 'bg-green-100 text-green-800 border-green-200' },
      failed: { icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-800 border-red-200' },
    };
    const c = config[status] || { icon: <Clock className="h-3 w-3" />, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge className={`${c.className} text-xs gap-1 px-2 py-0.5 rounded-full border`}>{c.icon}<span className="capitalize">{status}</span></Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Bill Number', 'Customer', 'Table', 'Amount', 'Status', 'Payment Method', 'Date'];
    const rows = filteredBills.map(b => [b.billNumber, b.customerName, b.tableNumber, b.totalAmount.toFixed(2), b.paymentStatus, b.paymentMethod || '', new Date(b.createdAt).toLocaleString()]);
    const shopLine = shopName ? `"${shopName}"\n\n` : '';
    const csv = shopLine + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bills-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Bills exported to CSV');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let y = 18;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Bills Report', 14, y);
    y += 8;

    // Shop name
    if (shopName) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40);
      doc.text(shopName, 14, y);
      y += 7;
    }

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(`Generated on ${dateStr}`, 14, y);
    doc.setTextColor(0);
    y += 7;

    // Summary
    const paid = filteredBills.filter(b => b.paymentStatus === 'paid');
    const revenue = paid.reduce((s, b) => s + b.totalAmount, 0);
    doc.setFontSize(9);
    doc.text(`Total Bills: ${filteredBills.length}   Paid: ${paid.length}   Revenue: Rs.${revenue.toFixed(2)}`, 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Bill #', 'Customer', 'Table', 'Amount (Rs.)', 'Status', 'Payment', 'Date']],
      body: filteredBills.map(b => [
        b.billNumber,
        b.customerName,
        b.tableNumber,
        b.totalAmount.toFixed(2),
        b.paymentStatus.toUpperCase(),
        b.paymentMethod || '—',
        new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ]),
      headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 32 },
        3: { halign: 'right' },
        4: { halign: 'center' },
        5: { halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`bills-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Bills exported to PDF');
  };

  const exportToExcel = () => {
    const rows = filteredBills.map(b => ({
      'Bill Number': b.billNumber,
      'Customer': b.customerName,
      'Table': b.tableNumber,
      'Subtotal (Rs.)': parseFloat(b.subtotal?.toFixed(2) ?? b.totalAmount.toFixed(2)),
      'Tax (Rs.)': parseFloat((b.taxAmount ?? 0).toFixed(2)),
      'Total Amount (Rs.)': parseFloat(b.totalAmount.toFixed(2)),
      'Status': b.paymentStatus,
      'Payment Method': b.paymentMethod || '',
      'Date': new Date(b.createdAt).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    // Bills sheet first so it opens by default
    XLSX.utils.book_append_sheet(wb, ws, 'Bills');
    // Summary sheet second
    const paidBills = filteredBills.filter(b => b.paymentStatus === 'paid');
    const revenue = paidBills.reduce((s, b) => s + b.totalAmount, 0);
    const summaryData: (string | number)[][] = [
      ['Bills Report'],
      [],
      ...(shopName ? [['Shop', shopName]] : []),
      ['Generated', new Date().toLocaleString()],
      [],
      ['Total Bills', filteredBills.length],
      ['Paid Bills', paidBills.length],
      ['Pending Bills', filteredBills.filter(b => b.paymentStatus === 'pending').length],
      ['Total Revenue (Rs.)', parseFloat(revenue.toFixed(2))],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    XLSX.writeFile(wb, `bills-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Bills exported to Excel');
  };  const billColumns: ColumnDef<Bill>[] = [
    { id: 'billNumber', header: 'Bill #', headerClassName: 'w-[120px]', accessorFn: (row) => row.billNumber, cell: (row) => <span className="font-mono text-sm font-medium">{row.billNumber}</span> },
    { id: 'customer', header: 'Customer', accessorFn: (row) => row.customerName, cell: (row) => <span className="font-medium">{row.customerName}</span> },
    { id: 'table', header: 'Table', headerClassName: 'w-[80px] text-center', cellClassName: 'text-center', accessorFn: (row) => row.tableNumber, cell: (row) => <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">{row.tableNumber}</span> },
    { id: 'amount', header: 'Amount', headerClassName: 'w-[110px] text-right', cellClassName: 'text-right font-bold text-primary', accessorFn: (row) => row.totalAmount, cell: (row) => <span>₹{row.totalAmount.toFixed(2)}</span> },
    { id: 'paymentStatus', header: 'Status', headerClassName: 'w-[120px] text-center', cellClassName: 'text-center', accessorFn: (row) => row.paymentStatus, cell: (row) => getStatusBadge(row.paymentStatus) },
    { id: 'paymentMethod', header: 'Payment', headerClassName: 'w-[100px] text-center', cellClassName: 'text-center', accessorFn: (row) => row.paymentMethod, cell: (row) => <span className="text-sm capitalize text-muted-foreground">{row.paymentMethod || '—'}</span> },
    { id: 'date', header: 'Date', headerClassName: 'w-[160px]', accessorFn: (row) => row.createdAt, cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span> },
    {
      id: 'actions', header: 'Actions', headerClassName: 'w-[130px] text-center', cellClassName: 'text-center', accessorFn: () => null,
      cell: (row) => (
        <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
          {row.paymentStatus === 'pending' && (
            <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={e => { e.stopPropagation(); setSelectedBill(row); }}>
              <CheckCircle className="h-3 w-3 mr-1" />Pay
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedBill(row)}><Eye className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  if (loading && bills.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground hidden sm:block">Manage customer bills and payments</p>
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={filteredBills.length === 0}>
                <FileDown className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4 text-red-500" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 text-green-600" /> Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
                <Download className="h-4 w-4 text-blue-500" /> Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => fetchBills(pagination.currentPage, false)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Bills', value: counts.all, icon: <Receipt className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-100' },
          { label: 'Paid Bills', value: counts.paid, icon: <CheckCircle className="h-5 w-5 text-green-600" />, bg: 'bg-green-100' },
          { label: 'Pending', value: counts.pending, icon: <Clock className="h-5 w-5 text-yellow-600" />, bg: 'bg-yellow-100' },
          { label: 'Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: <DollarSign className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-100' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>{stat.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className="text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All<span className="ml-1 hidden sm:inline">({counts.all})</span><span className="ml-1 sm:hidden text-[10px]">{counts.all}</span></TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending<span className="ml-1 hidden sm:inline">({counts.pending})</span><span className="ml-1 sm:hidden text-[10px]">{counts.pending}</span></TabsTrigger>
          <TabsTrigger value="paid" className="text-xs sm:text-sm">Paid<span className="ml-1 hidden sm:inline">({counts.paid})</span><span className="ml-1 sm:hidden text-[10px]">{counts.paid}</span></TabsTrigger>
          <TabsTrigger value="failed" className="text-xs sm:text-sm">Failed<span className="ml-1 hidden sm:inline">({counts.failed})</span><span className="ml-1 sm:hidden text-[10px]">{counts.failed}</span></TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bills..." className="pl-9" value={mobileSearch} onChange={e => setMobileSearch(e.target.value)} />
            </div>
            {tabLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
            ) : filteredBills.length === 0 ? (
              <Card><CardContent className="py-10 text-center"><Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-muted-foreground">No bills found</p></CardContent></Card>
            ) : (
              filteredBills.map(bill => (
                <Card key={bill._id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold">{bill.billNumber}</span>
                          {getStatusBadge(bill.paymentStatus)}
                        </div>
                        <p className="font-medium mt-0.5">{bill.customerName}</p>
                        <p className="text-xs text-muted-foreground">Table {bill.tableNumber} · {formatDateShort(bill.createdAt)}</p>
                        {bill.paymentMethod && <p className="text-xs text-muted-foreground capitalize mt-0.5">via {bill.paymentMethod}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary text-lg">₹{bill.totalAmount.toFixed(2)}</p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          {bill.paymentStatus === 'pending' && (
                            <Button size="sm" className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => setSelectedBill(bill)}>
                              <CheckCircle className="h-3 w-3 mr-1" />Pay
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedBill(bill)}><Eye className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Desktop DataTable */}
          <div className="hidden sm:block">
            <DataTable<Bill>
              mode="server" columns={billColumns} data={filteredBills}
              pagination={pagination} onPageChange={handlePageChange}
              onSearch={handleSearchChange} loading={tabLoading}
              search={{ placeholder: 'Search by bill number, customer, or table...' }}
              emptyState={{ icon: <Receipt className="h-8 w-8" />, title: 'No bills found', description: searchQuery ? 'Try adjusting your search terms' : 'Bills will appear here when customers generate them' }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {selectedBill && (
        <BillDetailModal bill={selectedBill} isOpen={!!selectedBill} onClose={() => setSelectedBill(null)} onBillUpdate={handleBillUpdate} />
      )}
    </div>
  );
}
