import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Clock, CheckCircle, XCircle, Receipt, CreditCard, DollarSign, Timer, Users,
  ShoppingBag, Banknote, Smartphone, Globe, X,
} from 'lucide-react';
import { TableData, PaymentMethod } from '@/services/orderService';

export interface TableCardProps {
  table: TableData;
  onApproveOrder: (orderId: string) => Promise<void>;
  onRejectOrder: (orderId: string, reason: string) => Promise<void>;
  onCompleteOrder: (orderId: string) => Promise<void>;
  onGenerateBill: (table: TableData) => Promise<void>;
  onMarkPaid: (billId: string, method: PaymentMethod) => Promise<void>;
}

const STATUS_CFG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Pending', dot: 'bg-amber-500' },
  approved: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'In Progress', dot: 'bg-blue-500' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completed', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', label: 'Rejected', dot: 'bg-red-500' },
};

function getElapsedTime(t: string): string {
  const m = Math.floor((Date.now() - new Date(t).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return m % 60 > 0 ? `${h}h ${m % 60}m` : `${h}h`;
}

function getCardAccent(table: TableData): string {
  if (table.orders.some(o => o.status === 'pending')) return 'border-l-amber-500';
  if (table.orders.some(o => o.status === 'approved')) return 'border-l-blue-500';
  if (table.orders.some(o => o.status === 'completed' && o.billingStatus === 'unbilled')) return 'border-l-emerald-500';
  if (table.bill?.paymentStatus === 'pending') return 'border-l-purple-500';
  return 'border-l-gray-300';
}

function getStatusTag(table: TableData): { label: string; cls: string } {
  if (table.orders.some(o => o.status === 'pending')) return { label: 'New Orders', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' };
  if (table.orders.some(o => o.status === 'approved')) return { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' };
  if (table.orders.some(o => o.status === 'completed' && o.billingStatus === 'unbilled')) return { label: 'Ready to Bill', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' };
  if (table.bill?.paymentStatus === 'pending') return { label: 'Awaiting Payment', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' };
  return { label: 'Active', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400' };
}

export function TableCard({ table, onApproveOrder, onRejectOrder, onCompleteOrder, onGenerateBill, onMarkPaid }: TableCardProps) {
  const [open, setOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const sortedOrders = useMemo(
    () => [...table.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [table.orders],
  );
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
                Orders ({table.orders.length})
              </p>
              <div className="space-y-2">
                {sortedOrders.map((order) => {
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
                  ) : (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 border-0">Unpaid</Badge>
                  )}
                </div>
                <div className="p-3 space-y-2">
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
                    <div className="flex justify-between text-muted-foreground"><span>Tax</span><span className="tabular-nums">₹{table.bill.taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-sm pt-1"><span>Total</span><span className="text-primary tabular-nums">₹{table.bill.totalAmount.toFixed(2)}</span></div>
                  </div>

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
                      <Button className="w-full h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={!paymentMethod || loadingAction === 'mark-paid'}
                        onClick={() => paymentMethod && table.bill && act('mark-paid', () => onMarkPaid(table.bill!._id, paymentMethod as PaymentMethod))}>
                        <DollarSign className="h-4 w-4 mr-1" /> Mark as Paid
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
