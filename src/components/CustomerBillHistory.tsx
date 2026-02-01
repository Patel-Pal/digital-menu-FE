import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Bill, billingService } from '@/services/billingService';
import { useOrder } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { BillDetailModal } from './BillDetailModal';

interface CustomerBillHistoryProps {
  shopId: string;
}

export function CustomerBillHistory({ shopId }: CustomerBillHistoryProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const { deviceId } = useOrder();

  useEffect(() => {
    fetchBills();
    const interval = setInterval(fetchBills, 30000);
    return () => clearInterval(interval);
  }, [deviceId, shopId]);

  const fetchBills = async () => {
    try {
      const response = await billingService.getCustomerBills(deviceId, shopId);
      setBills(response.data || []);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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

  if (bills.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-card rounded-xl">
        <CardContent className="p-8 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No bills yet</h3>
          <p className="text-sm text-muted-foreground">Your bills will appear here after generation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {bills.map((bill) => (
          <Card key={bill._id} className="border-0 shadow-sm bg-card rounded-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold font-mono text-sm">{bill.billNumber}</span>
                    <Badge className={`text-xs ${getStatusColor(bill.paymentStatus)} rounded-full border`}>
                      {getStatusIcon(bill.paymentStatus)}
                      <span className="ml-1 capitalize">{bill.paymentStatus}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Table {bill.tableNumber} • {formatDate(bill.createdAt)} {formatTime(bill.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">₹{bill.totalAmount.toFixed(2)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBill(bill)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {bill.paymentStatus === 'pending' && (
                <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Payment Pending - Please proceed to counter
                  </p>
                </div>
              )}

              {bill.paymentStatus === 'paid' && bill.paidAt && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Paid via {bill.paymentMethod.toUpperCase()} • {formatDate(bill.paidAt)} {formatTime(bill.paidAt)}
                  </p>
                </div>
              )}

              <div className="space-y-1 pt-2 border-t">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{bill.items.length} items</span>
                  <span className="text-muted-foreground">Subtotal: ₹{bill.subtotal.toFixed(2)}</span>
                </div>
                {bill.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                    <span className="font-medium">₹{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
                {bill.items.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{bill.items.length - 2} more items
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          onBillUpdate={() => {
            fetchBills();
            setSelectedBill(null);
          }}
        />
      )}
    </>
  );
}
