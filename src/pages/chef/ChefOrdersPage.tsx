import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderService, type Order } from "@/services/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useNotificationSoundSettings } from "@/contexts/NotificationSoundContext";
import { toast } from "sonner";

type ChefTab = "pending" | "approved";

export function ChefOrdersPage() {
  const { user } = useAuth();
  const shopId = user?.shopId || "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChefTab>("pending");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [counts, setCounts] = useState({ pending: 0, approved: 0 });
  const { playSound } = useNotificationSoundSettings();

  const fetchOrders = useCallback(async () => {
    if (!shopId) return;
    try {
      const response = await orderService.getShopOrders(shopId, undefined, 1, 100);
      const all = response.data || [];
      const filtered = all
        .filter((o) => o.status === "approved" || o.status === "pending")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(filtered);
      setCounts({
        pending: all.filter((o) => o.status === "pending").length,
        approved: all.filter((o) => o.status === "approved").length,
      });
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const handleWebSocketEvent = useCallback(
    (event: string, data: any) => {
      if (event === "new_order") {
        playSound();
        toast.info(
          `🆕 New order from ${data.customerName} — Table ${data.tableNumber}`,
          { duration: 5000 }
        );
        fetchOrders();
      }
      if (event === "order_status_updated") {
        // Only notify for status changes the chef didn't initiate
        if (data.status === "approved") {
          playSound();
          toast.success(
            `✅ Order approved — Table ${data.tableNumber} (${data.customerName})`,
            { duration: 5000 }
          );
        } else if (data.status === "rejected") {
          toast.info(
            `❌ Order rejected — Table ${data.tableNumber} (${data.customerName})`,
            { duration: 4000 }
          );
        }
        fetchOrders();
      }
    },
    [fetchOrders, playSound]
  );

  useWebSocket({ room: shopId, roomType: "shop", onEvent: handleWebSocketEvent });

  useEffect(() => { setLoading(true); fetchOrders(); }, [fetchOrders]);

  const handleMarkComplete = async (orderId: string) => {
    setCompletingOrderId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, { status: "completed" });
      toast.success("Order marked as completed");
      fetchOrders();
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setCompletingOrderId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
      approved: { icon: <CheckCircle className="h-3 w-3" />, className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
      rejected: { icon: <XCircle className="h-3 w-3" />, className: "bg-red-500/15 text-red-600 border-red-500/30" },
    };
    const c = config[status] || config.pending;
    return (
      <Badge className={`${c.className} text-[11px] font-semibold gap-1 px-2 py-0.5`}>
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const visibleOrders = orders.filter((o) => o.status === activeTab);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="px-4 py-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
          <Button variant="ghost" size="sm" onClick={() => fetchOrders()} className="h-8 px-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Two Tabs: Pending & Approved */}
        <div className="flex gap-2">
          {([
            { value: "pending" as ChefTab, label: "Pending", count: counts.pending },
            { value: "approved" as ChefTab, label: "Approved", count: counts.approved },
          ]).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 ${
                activeTab === tab.value
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Order Cards */}
        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const isCompleting = completingOrderId === order._id;
            return (
              <Card key={order._id} className="border-0 shadow-sm bg-card rounded-xl overflow-hidden">
                <CardContent className="p-0">
                  <button className="w-full text-left p-4 focus:outline-none" onClick={() => toggleExpand(order._id)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">{order.tableNumber}</span>
                        <p className="text-xs text-muted-foreground">Table {order.tableNumber} · {formatTime(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="space-y-1 mb-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold flex-shrink-0">{item.quantity}</span>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                      <span className="text-sm font-bold text-primary">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </button>

                  {!isExpanded && order.status === "approved" && (
                    <div className="px-4 pb-3">
                      <Button className="w-full rounded-xl" size="sm" onClick={(e) => { e.stopPropagation(); handleMarkComplete(order._id); }} disabled={isCompleting}>
                        {isCompleting ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating...</>) : (<><CheckCircle className="h-4 w-4 mr-2" />Mark Complete</>)}
                      </Button>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="border-t border-border/50 px-4 pb-4">
                      <div className="mt-3 rounded-lg border border-border/50 overflow-hidden">
                        <div className="bg-muted/50 px-3 py-1.5">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Order Items</span>
                        </div>
                        <div className="divide-y divide-border/20">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold">{item.quantity}</span>
                                <span className="text-sm font-medium">{item.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-border/50 flex items-center justify-between px-3 py-2">
                          <span className="text-sm font-semibold">Total</span>
                          <span className="text-sm font-bold text-primary">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      {order.status === "approved" && (
                        <Button className="w-full mt-3 rounded-xl" onClick={(e) => { e.stopPropagation(); handleMarkComplete(order._id); }} disabled={isCompleting}>
                          {isCompleting ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating...</>) : (<><CheckCircle className="h-4 w-4 mr-2" />Mark Complete</>)}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {visibleOrders.length === 0 && (
            <Card className="border-0 shadow-sm bg-card rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground text-sm">No {activeTab} orders at the moment</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
