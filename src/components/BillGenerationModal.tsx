import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt, CreditCard, Smartphone, Banknote, DollarSign } from 'lucide-react';
import { Bill, billingService } from '@/services/billingService';
import { useOrder } from '@/contexts/OrderContext';
import { toast } from 'sonner';

interface BillGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  tableNumber: string;
}

export function BillGenerationModal({ isOpen, onClose, shopId, tableNumber }: BillGenerationModalProps) {
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { deviceId, customerName, clearCart } = useOrder();

  const handleGenerateBill = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await billingService.generateBill({
        customerName: customerName.trim(),
        deviceId,
        shopId,
        tableNumber,
        paymentMethod: 'cash'
      });

      setGeneratedBill(response.data);
      toast.success('Bill generated successfully!');
    } catch (error: any) {
      console.error('Generate bill error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate bill');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePayment = async (paymentMethod: 'cash' | 'card' | 'upi' | 'online') => {
    if (!generatedBill) return;

    setIsProcessingPayment(true);
    try {
      await billingService.updatePaymentStatus(generatedBill._id, {
        paymentStatus: 'paid',
        paymentMethod
      });

      toast.success('Payment processed successfully!');
      clearCart(); // Clear the cart after successful payment
      onClose();
      setGeneratedBill(null);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {generatedBill ? 'Bill Generated' : 'Generate Bill'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!generatedBill ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Generate Bill?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will consolidate all your completed orders into a single bill.
                </p>
              </div>
              <Button 
                onClick={handleGenerateBill}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? 'Generating Bill...' : 'Generate Bill'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bill Header */}
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-lg">BILL</h3>
                    <p className="text-sm text-muted-foreground">#{generatedBill.billNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(generatedBill.createdAt)}</p>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="font-medium">{generatedBill.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Table:</span>
                      <span className="font-medium">{generatedBill.tableNumber}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bill Items */}
              <Card className="border-0 bg-muted/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Items</h4>
                  <div className="space-y-2">
                    {generatedBill.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">
                            ₹{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium">₹{item.totalPrice.toFixed(2)}</span>
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
                      <span>₹{generatedBill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%):</span>
                      <span>₹{generatedBill.taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{generatedBill.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <div className="flex items-center justify-center gap-2">
                <Badge 
                  variant={generatedBill.paymentStatus === 'paid' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {generatedBill.paymentStatus.toUpperCase()}
                </Badge>
              </div>

              {/* Payment Methods */}
              {generatedBill.paymentStatus === 'pending' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-center">Choose Payment Method</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePayment('cash')}
                      disabled={isProcessingPayment}
                      className="flex items-center gap-2"
                    >
                      <Banknote className="h-4 w-4" />
                      Cash
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePayment('card')}
                      disabled={isProcessingPayment}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Card
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePayment('upi')}
                      disabled={isProcessingPayment}
                      className="flex items-center gap-2"
                    >
                      <Smartphone className="h-4 w-4" />
                      UPI
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePayment('online')}
                      disabled={isProcessingPayment}
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Online
                    </Button>
                  </div>
                </div>
              )}

              {generatedBill.paymentStatus === 'paid' && (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    ✓
                  </div>
                  <p className="text-green-600 font-medium">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    Paid via {generatedBill.paymentMethod.toUpperCase()}
                  </p>
                </div>
              )}

              <Button 
                onClick={onClose} 
                variant="outline" 
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
