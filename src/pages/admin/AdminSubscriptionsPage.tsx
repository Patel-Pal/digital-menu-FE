import { useState, useEffect } from "react";
import { CreditCard, TrendingUp, Users, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { PageLoader } from "@/components/PageLoader";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@/components/DataTable";
import { FeatureMatrixTable } from "@/components/admin/FeatureMatrixTable";

interface Subscription {
  _id: string;
  name: string;
  ownerId?: { name?: string; email?: string };
  type?: string;
  subscription: string;
  isActive: boolean;
  createdAt: string;
}

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  basic: 9.99,
  premium: 24.99,
  enterprise: 49.99,
};

const columns: ColumnDef<Subscription>[] = [
  {
    id: "shopName",
    header: "Shop",
    searchable: true,
    accessorFn: (row) => row.name,
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
          {row.name.charAt(0)}
        </div>
        <p className="font-medium">{row.name}</p>
      </div>
    ),
  },
  {
    id: "owner",
    header: "Owner",
    searchable: true,
    accessorFn: (row) => row.ownerId?.name ?? "",
    cell: (row) => (
      <div>
        <p className="font-medium">{row.ownerId?.name}</p>
        <p className="text-sm text-muted-foreground">{row.ownerId?.email}</p>
      </div>
    ),
  },
  {
    id: "plan",
    header: "Plan",
    accessorFn: (row) => row.subscription,
    cell: (row) => (
      <Badge
        variant={
          row.subscription === "premium"
            ? "default"
            : row.subscription === "basic"
              ? "secondary"
              : "outline"
        }
      >
        {row.subscription}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
    cell: (row) => (
      <Badge variant={row.isActive ? "success" : "destructive"}>
        {row.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "price",
    header: "Price",
    accessorFn: (row) => PLAN_PRICES[row.subscription] ?? 0,
    cell: (row) => (
      <span className="font-bold">
        ₹{(PLAN_PRICES[row.subscription] ?? 0).toFixed(2)}/mo
      </span>
    ),
  },
  {
    id: "createdAt",
    header: "Created",
    accessorFn: (row) => row.createdAt,
    cell: (row) => (
      <span className="text-muted-foreground">
        {new Date(row.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSubscriptions();
      setSubscriptions(response.data);
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading subscriptions..." />;
  }

  const subscriptionList: Subscription[] = subscriptions?.subscriptions ?? [];
  const totalShops = subscriptionList.length;
  const premiumCount = subscriptions?.distribution?.find((d: any) => d._id === 'premium')?.count || 0;
  const basicCount = subscriptions?.distribution?.find((d: any) => d._id === 'basic')?.count || 0;
  const freeCount = subscriptions?.distribution?.find((d: any) => d._id === 'free')?.count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage plans and billing</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Monthly Revenue" 
          value={`$${subscriptions?.monthlyRevenue?.toFixed(2) || '0.00'}`} 
          change="Estimated" 
          changeType="positive" 
          icon={<DollarSign className="h-5 w-5" />} 
        />
        <StatCard 
          title="Active Subs" 
          value={subscriptions?.activeSubscriptions?.toString() || "0"} 
          change="Paid plans" 
          changeType="positive" 
          icon={<Users className="h-5 w-5" />} 
        />
        <StatCard 
          title="Premium Plans" 
          value={premiumCount.toString()} 
          change="Highest tier" 
          changeType="positive" 
          icon={<CreditCard className="h-5 w-5" />} 
        />
        <StatCard 
          title="Total Shops" 
          value={totalShops.toString()} 
          change="All plans" 
          changeType="positive" 
          icon={<TrendingUp className="h-5 w-5" />} 
        />
      </div>

      {/* Plan Distribution */}
      <Card variant="elevated">
        <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Premium</span>
                <span className="font-medium">{premiumCount} shops ({totalShops > 0 ? Math.round((premiumCount / totalShops) * 100) : 0}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary" 
                  style={{ width: `${totalShops > 0 ? (premiumCount / totalShops) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Basic</span>
                <span className="font-medium">{basicCount} shops ({totalShops > 0 ? Math.round((basicCount / totalShops) * 100) : 0}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-accent" 
                  style={{ width: `${totalShops > 0 ? (basicCount / totalShops) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Free</span>
                <span className="font-medium">{freeCount} shops ({totalShops > 0 ? Math.round((freeCount / totalShops) * 100) : 0}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-muted-foreground" 
                  style={{ width: `${totalShops > 0 ? (freeCount / totalShops) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Matrix */}
      <FeatureMatrixTable />

      {/* Subscriptions Table */}
      <DataTable<Subscription>
        mode="client"
        columns={columns}
        data={subscriptionList}
        search={{ placeholder: "Search by shop or owner..." }}
        loading={false}
        emptyState={{
          title: "No subscriptions found",
          description: "There are no subscription records to display.",
        }}
      />
    </div>
  );
}
