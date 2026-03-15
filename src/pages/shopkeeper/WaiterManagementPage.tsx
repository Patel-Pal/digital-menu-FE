import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PageLoader } from "@/components/PageLoader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { waiterService } from "@/services/waiterService";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@/components/DataTable";
import type { Waiter } from "@/types";

export function WaiterManagementPage() {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [deleteTarget, setDeleteTarget] = useState<Waiter | null>(null);

  const { user } = useAuth();
  const shopId = user?.shopId;

  useEffect(() => {
    if (shopId) {
      fetchWaiters();
    }
  }, [shopId]);

  const fetchWaiters = async () => {
    try {
      setLoading(true);
      const response = await waiterService.getShopWaiters(shopId!);
      const raw = Array.isArray(response) ? response : (response as any).data ?? [];
      // Map _id to id for consistency
      const data = raw.map((w: any) => ({ ...w, id: w.id || w._id }));
      setWaiters(data);
    } catch {
      toast.error("Failed to fetch waiters");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await waiterService.createWaiter(shopId!, createForm);
      toast.success("Waiter created successfully");
      setIsCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "" });
      fetchWaiters();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create waiter");
    }
  };

  const handleUpdate = async () => {
    if (!editingWaiter || !editForm.name || !editForm.email) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await waiterService.updateWaiter(shopId!, editingWaiter.id, {
        name: editForm.name,
        email: editForm.email,
      });
      toast.success("Waiter updated successfully");
      setIsEditOpen(false);
      setEditingWaiter(null);
      setEditForm({ name: "", email: "" });
      fetchWaiters();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update waiter");
    }
  };

  const handleToggleActive = async (waiter: Waiter) => {
    try {
      await waiterService.updateWaiter(shopId!, waiter.id, {
        isActive: !waiter.isActive,
      });
      toast.success(`Waiter ${waiter.isActive ? "deactivated" : "activated"}`);
      fetchWaiters();
    } catch {
      toast.error("Failed to update waiter status");
    }
  };

  const handleDelete = (waiter: Waiter) => {
    setDeleteTarget(waiter);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await waiterService.deleteWaiter(shopId!, deleteTarget.id);
      toast.success("Waiter deleted successfully");
      setDeleteTarget(null);
      fetchWaiters();
    } catch {
      toast.error("Failed to delete waiter");
    }
  };

  const openEditDialog = (waiter: Waiter) => {
    setEditingWaiter(waiter);
    setEditForm({ name: waiter.name, email: waiter.email });
    setIsEditOpen(true);
  };

  const columns: ColumnDef<Waiter>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        searchable: true,
        accessorFn: (row) => row.name,
        cell: (row) => <span className="font-semibold">{row.name}</span>,
      },
      {
        id: "email",
        header: "Email",
        searchable: true,
        accessorFn: (row) => row.email,
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
        cell: (row) => (
          <Badge
            variant={row.isActive ? "default" : "secondary"}
            className={
              row.isActive
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        accessorFn: () => "",
        headerClassName: "text-right",
        cellClassName: "text-right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
            <Switch
              checked={row.isActive}
              onCheckedChange={() => handleToggleActive(row)}
              aria-label={`Toggle ${row.name} active status`}
            />
            <Button variant="ghost" size="sm" onClick={() => openEditDialog(row)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  if (loading) {
    return <PageLoader message="Loading waiters..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Manage waiter accounts for your shop</p>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Waiter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Waiter</DialogTitle>
              <DialogDescription>
                Create a new waiter account for your shop
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="Waiter name"
                />
              </div>
              <div>
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="waiter@example.com"
                />
              </div>
              <div>
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  placeholder="Enter password"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Waiter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Waiter>
        mode="client"
        columns={columns}
        data={waiters}
        search={{ placeholder: "Search waiters..." }}
        loading={false}
        emptyState={{
          title: "No waiters found",
          description: "Add your first waiter to get started.",
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Waiter</DialogTitle>
            <DialogDescription>Update waiter information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Waiter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Waiter"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
