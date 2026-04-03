import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Clock, CheckCircle, XCircle, Receipt, CreditCard, DollarSign, Timer, Users,
  ShoppingBag, Banknote, Smartphone, Globe, X, Printer, Hash, Calendar,
} from 'lucide-react';
import { TableData, PaymentMethod } from '@/services/orderService';
import { getElapsedTime, getCardAccent, getStatusTag } from '@/utils/tableUtils';

export interface TableCardProps {
  table: TableData;
  onApproveOrder: (orderId: string) => Promise<void>;
  onRejectOrder: (orderId: string, reason: string) => Promise<void>;
  onCompleteOrder: (orderId: string) => Promise<void>;
  onGenerateBill: (table: TableData) => Promise<void>;
  onMarkPaid: (billId: string, method: PaymentMethod) => Promise<void>;
  onMarkFailed?: (billId: string) => Promise<void>;
}

const STATUS_CFG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Pending', dot: 'bg-amber-500' },
  approved: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'In Progress', dot: 'bg-blue-500' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completed', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', label: 'Rejected', dot: 'bg-red-500' },
};

export function TableCard({ table, onApproveOrder, onRejectOrder, onCompleteOrder, onGenerateBill, onMarkPaid, onMarkFailed }: TableCardProps) {
  const [open, setOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const activeOrders = useMemo(() => {
    const statusPriority: Record<string, number> = { pending: 0, approved: 1 };
    return table.orders
      .filter(o => o.status === 'pending' || o.status === 'approved')
      .sort((a, b) => {
        const priorityDiff = (statusPriority[a.status] ?? 2) - (statusPriority[b.status] ?? 2);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [table.orders]);
  const pendingCount = table.orders.filter(o => o.status === 'pending').length;
  const hasCompletedUnbilled = table.orders.some(o => o.status === 'completed' && o.billingStatus === 'unbilled');
  const accent = getCardAccent(table);
  const tag = getStatusTag(table);

  const act = async (id: string, fn: () => Promise<void>) => {
    setLoadingAction(id);
    try { await fn(); } finally { setLoadingAction(null); }
  };

  const openReject = (id: string) => { setRejectOrderId(id); setRejectReason(''); setRejectDialogOpen(true); };
  const confirmReject = async () => {
    if (!rejectOrderId || !rejectReason.trim()) return;
    setLoadingAction(`reject-${rejectOrderId}`);
    try { await onRejectOrder(rejectOrderId, rejectReason.trim()); }
    finally { setLoadingAction(null); setRejectDialogOpen(false); setRejectOrderId(null); setRejectReason(''); }
  };

  const handlePrintBill = (bill: NonNullable<TableData['bill']>) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    const itemsHtml = bill.items.map(item => `
      <tr>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd">${item.name}</td>
        <td style="padding:4px 8px;text-align:center;border-bottom:1px dashed #ddd">${item.quantity}</td>
        <td style="padding:4px 0;text-align:right;border-bottom:1px dashed #ddd">₹${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');
    const dateStr = new Date(bill.createdAt || Date.now()).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        <p>Customer: ${table.customerName}</p>
        <p>Table: ${table.tableNumber}</p>
        <p>Date: ${dateStr}</p>
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
        <p class="center">Status: ${bill.paymentStatus.toUpperCase()}</p>
        <div class="line"></div>
        <p class="center" style="margin-top:12px">Thank you!</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // ─── Compact Card (default) ───
  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]`}
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Table number + status badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {table.tableNumber}
                </div>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm">Table {table.tableNumber}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> {table.customerName}
                </p>
              </div>
            </div>
            <Badge className={`${tag.cls} text-[10px] font-semibold px-2 py-0.5 border-0`}>
              {tag.label}
            </Badge>
          </div>

          {/* Row 2: Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" /> {table.orders.length} order{table.orders.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" /> {getElapsedTime(table.firstOrderTime)}
              </span>
            </div>
            <p className="font-bold text-primary text-sm">₹{table.totalAmount.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-0">
          {/* Dialog Header */}
          <div className={`sticky top-0 z-10 bg-background border-b border-border/40 px-5 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-lg">
                  {table.tableNumber}
                </div>
                <div>
                  <h3 className="font-bold text-base">Table {table.tableNumber}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {table.customerName} · {getElapsedTime(table.firstOrderTime)}
                  </p>
                </div>
              </div>
              <Badge className={`${tag.cls} text-[10px] font-semibold px-2 py-0.5 border-0`}>{tag.label}</Badge>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Orders */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Active Orders ({activeOrders.length})
              </p>
              {activeOrders.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">No active orders</p>
              )}
              <div className="space-y-2">
                {activeOrders.map((order) => {
                  const c = STATUS_CFG[order.status] || STATUS_CFG.pending;
                  return (
                    <div key={order._id} className={`rounded-lg ${c.bg} p-3 space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                          <span className="font-mono text-[11px] text-muted-foreground">#{order._id.slice(-6)}</span>
                        </div>
                        <span className={`text-[11px] font-semibold ${c.text}`}>{c.label}</span>
                      </div>
                      <div className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                            <span className="font-medium tabular-nums">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {order.orderNotes && (
                        <p className="text-[11px] text-muted-foreground italic bg-background/50 rounded px-2 py-1">📝 {order.orderNotes}</p>
                      )}
                      {order.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-8 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={loadingAction === `approve-${order._id}`}
                            onClick={(e) => { e.stopPropagation(); act(`approve-${order._id}`, () => onApproveOrder(order._id)); }}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                            disabled={loadingAction === `reject-${order._id}`}
                            onClick={(e) => { e.stopPropagation(); openReject(order._id); }}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {order.status === 'approved' && (
                        <Button size="sm" variant="outline" className="h-8 text-xs w-full"
                          disabled={loadingAction === `complete-${order._id}`}
                          onClick={(e) => { e.stopPropagation(); act(`complete-${order._id}`, () => onCompleteOrder(order._id)); }}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Complete
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-2 border-t border-border/40">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-primary">₹{table.totalAmount.toFixed(2)}</span>
            </div>

            {/* Generate Bill */}
            {!table.bill && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button className="w-full h-9 text-xs font-semibold" disabled={!hasCompletedUnbilled || loadingAction === 'gen-bill'}
                      onClick={() => act('gen-bill', () => onGenerateBill(table))}>
                      <Receipt className="h-4 w-4 mr-1.5" /> Generate Bill
                    </Button>
                  </div>
                </TooltipTrigger>
                {!hasCompletedUnbilled && <TooltipContent><p>Complete orders first to generate bill</p></TooltipContent>}
              </Tooltip>
            )}

            {/* Bill Details */}
            {table.bill && (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="bg-muted/40 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold">{table.bill.billNumber}</span>
                  </div>
                  {table.bill.paymentStatus === 'paid' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 border-0">✓ Paid</Badge>
                  ) : table.bill.paymentStatus === 'failed' ? (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 border-0">✗ Failed</Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 border-0">Unpaid</Badge>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  {/* Bill meta info */}
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(table.bill.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {table.bill.paidAt && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        <span>Paid {new Date(table.bill.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Itemized charges */}
                  <div className="space-y-0.5">
                    {table.bill.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                        <span className="tabular-nums">₹{item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/40 pt-2 space-y-0.5 text-xs">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">₹{table.bill.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Tax (5%)</span><span className="tabular-nums">₹{table.bill.taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-sm pt-1"><span>Total</span><span className="text-primary tabular-nums">₹{table.bill.totalAmount.toFixed(2)}</span></div>
                  </div>

                  {/* Related orders */}
                  {table.bill.orderIds && table.bill.orderIds.length > 0 && (
                    <div className="border-t border-border/40 pt-2">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Related Orders</p>
                      <div className="flex flex-wrap gap-1">
                        {table.bill.orderIds.map((oid, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                            #{typeof oid === 'string' ? oid.slice(-6) : oid}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment section for pending bills */}
                  {table.bill.paymentStatus === 'pending' && (
                    <div className="border-t border-border/40 pt-3 space-y-2">
                      <p className="text-[11px] font-medium text-muted-foreground">Payment Method</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {([
                          { value: 'cash' as PaymentMethod, icon: <Banknote className="h-4 w-4" />, label: 'Cash' },
                          { value: 'card' as PaymentMethod, icon: <CreditCard className="h-4 w-4" />, label: 'Card' },
                          { value: 'upi' as PaymentMethod, icon: <Smartphone className="h-4 w-4" />, label: 'UPI' },
                          { value: 'online' as PaymentMethod, icon: <Globe className="h-4 w-4" />, label: 'Online' },
                        ]).map((m) => (
                          <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-medium transition-all ${
                              paymentMethod === m.value
                                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                            }`}>
                            {m.icon}{m.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 text-xs flex-shrink-0"
                          onClick={() => handlePrintBill(table.bill!)}>
                          <Printer className="h-3.5 w-3.5 mr-1" /> Print
                        </Button>
                        <Button className="flex-1 h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={!paymentMethod || loadingAction === 'mark-paid'}
                          onClick={() => paymentMethod && table.bill && act('mark-paid', () => onMarkPaid(table.bill!._id, paymentMethod as PaymentMethod))}>
                          <DollarSign className="h-4 w-4 mr-1" /> Confirm Payment
                        </Button>
                      </div>
                      {onMarkFailed && (
                        <Button variant="destructive" size="sm" className="w-full h-8 text-xs"
                          disabled={loadingAction === 'mark-failed'}
                          onClick={() => table.bill && act('mark-failed', () => onMarkFailed!(table.bill!._id))}>
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Mark as Failed
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Paid state */}
                  {table.bill.paymentStatus === 'paid' && (
                    <div className="border-t border-border/40 pt-3">
                      <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-3 text-center space-y-1">
                        <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Payment Completed</p>
                        <p className="text-[10px] text-muted-foreground">
                          via {table.bill.paymentMethod?.toUpperCase() || 'N/A'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full h-8 text-xs mt-2"
                        onClick={() => handlePrintBill(table.bill!)}>
                        <Printer className="h-3.5 w-3.5 mr-1" /> Print Bill
                      </Button>
                    </div>
                  )}

                  {/* Failed state with retry */}
                  {table.bill.paymentStatus === 'failed' && (
                    <div className="border-t border-border/40 pt-3 space-y-2">
                      <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3 text-center space-y-1">
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                        <p className="text-xs font-medium text-red-700 dark:text-red-400">Payment Failed</p>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground">Retry with payment method</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {([
                          { value: 'cash' as PaymentMethod, icon: <Banknote className="h-4 w-4" />, label: 'Cash' },
                          { value: 'card' as PaymentMethod, icon: <CreditCard className="h-4 w-4" />, label: 'Card' },
                          { value: 'upi' as PaymentMethod, icon: <Smartphone className="h-4 w-4" />, label: 'UPI' },
                          { value: 'online' as PaymentMethod, icon: <Globe className="h-4 w-4" />, label: 'Online' },
                        ]).map((m) => (
                          <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-medium transition-all ${
                              paymentMethod === m.value
                                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                            }`}>
                            {m.icon}{m.label}
                          </button>
                        ))}
                      </div>
                      <Button className="w-full h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={!paymentMethod || loadingAction === 'mark-paid'}
                        onClick={() => paymentMethod && table.bill && act('mark-paid', () => onMarkPaid(table.bill!._id, paymentMethod as PaymentMethod))}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Retry Payment
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Reject Order</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <label htmlFor="reject-reason" className="text-sm font-medium">Reason for rejection</label>
            <Input id="reject-reason" placeholder="Enter rejection reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" disabled={!rejectReason.trim() || loadingAction?.startsWith('reject-')} onClick={confirmReject}>Reject Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
