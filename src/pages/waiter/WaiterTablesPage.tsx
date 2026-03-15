import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  LayoutGrid,
  RefreshCw,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderService, type Order } from "@/services/orderService";
import { billingService } from "@/services/billingService";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";

interface TableData {
  tableNumber: string;
  orders: Order[];
  activeCount: number;
  unbilledCompletedOrders: Order[];
  unbilledTotal: number;
}

export function WaiterTablesPage() {
  const { user } = useAuth();
  const shopId = user?.shopId || "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [generatingBillTable, setGeneratingBillTable] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!shopId) return;
    try {
      const response = await orderService.getShopOrders(shopId, undefined, 1, 500, user?.id);
      setOrders(response.data || []);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  // WebSocket: listen for bill_generated and order_status_updated to refetch
  const handleWebSocketEvent = useCallback(
    (event: string, _data: any) => {
      if (event === "bill_generated" || event === "order_status_updated") {
        fetchOrders();
      }
    },
    [fetchOrders]
  );

  useWebSocket({
    room: shopId,
    roomType: "shop",
    onEvent: handleWebSocketEvent,
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Group orders by table and compute aggregates
  const tables: TableData[] = useMemo(() => {
    const tableMap = new Map<string, Order[]>();
    for (const order of orders) {
      if (!order.tableNumber) continue;
      const existing = tableMap.get(order.tableNumber) || [];
      existing.push(order);
      tableMap.set(order.tableNumber, existing);
    }

    const result: TableData[] = [];
    for (const [tableNumber, tableOrders] of tableMap) {
      const activeCount = tableOrders.filter(
        (o) => o.status === "pending" || o.status === "approved"
      ).length;
      const unbilledCompletedOrders = tableOrders.filter(
        (o) => o.status === "completed" && o.billingStatus !== "billed"
      );
      const unbilledTotal = unbilledCompletedOrders.reduce(
        (sum, o) => sum + o.totalAmount,
        0
      );

      // Only show tables with active orders or unbilled completed orders
      if (activeCount > 0 || unbilledCompletedOrders.length > 0) {
        result.push({
          tableNumber,
          orders: tableOrders,
          activeCount,
          unbilledCompletedOrders,
          unbilledTotal,
        });
      }
    }

    // Sort by table number
    result.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
    return result;
  }, [orders]);

  const handleGenerateBill = async (table: TableData) => {
    setGeneratingBillTable(table.tableNumber);
    try {
      // Use the first order's customerName as a fallback
      const customerName = table.unbilledCompletedOrders[0]?.customerName || "Walk-in";
      await billingService.generateBill({
        shopId,
        tableNumber: table.tableNumber,
        customerName,
        deviceId: "",
      });
      toast.success(`Bill generated for Table ${table.tableNumber}`);
      fetchOrders();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate bill"
      );
    } finally {
      setGeneratingBillTable(null);
    }
  };

  const toggleExpand = (tableNumber: string) => {
    setExpandedTable((prev) => (prev === tableNumber ? null : tableNumber));
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: {
        icon: <Clock className="h-3 w-3" />,
        className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
      },
      approved: {
        icon: <CheckCircle className="h-3 w-3" />,
        className: "bg-blue-500/15 text-blue-600 border-blue-500/30",
      },
      completed: {
        icon: <CheckCircle className="h-3 w-3" />,
        className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
      },
      rejected: {
        icon: <XCircle className="h-3 w-3" />,
        className: "bg-red-500/15 text-red-600 border-red-500/30",
      },
    };
    const c = config[status] || config.pending;
    return (
      <Badge className={`${c.className} text-[11px] font-semibold gap-1 px-2 py-0.5`}>
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const groupOrdersByStatus = (tableOrders: Order[]) => {
    const groups: Record<string, Order[]> = {
      pending: [],
      approved: [],
      completed: [],
      rejected: [],
    };
    for (const order of tableOrders) {
      if (groups[order.status]) {
        groups[order.status].push(order);
      }
    }
    return groups;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-4 py-3 space-y-3">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tables</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLoading(true);
              fetchOrders();
            }}
            className="h-8 px-2 text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Table Cards */}
        <div className="space-y-3">
          {tables.map((table) => {
            const isExpanded = expandedTable === table.tableNumber;
            const isGenerating = generatingBillTable === table.tableNumber;
            const hasUnbilledCompleted = table.unbilledCompletedOrders.length > 0;
            const statusGroups = groupOrdersByStatus(table.orders);

            return (
              <Card
                key={table.tableNumber}
                className="border-0 shadow-sm bg-card rounded-xl overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Table Card Header - tappable */}
                  <button
                    className="w-full text-left p-4 focus:outline-none"
                    onClick={() => toggleExpand(table.tableNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-base">
                          {table.tableNumber}
                        </span>
                        <div>
                          <p className="text-sm font-semibold leading-tight">
                            Table {table.tableNumber}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {table.activeCount} active order{table.activeCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {table.unbilledTotal > 0 && (
                          <span className="text-sm font-bold text-primary">
                            ₹{table.unbilledTotal.toFixed(2)}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded: Orders grouped by status */}
                  {isExpanded && (
                    <div className="border-t border-border/50 px-4 pb-4">
                      {(["pending", "approved", "completed", "rejected"] as const).map(
                        (status) => {
                          const groupOrders = statusGroups[status];
                          if (!groupOrders || groupOrders.length === 0) return null;
                          return (
                            <div key={status} className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusBadge(status)}
                                <span className="text-xs text-muted-foreground">
                                  ({groupOrders.length})
                                </span>
                              </div>
                              <div className="space-y-2">
                                {groupOrders.map((order) => (
                                  <div
                                    key={order._id}
                                    className="rounded-lg border border-border/50 p-3"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">
                                        {order.customerName}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatTime(order.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {order.items
                                        .map((i) => `${i.quantity}x ${i.name}`)
                                        .join(", ")}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        {order.billingStatus === "billed" ? (
                                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] px-1.5 py-0">
                                            Billed
                                          </Badge>
                                        ) : null}
                                      </span>
                                      <span className="text-sm font-semibold text-primary">
                                        ₹{order.totalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      )}

                      {/* Generate Bill Button */}
                      {hasUnbilledCompleted && (
                        <Button
                          className="w-full mt-4 rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateBill(table);
                          }}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Generating Bill...
                            </>
                          ) : (
                            <>
                              <Receipt className="h-4 w-4 mr-2" />
                              Generate Bill
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {tables.length === 0 && (
            <Card className="border-0 shadow-sm bg-card rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No active tables</h3>
                <p className="text-muted-foreground text-sm">
                  Tables with active or unbilled orders will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
