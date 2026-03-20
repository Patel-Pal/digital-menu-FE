import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt } from 'lucide-react';
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
        tableNumber
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

  const handleBillGenerated = () => {
    if (generatedBill) {
      clearCart(); // Clear the cart after bill generation
      toast.success('Bill generated! Please proceed to payment counter.');
      onClose();
      setGeneratedBill(null);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6 mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Receipt className="h-5 w-5" />
            {generatedBill ? 'Bill Generated' : 'Generate Bill'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {!generatedBill ? (
            <div className="text-center space-y-3 sm:space-y-4 py-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Receipt className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1.5">Ready to Generate Bill?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  This will consolidate all your completed orders into a single bill.
                </p>
              </div>
              <div className="px-2 pb-2">
                <Button 
                  onClick={handleGenerateBill}
                  disabled={isGenerating}
                  className="w-full py-1 text-base"
                  size="lg"
                >
                  {isGenerating ? 'Generating Bill...' : 'Generate Bill'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Bill Header */}
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-base sm:text-lg">BILL</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">#{generatedBill.billNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(generatedBill.createdAt)}</p>
                  </div>
                  <Separator className="my-2.5" />
                  <div className="space-y-1 text-xs sm:text-sm">
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
                <CardContent className="p-3 sm:p-4">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Items</h4>
                  <div className="space-y-2">
                    {generatedBill.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-muted-foreground">
                            ₹{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium flex-shrink-0">₹{item.totalPrice.toFixed(2)}</span>
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
                      <span>₹{generatedBill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%):</span>
                      <span>₹{generatedBill.taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base sm:text-lg">
                      <span>Total:</span>
                      <span>₹{generatedBill.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <div className="flex items-center justify-center">
                <Badge 
                  variant="secondary"
                  className="text-xs"
                >
                  PENDING PAYMENT
                </Badge>
              </div>

              {/* Payment Instructions */}
              <div className="text-center space-y-2.5 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-lg mb-1">Bill Generated Successfully!</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    Please proceed to the payment counter with your bill number
                  </p>
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-0.5">Bill Number</p>
                    <p className="font-mono font-bold text-base sm:text-lg">{generatedBill.billNumber}</p>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-2">
                <Button 
                  onClick={handleBillGenerated} 
                  className="w-full py-1 text-base"
                  size="lg"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
