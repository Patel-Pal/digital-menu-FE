import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Timer } from 'lucide-react';
import { Order } from '@/services/orderService';
import { orderService } from '@/services/orderService';
import { useOrder } from '@/contexts/OrderContext';

interface OrderStatusProps {
  shopId: string;
}

export function OrderStatus({ shopId }: OrderStatusProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { deviceId } = useOrder();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
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
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const CountdownTimer = ({ order }: { order: Order }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
      if (order.status !== 'approved' || !order.estimatedReadyTime) return;

      const approvedTime = new Date(order.updatedAt).getTime();
      const totalEstimatedTime = order.estimatedReadyTime * 60 * 1000;
      const endTime = approvedTime + totalEstimatedTime;

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(remaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, [order._id, order.status, order.estimatedReadyTime]);

    if (order.status !== 'approved' || !order.estimatedReadyTime) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-800">Ready in:</span>
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-green-600" />
          <span className="font-mono font-bold text-lg text-green-700">
            {timeLeft > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : '🎉 Ready!'}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-sm bg-card animate-pulse rounded-xl">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-card rounded-xl">
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No recent orders</h3>
          <p className="text-sm text-muted-foreground">Your orders will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order._id} className="border-0 shadow-sm bg-card rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Order #{order._id.slice(-6)}</span>
                  <Badge className={`text-xs ${getStatusColor(order.status)} rounded-full border`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Table {order.tableNumber} • {formatTime(order.createdAt)}
                </p>
              </div>
              <span className="font-bold text-lg">₹{order.totalAmount.toFixed(2)}</span>
            </div>

            {order.status === 'approved' && order.estimatedReadyTime && (
              <div className="mb-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <CountdownTimer order={order} />
              </div>
            )}

            {order.status === 'rejected' && order.rejectionReason && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Order Rejected</p>
                <p className="text-sm text-red-700 dark:text-red-300">{order.rejectionReason}</p>
              </div>
            )}

            <div className="space-y-1 pt-2 border-t">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
