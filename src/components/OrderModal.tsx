import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, X } from 'lucide-react';
import { useOrder } from '@/contexts/OrderContext';
import { orderService } from '@/services/orderService';
import { toast } from 'sonner';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
}

export function OrderModal({ isOpen, onClose, shopId }: OrderModalProps) {
  const { cart, updateQuantity, removeFromCart, getTotalAmount, clearCart, deviceId, customerName, setCustomerName } = useOrder();
  const [tableNumber, setTableNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!tableNumber.trim()) {
      toast.error('Please enter table number');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        shopId,
        customerName: customerName.trim(),
        tableNumber: tableNumber.trim(),
        orderNotes: orderNotes.trim(),
        deviceId,
        items: cart.map(item => ({
          menuItemId: item.menuItem._id,
          quantity: item.quantity
        }))
      };

      await orderService.createOrder(orderData);
      
      toast.success('Order placed successfully! Please wait for confirmation.');
      clearCart();
      onClose();
      setTableNumber('');
      setOrderNotes('');
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md h-[95vh] max-h-[650px] p-0 gap-0 bg-slate-900 border-slate-700 shadow-2xl">
        <DialogHeader className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
          <DialogTitle className="text-lg font-semibold text-white">Place Your Order</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Customer Details */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-sm font-medium text-slate-300">Your Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="h-11 text-base bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tableNumber" className="text-sm font-medium text-slate-300">Table Number</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter table number"
                className="h-11 text-base bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="orderNotes" className="text-sm font-medium text-slate-300">Special Instructions</Label>
              <Textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special requests..."
                className="resize-none text-base min-h-[70px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
                rows={2}
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Order Summary</h3>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">{cart.length} items</span>
            </div>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.menuItem._id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/30 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg bg-slate-700/50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                      {item.menuItem.image ? (
                        <img src={item.menuItem.image} alt={item.menuItem.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🍽️</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm leading-tight mb-1">{item.menuItem.name}</h4>
                      <p className="text-xs text-slate-400 mb-3">₹{item.menuItem.price.toFixed(2)} each</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-slate-700/50 rounded-full p-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-slate-600 text-white"
                            onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-semibold text-white text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-slate-600 text-white"
                            onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                          onClick={() => removeFromCart(item.menuItem._id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section */}
        <div className="border-t border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 space-y-3">
          {/* Total */}
          <div className="flex justify-between items-center bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <span className="text-base font-medium text-slate-300">Total</span>
            <span className="text-xl font-bold text-white">₹{getTotalAmount().toFixed(2)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-11 text-base border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitOrder} 
              disabled={isSubmitting || cart.length === 0}
              className="flex-1 h-11 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
