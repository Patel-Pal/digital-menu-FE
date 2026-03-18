import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, CheckCircle, XCircle, RefreshCw, UtensilsCrossed, Eye, ChefHat, StickyNote, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { Order, orderService } from '@/services/orderService';
import { OrderNotification } from '@/components/OrderNotification';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotificationSoundSettings } from '@/contexts/NotificationSoundContext';
import { toast } from 'sonner';
import { SkeletonCard } from '@/components/SkeletonCard';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef, PaginationState } from '@/components/DataTable';

const PAGE_SIZE = 20;

export function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, completed: 0, all: 0 });
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, pageSize: PAGE_SIZE, totalItems: 0 });
  const { user } = useAuth();

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const { playSound } = useNotificationSoundSettings();

  const fetchOrders = useCallback(async (page = 1, isTabSwitch = false) => {
    if (!user?.shopId) return;
    if (isTabSwitch) setTabLoading(true);
    try {
      const status = activeTabRef.current === 'all' ? undefined : activeTabRef.current;
      const response = await orderService.getShopOrders(user.shopId, status, page, PAGE_SIZE);
      setOrders(response.data || []);
      setCounts(response.counts || { pending: 0, approved: 0, rejected: 0, completed: 0, all: 0 });
      if (response.pagination) {
        setPagination({ currentPage: response.pagination.page, pageSize: response.pagination.limit, totalItems: response.pagination.total });
      }
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  }, [user?.shopId]);

  const handleWebSocketEvent = useCallback((event: string, data: any) => {
    if (event === 'new_order') {
      playSound();
      toast.success(`New order from ${data.customerName} - Table ${data.tableNumber}`);
      fetchOrders(paginationRef.current.currentPage);
    } else if (event === 'order_status_updated') {
      fetchOrders(paginationRef.current.currentPage);
    }
  }, [playSound, fetchOrders]);

  useWebSocket({ room: user?.shopId || '', roomType: 'shop', onEvent: handleWebSocketEvent });

  useEffect(() => {
    fetchOrders(1, true);
    const interval = setInterval(() => fetchOrders(paginationRef.current.currentPage, false), 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchOrders]);

  const handlePageChange = useCallback((page: number) => { fetchOrders(page); }, [fetchOrders]);

  const handleOrderUpdate = useCallback(() => {
    fetchOrders(paginationRef.current.currentPage);
    setSelectedOrder(null);
    setSelectedOrders(new Set());
  }, [fetchOrders]);

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => { const next = new Set(prev); next.has(orderId) ? next.delete(orderId) : next.add(orderId); return next; });
  };

  const toggleSelectAll = () => {
    setSelectedOrders(selectedOrders.size === orders.length ? new Set() : new Set(orders.map(o => o._id)));
  };

  const handleBulkAction = async (status: 'approved' | 'rejected' | 'completed') => {
    if (selectedOrders.size === 0) return;
    try {
      await Promise.all(Array.from(selectedOrders).map(id => orderService.updateOrderStatus(id, { status })));
      toast.success(`${selectedOrders.size} orders ${status}`);
      setSelectedOrders(new Set());
      fetchOrders(paginationRef.current.currentPage);
    } catch {
      toast.error('Some orders failed to update');
      fetchOrders(paginationRef.current.currentPage);
    }
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, className: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
      approved: { icon: <CheckCircle className="h-3 w-3" />, className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
      rejected: { icon: <XCircle className="h-3 w-3" />, className: 'bg-red-500/15 text-red-500 border-red-500/30' },
      completed: { icon: <CheckCircle className="h-3 w-3" />, className: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
    };
    const c = config[status] || config.pending;
    return <Badge className={`${c.className} text-[11px] font-semibold gap-1 px-2 py-0.5`}>{c.icon}{status.toUpperCase()}</Badge>;
  };

  // Desktop columns
  const checkboxColumn: ColumnDef<Order> = {
    id: 'select', header: '', headerClassName: 'w-[40px]', accessorFn: () => null,
    cell: (row) => <div onClick={e => e.stopPropagation()}><Checkbox checked={selectedOrders.has(row._id)} onCheckedChange={() => toggleSelectOrder(row._id)} /></div>,
  };

  const actionsColumn: ColumnDef<Order> = {
    id: 'actions', header: 'Actions', headerClassName: 'w-[160px] text-center', cellClassName: 'text-center', accessorFn: () => null,
    cell: (row) => (
      <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
        {row.status === 'pending' && <Button size="sm" className="h-8 text-xs" onClick={() => setSelectedOrder(row)}><ChefHat className="h-3.5 w-3.5 mr-1" />Review</Button>}
        {row.status === 'approved' && (
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={async () => {
            try { await orderService.updateOrderStatus(row._id, { status: 'completed' }); toast.success('Order completed'); fetchOrders(paginationRef.current.currentPage); }
            catch { toast.error('Failed to update order'); }
          }}><CheckCircle className="h-3.5 w-3.5 mr-1" />Complete</Button>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setExpandedOrder(expandedOrder === row._id ? null : row._id)}><Eye className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>View Details</TooltipContent>
        </Tooltip>
      </div>
    ),
  };

  const orderColumns: ColumnDef<Order>[] = [
    checkboxColumn,
    { id: 'orderId', header: 'Order ID', headerClassName: 'w-[100px]', accessorFn: (row) => row._id, cell: (row) => <span className="font-mono font-bold text-sm">#{row._id.slice(-6)}</span> },
    {
      id: 'customer', header: 'Customer', accessorFn: (row) => row.customerName,
      cell: (row) => <div className="flex flex-col"><span className="font-medium">{row.customerName}</span>{row.waiterId?.name && <span className="text-xs text-muted-foreground">via {row.waiterId.name}</span>}</div>,
    },
    {
      id: 'table', header: 'Table', headerClassName: 'w-[80px] text-center', cellClassName: 'text-center', accessorFn: (row) => row.tableNumber,
      cell: (row) => <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">{row.tableNumber}</span>,
    },
    {
      id: 'items', header: 'Items', accessorFn: (row) => row.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      cell: (row) => {
        const summary = row.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">{summary.slice(0, 40)}{summary.length > 40 ? '...' : ''}</span>
            {row.orderNotes && <Tooltip><TooltipTrigger asChild><StickyNote className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" /></TooltipTrigger><TooltipContent side="top"><p className="max-w-[200px]">{row.orderNotes}</p></TooltipContent></Tooltip>}
          </div>
        );
      },
    },
    { id: 'amount', header: 'Amount', headerClassName: 'w-[100px] text-right', cellClassName: 'text-right font-bold text-primary', accessorFn: (row) => row.totalAmount, cell: (row) => <span>₹{row.totalAmount.toFixed(2)}</span> },
    { id: 'status', header: 'Status', headerClassName: 'w-[120px] text-center', cellClassName: 'text-center', accessorFn: (row) => row.status, cell: (row) => getStatusBadge(row.status) },
    { id: 'date', header: 'Date', headerClassName: 'w-[140px]', accessorFn: (row) => row.createdAt, cell: (row) => <span className="text-sm text-muted-foreground">{formatTime(row.createdAt)}</span> },
    actionsColumn,
  ];

  const expandedOrderData = expandedOrder ? orders.find(o => o._id === expandedOrder) : null;

  if (loading && orders.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
        </div>
        <SkeletonCard count={4} variant="order" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="p-4 sm:p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Checkbox checked={orders.length > 0 && selectedOrders.size === orders.length} onCheckedChange={toggleSelectAll} />
            <span className="text-sm text-muted-foreground hidden sm:inline">Select All</span>
          </div>
          <Button onClick={() => fetchOrders(paginationRef.current.currentPage, false)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedOrders(new Set()); setExpandedOrder(null); }} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending" className="gap-1 px-1 sm:px-3">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Pending</span>
              <Badge className="h-5 min-w-[18px] px-1 text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-500 rounded-full">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1 px-1 sm:px-3">
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Approved</span>
              <Badge className="h-5 min-w-[18px] px-1 text-[10px] font-bold bg-emerald-500 text-white hover:bg-emerald-500 rounded-full">{counts.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1 px-1 sm:px-3">
              <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Rejected</span>
              <Badge className="h-5 min-w-[18px] px-1 text-[10px] font-bold bg-red-500 text-white hover:bg-red-500 rounded-full">{counts.rejected}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1 px-1 sm:px-3">
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Done</span>
              <Badge className="h-5 min-w-[18px] px-1 text-[10px] font-bold bg-blue-500 text-white hover:bg-blue-500 rounded-full">{counts.completed}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1 px-1 sm:px-3">
              <span className="text-xs sm:text-sm">All</span>
              <Badge className="h-5 min-w-[18px] px-1 text-[10px] font-bold bg-gray-500 text-white hover:bg-gray-500 rounded-full">{counts.all}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Bulk Actions */}
            {selectedOrders.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <span className="text-sm font-medium">{selectedOrders.size} selected</span>
                {activeTab === 'pending' && <>
                  <Button size="sm" className="h-7 text-xs" onClick={() => handleBulkAction('approved')}><CheckCircle className="h-3 w-3 mr-1" />Approve All</Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleBulkAction('rejected')}><XCircle className="h-3 w-3 mr-1" />Reject All</Button>
                </>}
                {activeTab === 'approved' && <Button size="sm" className="h-7 text-xs" onClick={() => handleBulkAction('completed')}><CheckCircle className="h-3 w-3 mr-1" />Complete All</Button>}
                <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setSelectedOrders(new Set())}>Clear</Button>
              </div>
            )}

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {tabLoading ? (
                <SkeletonCard count={3} variant="order" />
              ) : orders.length === 0 ? (
                <Card><CardContent className="py-10 text-center"><UtensilsCrossed className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-muted-foreground">No {activeTab} orders</p></CardContent></Card>
              ) : (
                orders.map(order => (
                  <Card key={order._id} className={selectedOrders.has(order._id) ? "border-primary/50 bg-primary/5" : ""}>
                    <CardContent className="p-3 space-y-2">
                      {/* Row 1: checkbox + customer + table + amount */}
                      <div className="flex items-start gap-2">
                        <Checkbox checked={selectedOrders.has(order._id)} onCheckedChange={() => toggleSelectOrder(order._id)} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{order.customerName}</p>
                              <p className="text-xs text-muted-foreground">#{order._id.slice(-6)} · Table {order.tableNumber}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                              <p className="text-[10px] text-muted-foreground">{formatTime(order.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: items summary */}
                      <p className="text-xs text-muted-foreground pl-6 line-clamp-1">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>

                      {/* Row 3: status + actions */}
                      <div className="flex items-center justify-between pl-6">
                        {getStatusBadge(order.status)}
                        <div className="flex items-center gap-1">
                          {order.status === 'pending' && (
                            <Button size="sm" className="h-7 text-xs px-2" onClick={() => setSelectedOrder(order)}>
                              <ChefHat className="h-3 w-3 mr-1" />Review
                            </Button>
                          )}
                          {order.status === 'approved' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={async () => {
                              try { await orderService.updateOrderStatus(order._id, { status: 'completed' }); toast.success('Order completed'); fetchOrders(paginationRef.current.currentPage); }
                              catch { toast.error('Failed to update order'); }
                            }}>
                              <CheckCircle className="h-3 w-3 mr-1" />Complete
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                            {expandedOrder === order._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {expandedOrder === order._id && (
                        <div className="pl-6 pt-2 border-t border-border/50 space-y-2">
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                                <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          {order.orderNotes && (
                            <div className="flex items-start gap-1.5 rounded-lg bg-amber-500/10 px-2 py-1.5">
                              <StickyNote className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-600">{order.orderNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop DataTable */}
            <div className="hidden sm:block">
              <DataTable<Order>
                mode="server" columns={orderColumns} data={orders}
                pagination={pagination} onPageChange={handlePageChange} loading={tabLoading}
                emptyState={{ icon: <UtensilsCrossed className="h-8 w-8" />, title: `No ${activeTab} orders`, description: 'Orders will appear here when received' }}
              />

              {/* Expanded Order Detail Panel */}
              {expandedOrderData && (
                <Card className="mt-4 border-primary/20">
                  <CardContent className="p-0">
                    <div className="px-6 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Order #{expandedOrderData._id.slice(-6)} — {expandedOrderData.customerName}</h3>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setExpandedOrder(null)}>Close</Button>
                      </div>
                      <div className="rounded-lg border border-border/50 overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Items</span></div>
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-border/30">
                            <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Item</th>
                            <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Qty</th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Price</th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Total</th>
                          </tr></thead>
                          <tbody className="divide-y divide-border/20">
                            {expandedOrderData.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 font-medium">{item.name}</td>
                                <td className="px-4 py-2 text-center"><span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold">{item.quantity}</span></td>
                                <td className="px-4 py-2 text-right text-muted-foreground">₹{item.price.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot><tr className="border-t border-border/50">
                            <td colSpan={3} className="px-4 py-2 text-right font-semibold">Total:</td>
                            <td className="px-4 py-2 text-right font-bold text-primary text-base">₹{expandedOrderData.totalAmount.toFixed(2)}</td>
                          </tr></tfoot>
                        </table>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {expandedOrderData.orderNotes && (
                          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 flex-1 min-w-[200px]">
                            <StickyNote className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div><p className="text-xs font-semibold text-amber-500 mb-0.5">Notes</p><p className="text-sm text-amber-600 dark:text-amber-400">{expandedOrderData.orderNotes}</p></div>
                          </div>
                        )}
                        {expandedOrderData.status === 'approved' && expandedOrderData.estimatedReadyTime && (
                          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                            <Timer className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <div><p className="text-xs font-semibold text-emerald-500 mb-0.5">Estimated Ready</p><p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{expandedOrderData.estimatedReadyTime} minutes</p></div>
                          </div>
                        )}
                        {expandedOrderData.status === 'rejected' && expandedOrderData.rejectionReason && (
                          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 flex-1 min-w-[200px]">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div><p className="text-xs font-semibold text-red-500 mb-0.5">Rejection Reason</p><p className="text-sm text-red-600 dark:text-red-400">{expandedOrderData.rejectionReason}</p></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedOrder && (
          <OrderNotification order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} onOrderUpdate={handleOrderUpdate} />
        )}
      </div>
    </TooltipProvider>
  );
}
