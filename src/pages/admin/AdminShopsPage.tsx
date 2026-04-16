import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { PageLoader } from "@/components/PageLoader";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef, FilterConfig, PaginationState } from "@/components/DataTable";
import { ShopFeaturePanel } from "@/components/admin/ShopFeaturePanel";

interface Shop {
  _id: string;
  name: string;
  ownerId?: { _id?: string; name?: string; email?: string };
  type?: string;
  subscription: string;
  qrScans?: number;
  isActive: boolean;
  createdAt: string;
  _profileComplete?: boolean;
  _isStub?: boolean;
}

const filterConfigs: FilterConfig[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    accessorFn: (row: Shop) => (row.isActive ? "active" : "inactive"),
  },
  {
    id: "subscription",
    label: "Plan",
    options: [
      { label: "Free", value: "free" },
      { label: "Basic", value: "basic" },
      { label: "Premium", value: "premium" },
      { label: "Enterprise", value: "enterprise" },
    ],
    accessorFn: (row: Shop) => row.subscription,
  },
  {
    id: "profileStatus",
    label: "Profile",
    options: [
      { label: "Complete", value: "complete" },
      { label: "Incomplete", value: "incomplete" },
    ],
    accessorFn: (row: Shop) => (row._profileComplete ? "complete" : "incomplete"),
  },
];

const columns: ColumnDef<Shop>[] = [
  {
    id: "name",
    header: "Shop",
    accessorFn: (row) => row.name,
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
          {row.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{row.name}</p>
            {!row._profileComplete && (
              <Badge variant="outline" className="text-xs text-orange-500 border-orange-300">
                Profile Incomplete
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{row.ownerId?.email}</p>
        </div>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorFn: (row) => row.type || "—",
    cell: (row) => <span className="capitalize">{row.type || "—"}</span>,
  },
  {
    id: "subscription",
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
    id: "qrScans",
    header: "QR Scans",
    accessorFn: (row) => row.qrScans ?? 0,
    cell: (row) => <span className="font-medium">{(row.qrScans ?? 0).toLocaleString()}</span>,
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

export function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  });

  // Track current query params so callbacks can build on them
  const [queryParams, setQueryParams] = useState<{
    search?: string;
    status?: string;
    subscription?: string;
    profileStatus?: string;
  }>({});
  const queryParamsRef = useRef(queryParams);
  queryParamsRef.current = queryParams;

  const [featurePanelShopId, setFeaturePanelShopId] = useState<string | null>(null);

  const fetchShops = useCallback(
    async (params: { search?: string; status?: string; subscription?: string; profileStatus?: string; page?: number }) => {
      try {
        setLoading(true);
        const response = await adminService.getAllShops({
          search: params.search || undefined,
          status: params.status || undefined,
          subscription: params.subscription || undefined,
          profileStatus: params.profileStatus || undefined,
          page: params.page ?? 1,
          limit: 10,
        });
        setShops(response.data);
        setPagination({
          currentPage: response.pagination.page,
          pageSize: response.pagination.limit,
          totalItems: response.pagination.total,
        });
      } catch {
        toast.error("Failed to fetch shops");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchShops({});
  }, [fetchShops]);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchShops({ ...queryParamsRef.current, page });
    },
    [fetchShops]
  );

  const handleSearch = useCallback(
    (query: string) => {
      const next = { ...queryParamsRef.current, search: query };
      setQueryParams(next);
      fetchShops({ ...next, page: 1 });
    },
    [fetchShops]
  );

  const handleFilterChange = useCallback(
    (filters: Record<string, string>) => {
      const next = { ...queryParamsRef.current, ...filters };
      setQueryParams(next);
      fetchShops({ ...next, page: 1 });
    },
    [fetchShops]
  );

  const handleStatusToggle = async (shopId: string, currentStatus: boolean) => {
    try {
      await adminService.updateShopStatus(shopId, !currentStatus);
      toast.success("Shop status updated");
      fetchShops({ ...queryParams, page: pagination.currentPage });
    } catch {
      toast.error("Failed to update shop status");
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
      return;
    }
    try {
      await adminService.deleteShop(shopId);
      toast.success("Shop deleted successfully");
      fetchShops({ ...queryParams, page: pagination.currentPage });
    } catch {
      toast.error("Failed to delete shop");
    }
  };

  // Actions column needs access to handlers, so we define it here
  const actionsColumn: ColumnDef<Shop> = {
    id: "actions",
    header: "Actions",
    headerClassName: "text-right",
    cellClassName: "text-right",
    accessorFn: () => null,
    cell: (row) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => !row._isStub && setFeaturePanelShopId(row._id)}
          title={row._isStub ? "No shop profile yet" : "Manage features"}
          disabled={!!row._isStub}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleStatusToggle(row._id, row.isActive)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive"
          onClick={() => !row._isStub && handleDeleteShop(row._id)}
          disabled={!!row._isStub}
          title={row._isStub ? "No shop to delete" : "Delete shop"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  };

  const allColumns = [...columns, actionsColumn];

  if (loading && shops.length === 0) {
    return <PageLoader message="Loading shops..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shops</h1>
          <p className="text-muted-foreground">
            Manage all registered shops ({pagination.totalItems} total)
          </p>
        </div>
      </div>

      <DataTable<Shop>
        mode="server"
        columns={allColumns}
        data={shops}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        search={{ placeholder: "Search shops..." }}
        filters={filterConfigs}
        loading={loading}
        emptyState={{
          title: "No shops found",
          description: "Try adjusting your search or filter criteria.",
        }}
      />

      {/* Feature Panel Dialog */}
      <Dialog
        open={featurePanelShopId !== null}
        onOpenChange={(open) => {
          if (!open) setFeaturePanelShopId(null);
        }}
      >
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Features</DialogTitle>
            <DialogDescription>
              Update subscription plan and feature overrides for this shop.
            </DialogDescription>
          </DialogHeader>
          {featurePanelShopId && (
            <ShopFeaturePanel
              shopId={featurePanelShopId}
              onClose={() => setFeaturePanelShopId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
