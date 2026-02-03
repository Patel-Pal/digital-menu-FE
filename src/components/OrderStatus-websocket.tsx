import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Timer } from 'lucide-react';
import { Order } from '@/services/orderService';
import { orderService } from '@/services/orderService';
import { useOrder } from '@/contexts/OrderContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'sonner';

interface OrderStatusProps {
  shopId: string;
}

export function OrderStatus({ shopId }: OrderStatusProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { deviceId } = useOrder();

  const handleWebSocketEvent = useCallback((event: string, data: any) => {
    if (event === 'order_status_updated') {
      // Update specific order status
      setOrders(prev => prev.map(order => 
        order._id === data.orderId 
          ? { ...order, status: data.status, estimatedReadyTime: data.estimatedReadyTime }
          : order
      ));
      
      // Show notification based on status
      if (data.status === 'approved') {
        toast.success(`Order approved! Ready in ${data.estimatedReadyTime} minutes`);
      } else if (data.status === 'rejected') {
        toast.error(`Order rejected: ${data.rejectionReason}`);
      } else if (data.status === 'completed') {
        toast.success('Order completed! Ready for pickup');
      }
    }
  }, []);

  // WebSocket connection for real-time updates
  useWebSocket({
    room: deviceId,
    roomType: 'customer',
    onEvent: handleWebSocketEvent
  });

  useEffect(() => {
    fetchOrders();
  }, [deviceId, shopId]);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getCustomerOrders(deviceId, shopId);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          No orders found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Orders</h3>
      {orders.map((order) => (
        <Card key={order._id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Order #{order._id.slice(-6)}</span>
                <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <span className="text-sm text-gray-500">{formatTime(order.createdAt)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Table:</span> {order.tableNumber}
              </div>
              <div className="text-sm">
                <span className="font-medium">Total:</span> ₹{order.totalAmount}
              </div>
              
              {order.status === 'approved' && order.estimatedReadyTime && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Timer className="h-4 w-4" />
                  Ready in {order.estimatedReadyTime} minutes
                </div>
              )}
              
              {order.status === 'rejected' && order.rejectionReason && (
                <div className="text-sm text-red-600">
                  <span className="font-medium">Reason:</span> {order.rejectionReason}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Items: {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
