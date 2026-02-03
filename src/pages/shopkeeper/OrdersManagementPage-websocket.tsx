import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, User, Hash, CheckCircle, XCircle, RefreshCw, UtensilsCrossed, Info } from 'lucide-react';
import { Order } from '@/services/orderService';
import { orderService } from '@/services/orderService';
import { OrderNotification } from '@/components/OrderNotification';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'sonner';

export function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { user } = useAuth();

  const handleWebSocketEvent = useCallback((event: string, data: any) => {
    if (event === 'new_order') {
      toast.success(`New order from ${data.customerName} - Table ${data.tableNumber}`);
      fetchOrders(); // Refresh orders list
    }
  }, []);

  // WebSocket connection for real-time updates
  useWebSocket({
    room: user?.shopId || '',
    roomType: 'shop',
    onEvent: handleWebSocketEvent
  });

  useEffect(() => {
    fetchOrders();
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

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UtensilsCrossed className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No {activeTab === 'all' ? '' : activeTab} orders found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {order.customerName}
                      </CardTitle>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        Table {order.tableNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(order.createdAt)}
                      </span>
                      <span className="font-semibold">₹{order.totalAmount}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Items:</h4>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} x{item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {order.orderNotes && (
                        <div>
                          <h4 className="font-medium mb-1">Notes:</h4>
                          <p className="text-sm text-gray-600">{order.orderNotes}</p>
                        </div>
                      )}

                      {order.status === 'approved' && order.estimatedReadyTime && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Info className="h-4 w-4" />
                          Ready in {order.estimatedReadyTime} minutes
                        </div>
                      )}

                      {order.status === 'rejected' && order.rejectionReason && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <Info className="h-4 w-4" />
                          {order.rejectionReason}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedOrder && (
        <OrderNotification
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
}
