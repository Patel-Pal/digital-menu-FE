import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, User, Hash, CheckCircle, XCircle, RefreshCw, UtensilsCrossed, Info } from 'lucide-react';
import { Order } from '@/services/orderService';
import { orderService } from '@/services/orderService';
import { OrderNotification } from '@/components/OrderNotification';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchOrders = async () => {
    if (!user?.shopId) return;

    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await orderService.getShopOrders(user.shopId, status);
      setOrders(response.data || []);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderCounts = () => {
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      approved: orders.filter(o => o.status === 'approved').length,
      rejected: orders.filter(o => o.status === 'rejected').length,
      completed: orders.filter(o => o.status === 'completed').length,
      all: orders.length
    };
  };

  const counts = getOrderCounts();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
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
          <TabsTrigger value="pending" className="relative">
            Pending
            {counts.pending > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="relative">
            Approved
            {counts.approved > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-green-500 text-white">
                {counts.approved}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No {activeTab} orders</h3>
                <p className="text-muted-foreground">Orders will appear here when received</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order._id} className={`${order.status === 'pending' ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
                  <CardContent className="p-4">
                    {/* Quick Info Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold">#{order._id.slice(-6)}</div>
                        <div className="text-sm text-muted-foreground">{formatTime(order.createdAt)}</div>
                        <Badge className={`${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xl font-bold">${order.totalAmount.toFixed(2)}</div>
                    </div>

                    {/* Customer & Table */}
                    <div className="flex items-center gap-6 mb-3 text-sm">
                      <span><strong>Customer:</strong> {order.customerName}</span>
                      <span><strong>Table:</strong> {order.tableNumber}</span>
                    </div>

                    {/* Items - Simple List */}
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-2">Items:</div>
                      <div className="text-sm space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.orderNotes && (
                      <div className="mb-3 p-2 bg-muted rounded text-sm">
                        <strong>Notes:</strong> {order.orderNotes}
                      </div>
                    )}

                    {/* Status Info */}
                    {order.status === 'approved' && order.estimatedReadyTime && (
                      <div className="mb-3 p-2 bg-muted rounded text-sm">
                        <strong>Ready in:</strong> {order.estimatedReadyTime} minutes
                      </div>
                    )}

                    {order.status === 'rejected' && order.rejectionReason && (
                      <div className="mb-3 p-2 bg-muted rounded text-sm">
                        <strong>Rejected:</strong> {order.rejectionReason}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {order.status === 'pending' && (
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        className="w-full"
                        size="lg"
                      >
                        REVIEW & APPROVE
                      </Button>
                    )}

                    {order.status === 'approved' && (
                      <Button
                        onClick={async () => {
                          try {
                            await orderService.updateOrderStatus(order._id, { status: 'completed' });
                            toast.success('Order completed');
                            fetchOrders();
                          } catch (error: any) {
                            toast.error('Failed to update order');
                          }
                        }}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        MARK COMPLETED
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
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
  );
}
