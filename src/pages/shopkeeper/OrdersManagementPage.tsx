import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, CheckCircle, XCircle, RefreshCw, UtensilsCrossed, Eye, ChefHat, StickyNote, Timer } from 'lucide-react';
import { Order, orderService } from '@/services/orderService';
import { OrderNotification } from '@/components/OrderNotification';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'sonner';
import { SkeletonCard } from '@/components/SkeletonCard';

export function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    pending: 0, approved: 0, rejected: 0, completed: 0, all: 0
  });
  const { user } = useAuth();

  const handleWebSocketEvent = useCallback((event: string, data: any) => {
    if (event === 'new_order') {
      toast.success(`New order from ${data.customerName} - Table ${data.tableNumber}`);
      fetchOrders();
    } else if (event === 'order_status_updated') {
      fetchOrders();
    }
  }, []);

  useWebSocket({
    room: user?.shopId || '',
    roomType: 'shop',
    onEvent: handleWebSocketEvent
  });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchOrders = async () => {
    if (!user?.shopId) return;
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await orderService.getShopOrders(user.shopId, status);
      setOrders(response.data || []);
      setCounts(response.counts || { pending: 0, approved: 0, rejected: 0, completed: 0, all: 0 });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    fetchOrders();
    setSelectedOrder(null);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, className: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
      approved: { icon: <CheckCircle className="h-3 w-3" />, className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
      rejected: { icon: <XCircle className="h-3 w-3" />, className: 'bg-red-500/15 text-red-500 border-red-500/30' },
      completed: { icon: <CheckCircle className="h-3 w-3" />, className: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
    };
    const c = config[status] || config.pending;
    return (
      <Badge className={`${c.className} text-[11px] font-semibold gap-1 px-2 py-0.5`}>
        {c.icon}
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
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
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">Pending {counts.pending > 0 && `(${counts.pending})`}</TabsTrigger>
            <TabsTrigger value="approved">Approved {counts.approved > 0 && `(${counts.approved})`}</TabsTrigger>
            <TabsTrigger value="rejected">Rejected {counts.rejected > 0 && `(${counts.rejected})`}</TabsTrigger>
            <TabsTrigger value="completed">Completed {counts.completed > 0 && `(${counts.completed})`}</TabsTrigger>
            <TabsTrigger value="all">All {counts.all > 0 && `(${counts.all})`}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {orders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No {activeTab} orders</h3>
                  <p className="text-sm text-muted-foreground">Orders will appear here when received</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="w-[80px] text-center">Table</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="w-[100px] text-right">Amount</TableHead>
                        <TableHead className="w-[120px] text-center">Status</TableHead>
                        <TableHead className="w-[140px]">Date</TableHead>
                        <TableHead className="w-[160px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <>
                          <TableRow
                            key={order._id}
                            className={`cursor-pointer ${expandedOrder === order._id ? 'bg-muted/30' : ''} ${order.status === 'pending' ? 'bg-amber-500/5' : ''}`}
                            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          >
                            <TableCell className="font-mono font-bold text-sm">
                              #{order._id.slice(-6)}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{order.customerName}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                                {order.tableNumber}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm text-muted-foreground">
                                  {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ').slice(0, 40)}
                                  {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ').length > 40 ? '...' : ''}
                                </span>
                                {order.orderNotes && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <StickyNote className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="max-w-[200px]">{order.orderNotes}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              ₹{order.totalAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatTime(order.createdAt)}
                            </TableCell>
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                {order.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <ChefHat className="h-3.5 w-3.5 mr-1" />
                                    Review
                                  </Button>
                                )}
                                {order.status === 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                    onClick={async () => {
                                      try {
                                        await orderService.updateOrderStatus(order._id, { status: 'completed' });
                                        toast.success('Order completed');
                                        fetchOrders();
                                      } catch (error: any) {
                                        toast.error('Failed to update order');
                                      }
                                    }}
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    Complete
                                  </Button>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Row */}
                          {expandedOrder === order._id && (
                            <TableRow key={`${order._id}-detail`} className="bg-muted/20 hover:bg-muted/20">
                              <TableCell colSpan={8} className="p-0">
                                <div className="px-6 py-4 space-y-3">
                                  {/* Items Detail */}
                                  <div className="rounded-lg border border-border/50 overflow-hidden">
                                    <div className="bg-muted/50 px-4 py-2">
                                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Items</span>
                                    </div>
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-border/30">
                                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Item</th>
                                          <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Qty</th>
                                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Price</th>
                                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/20">
                                        {order.items.map((item, idx) => (
                                          <tr key={idx}>
                                            <td className="px-4 py-2 font-medium">{item.name}</td>
                                            <td className="px-4 py-2 text-center">
                                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold">{item.quantity}</span>
                                            </td>
                                            <td className="px-4 py-2 text-right text-muted-foreground">₹{item.price.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr className="border-t border-border/50">
                                          <td colSpan={3} className="px-4 py-2 text-right font-semibold">Total:</td>
                                          <td className="px-4 py-2 text-right font-bold text-primary text-base">₹{order.totalAmount.toFixed(2)}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>

                                  {/* Info Badges Row */}
                                  <div className="flex flex-wrap gap-2">
                                    {order.orderNotes && (
                                      <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 flex-1 min-w-[200px]">
                                        <StickyNote className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-xs font-semibold text-amber-500 mb-0.5">Notes</p>
                                          <p className="text-sm text-amber-600 dark:text-amber-400">{order.orderNotes}</p>
                                        </div>
                                      </div>
                                    )}
                                    {order.status === 'approved' && order.estimatedReadyTime && (
                                      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                                        <Timer className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                        <div>
                                          <p className="text-xs font-semibold text-emerald-500 mb-0.5">Estimated Ready</p>
                                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{order.estimatedReadyTime} minutes</p>
                                        </div>
                                      </div>
                                    )}
                                    {order.status === 'rejected' && order.rejectionReason && (
                                      <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 flex-1 min-w-[200px]">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-xs font-semibold text-red-500 mb-0.5">Rejection Reason</p>
                                          <p className="text-sm text-red-600 dark:text-red-400">{order.rejectionReason}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Order Notification Modal */}
        {selectedOrder && (
          <OrderNotification
            order={selectedOrder}
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onOrderUpdate={handleOrderUpdate}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
