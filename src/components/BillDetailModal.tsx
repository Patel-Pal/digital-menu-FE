import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Receipt, 
  User, 
  Hash, 
  Calendar, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Bill, billingService } from '@/services/billingService';
import { toast } from 'sonner';

interface BillDetailModalProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
  onBillUpdate: () => void;
}

export function BillDetailModal({ bill, isOpen, onClose, onBillUpdate }: BillDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(bill.paymentMethod);

  const handlePaymentStatusUpdate = async (status: 'paid' | 'failed') => {
    setIsUpdating(true);
    try {
      await billingService.updatePaymentStatus(bill._id, {
        paymentStatus: status,
        paymentMethod: selectedPaymentMethod
      });
      
      toast.success(`Payment marked as ${status}`);
      onBillUpdate();
    } catch (error: any) {
      console.error('Update payment status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentMethodUpdate = async (method: 'cash' | 'card' | 'upi' | 'online') => {
    setSelectedPaymentMethod(method);
    if (bill.paymentStatus === 'pending') {
      setIsUpdating(true);
      try {
        await billingService.updatePaymentStatus(bill._id, {
          paymentStatus: 'pending',
          paymentMethod: method
        });
        onBillUpdate();
      } catch (error: any) {
        console.error('Update payment method error:', error);
        toast.error('Failed to update payment method');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'upi': return <Smartphone className="h-4 w-4" />;
      case 'online': return <DollarSign className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Bill Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bill Header */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4">
              <div className="text-center space-y-2 mb-4">
                <h3 className="font-bold text-lg">BILL</h3>
                <p className="text-sm font-mono">{bill.billNumber}</p>
                <Badge className={`text-xs ${getStatusColor(bill.paymentStatus)} rounded-full border`}>
                  {getStatusIcon(bill.paymentStatus)}
                  <span className="ml-1 capitalize">{bill.paymentStatus}</span>
                </Badge>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{bill.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Table:</span>
                  <span className="font-medium">{bill.tableNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDate(bill.createdAt)}</span>
                </div>
                {bill.paidAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="font-medium">{formatDate(bill.paidAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {getPaymentIcon(bill.paymentMethod)}
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium capitalize">{bill.paymentMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Items */}
          <Card className="border-0 bg-muted/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Items ({bill.items.length})</h4>
              <div className="space-y-3">
                {bill.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-sm">₹{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>₹{bill.taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order References */}
          <Card className="border-0 bg-muted/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Related Orders</h4>
              <div className="flex flex-wrap gap-2">
                {bill.orderIds.map((orderId, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-mono">
                    #{orderId.slice(-6)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {bill.paymentStatus === 'pending' && (
            <div className="space-y-4">
              {/* Payment Method Selection */}
              <Card className="border-0 bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 text-center">Select Payment Method</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentMethodUpdate('cash')}
                      disabled={isUpdating}
                      className="flex items-center gap-2"
                    >
                      <Banknote className="h-4 w-4" />
                      Cash
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentMethodUpdate('card')}
                      disabled={isUpdating}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Card
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === 'upi' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentMethodUpdate('upi')}
                      disabled={isUpdating}
                      className="flex items-center gap-2"
                    >
                      <Smartphone className="h-4 w-4" />
                      UPI
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === 'online' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentMethodUpdate('online')}
                      disabled={isUpdating}
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Online
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePaymentStatusUpdate('paid')}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Processing...' : 'Mark as Paid'}
                </Button>
                <Button
                  onClick={() => handlePaymentStatusUpdate('failed')}
                  disabled={isUpdating}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Failed
                </Button>
              </div>
            </div>
          )}

          {bill.paymentStatus === 'paid' && (
            <Card className="border-0 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-green-600 font-medium mb-1">Payment Completed</p>
                <p className="text-sm text-muted-foreground">
                  Paid via {bill.paymentMethod.toUpperCase()}
                  {bill.paidAt && ` on ${formatDate(bill.paidAt)}`}
                </p>
              </CardContent>
            </Card>
          )}

          {bill.paymentStatus === 'failed' && (
            <Card className="border-0 bg-red-50">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-red-600 font-medium mb-3">Payment Failed</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaymentStatusUpdate('paid')}
                  disabled={isUpdating}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Retry Payment
                </Button>
              </CardContent>
            </Card>
          )}

          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
