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
  Clock,
  Printer
} from 'lucide-react';
import { Bill, billingService } from '@/services/billingService';
import { toast } from 'sonner';

interface BillDetailModalProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
  onBillUpdate: () => void;
  isCustomer?: boolean;
}

export function BillDetailModal({ bill, isOpen, onClose, onBillUpdate, isCustomer = false }: BillDetailModalProps) {
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    
    const itemsHtml = bill.items.map(item => `
      <tr>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd">${item.name}</td>
        <td style="padding:4px 8px;text-align:center;border-bottom:1px dashed #ddd">${item.quantity}</td>
        <td style="padding:4px 0;text-align:right;border-bottom:1px dashed #ddd">₹${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html><head><title>Bill - ${bill.billNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; font-size: 12px; }
        h2 { text-align: center; margin: 0 0 4px; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-weight: bold; font-size: 14px; }
        @media print { body { margin: 0; padding: 10px; } }
      </style></head><body>
        <h2>BILL</h2>
        <p class="center">${bill.billNumber}</p>
        <div class="line"></div>
        <p>Customer: ${bill.customerName}</p>
        <p>Table: ${bill.tableNumber}</p>
        <p>Date: ${formatDate(bill.createdAt)}</p>
        <div class="line"></div>
        <table>
          <tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr>
          ${itemsHtml}
        </table>
        <div class="line"></div>
        <table>
          <tr><td>Subtotal</td><td style="text-align:right">₹${bill.subtotal.toFixed(2)}</td></tr>
          <tr><td>Tax (5%)</td><td style="text-align:right">₹${bill.taxAmount.toFixed(2)}</td></tr>
        </table>
        <div class="line"></div>
        <table><tr class="total"><td>TOTAL</td><td style="text-align:right">₹${bill.totalAmount.toFixed(2)}</td></tr></table>
        <div class="line"></div>
        <p class="center">Payment: ${bill.paymentMethod.toUpperCase()}</p>
        <p class="center">Status: ${bill.paymentStatus.toUpperCase()}</p>
        <div class="line"></div>
        <p class="center" style="margin-top:12px">Thank you!</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-3 sm:p-6 mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Receipt className="h-5 w-5" />
            Bill Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Bill Header */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-1.5 mb-3">
                <h3 className="font-bold text-base sm:text-lg">BILL</h3>
                <p className="text-xs sm:text-sm font-mono break-all">{bill.billNumber}</p>
                <Badge className={`text-xs ${getStatusColor(bill.paymentStatus)} rounded-full border`}>
                  {getStatusIcon(bill.paymentStatus)}
                  <span className="ml-1 capitalize">{bill.paymentStatus}</span>
                </Badge>
              </div>
              
              <Separator className="my-2.5" />
              
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium truncate">{bill.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Table:</span>
                  <span className="font-medium">{bill.tableNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDate(bill.createdAt)}</span>
                </div>
                {bill.paidAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
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
            <CardContent className="p-3 sm:p-4">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Items ({bill.items.length})</h4>
              <div className="space-y-2">
                {bill.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-xs sm:text-sm flex-shrink-0">₹{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>₹{bill.taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>Total:</span>
                  <span>₹{bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order References */}
          <Card className="border-0 bg-muted/20">
            <CardContent className="p-3 sm:p-4">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Related Orders</h4>
              <div className="flex flex-wrap gap-1.5">
                {bill.orderIds.map((orderId, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-mono">
                    #{orderId.slice(-6)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isCustomer && bill.paymentStatus === 'pending' && (
            <div className="space-y-3">
              {/* Payment Method Selection */}
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-3 sm:p-4">
                  <h4 className="font-semibold mb-2 text-center text-sm sm:text-base">Select Payment Method</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentMethodUpdate('cash')}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 text-xs sm:text-sm"
                    >
                      <Banknote className="h-3.5 w-3.5" />
                      Cash
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentMethodUpdate('card')}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 text-xs sm:text-sm"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Card
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === 'upi' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentMethodUpdate('upi')}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 text-xs sm:text-sm"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      UPI
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === 'online' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentMethodUpdate('online')}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 text-xs sm:text-sm"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      Online
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  Print
                </Button>
                <Button
                  onClick={() => handlePaymentStatusUpdate('paid')}
                  disabled={isUpdating}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  {isUpdating ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </div>
              <Button
                onClick={() => handlePaymentStatusUpdate('failed')}
                disabled={isUpdating}
                variant="destructive"
                className="w-full text-xs sm:text-sm"
                size="sm"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Mark as Failed
              </Button>
            </div>
          )}

          {bill.paymentStatus === 'paid' && (
            <Card className="border-0 bg-green-50">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <p className="text-green-600 font-medium mb-1 text-sm">Payment Completed</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Paid via {bill.paymentMethod.toUpperCase()}
                  {bill.paidAt && ` on ${formatDate(bill.paidAt)}`}
                </p>
              </CardContent>
            </Card>
          )}

          {bill.paymentStatus === 'failed' && (
            <Card className="border-0 bg-red-50">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <p className="text-red-600 font-medium mb-2 text-sm">Payment Failed</p>
                {!isCustomer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePaymentStatusUpdate('paid')}
                    disabled={isUpdating}
                    className="border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Retry Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Button onClick={onClose} variant="outline" className="w-full text-sm" size="sm">
            Close
          </Button>
          {!isCustomer && (
            <Button onClick={handlePrint} variant="ghost" className="w-full text-sm" size="sm">
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print Bill
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
