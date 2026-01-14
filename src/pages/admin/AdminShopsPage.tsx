import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

export function AdminShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [pagination, setPagination] = useState<any>({});

  useEffect(() => {
    fetchShops();
  }, [searchQuery, statusFilter, subscriptionFilter]);

  const fetchShops = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminService.getAllShops({
        search: searchQuery,
        status: statusFilter === "all" ? undefined : statusFilter,
        subscription: subscriptionFilter === "all" ? undefined : subscriptionFilter,
        page,
        limit: 10
      });
      setShops(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (shopId: string, currentStatus: boolean) => {
    try {
      await adminService.updateShopStatus(shopId, !currentStatus);
      toast.success("Shop status updated");
      fetchShops();
    } catch (error) {
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
      fetchShops();
    } catch (error) {
      toast.error("Failed to delete shop");
    }
  };

  if (loading && shops.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shops</h1>
          <p className="text-muted-foreground">Manage all registered shops ({pagination.total || 0} total)</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <Card variant="elevated" className="hidden lg:block">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Shop</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                <th className="text-left p-4 font-medium text-muted-foreground">QR Scans</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {shop.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">{shop.ownerId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize">{shop.type || 'restaurant'}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={shop.subscription === "premium" ? "default" : shop.subscription === "basic" ? "secondary" : "outline"}>
                      {shop.subscription}
                    </Badge>
                  </td>
                  <td className="p-4 font-medium">{shop.qrScans?.toLocaleString() || 0}</td>
                  <td className="p-4">
                    <Badge variant={shop.isActive ? "success" : "destructive"}>
                      {shop.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(shop.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon-sm"
                        onClick={() => handleStatusToggle(shop._id, shop.isActive)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="text-destructive"
                        onClick={() => handleDeleteShop(shop._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {shops.map((shop, index) => (
          <motion.div
            key={shop._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                      {shop.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{shop.name}</p>
                      <p className="text-sm text-muted-foreground">{shop.ownerId?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{shop.type || 'restaurant'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => handleStatusToggle(shop._id, shop.isActive)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-destructive"
                      onClick={() => handleDeleteShop(shop._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Badge variant={shop.subscription === "premium" ? "default" : "secondary"}>
                      {shop.subscription}
                    </Badge>
                    <Badge variant={shop.isActive ? "success" : "destructive"}>
                      {shop.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{shop.qrScans || 0} scans</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <Button
              key={i + 1}
              variant={pagination.page === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => fetchShops(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
