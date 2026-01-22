import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Hash, CheckCircle, XCircle } from 'lucide-react';
import { Order } from '@/services/orderService';
import { orderService } from '@/services/orderService';
import { toast } from 'sonner';

interface OrderNotificationProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate: () => void;
}

export function OrderNotification({ order, isOpen, onClose, onOrderUpdate }: OrderNotificationProps) {
  const [estimatedTime, setEstimatedTime] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprove = async () => {
    if (!estimatedTime.trim()) {
      toast.error('Please enter estimated ready time');
      return;
    }

    const timeInMinutes = parseInt(estimatedTime);
    if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
      toast.error('Please enter a valid time in minutes');
      return;
    }

    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(order._id, {
        status: 'approved',
        estimatedReadyTime: timeInMinutes
      });
      
      toast.success('Order approved successfully');
      onOrderUpdate();
      onClose();
    } catch (error: any) {
      console.error('Approve order error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(order._id, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
      
      toast.success('Order rejected');
      onOrderUpdate();
      onClose();
    } catch (error: any) {
      console.error('Reject order error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject order');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            New Order Received
            <Badge variant="secondary">#{order._id.slice(-6)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.customerName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span>Table {order.tableNumber}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(order.createdAt)}</span>
              </div>

              {order.orderNotes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Special Instructions:</p>
                  <p className="text-sm">{order.orderNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <div className="space-y-2">
            <h3 className="font-semibold">Order Items</h3>
            {order.items.map((item, index) => (
              <Card key={index} className="border-0 bg-muted/20">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Forms */}
          {order.status === 'pending' && (
            <div className="space-y-4 pt-2">
              {/* Approval Form */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="estimatedTime">Estimated Ready Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g., 25"
                    className="mt-1"
                    min="1"
                  />
                </div>
                
                <Button 
                  onClick={handleApprove}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Approving...' : 'Approve Order'}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Rejection Form */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Item not available, kitchen closed..."
                    className="mt-1 resize-none"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleReject}
                  disabled={isUpdating}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Rejecting...' : 'Reject Order'}
                </Button>
              </div>
            </div>
          )}

          {/* Close Button for non-pending orders */}
          {order.status !== 'pending' && (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
