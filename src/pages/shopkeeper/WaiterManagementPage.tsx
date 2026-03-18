import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  const [mobileSearch, setMobileSearch] = useState("");

  const { user } = useAuth();
  const shopId = user?.shopId;

  useEffect(() => {
    if (shopId) fetchWaiters();
  }, [shopId]);

  const fetchWaiters = async () => {
    try {
      setLoading(true);
      const response = await waiterService.getShopWaiters(shopId!);
      const raw = Array.isArray(response) ? response : (response as any).data ?? [];
      setWaiters(raw.map((w: any) => ({ ...w, id: w.id || w._id })));
    } catch {
      toast.error("Failed to fetch waiters");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) { toast.error("Please fill in all fields"); return; }
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
    if (!editingWaiter || !editForm.name || !editForm.email) { toast.error("Please fill in all fields"); return; }
    try {
      await waiterService.updateWaiter(shopId!, editingWaiter.id, { name: editForm.name, email: editForm.email });
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
      await waiterService.updateWaiter(shopId!, waiter.id, { isActive: !waiter.isActive });
      toast.success(`Waiter ${waiter.isActive ? "deactivated" : "activated"}`);
      fetchWaiters();
    } catch {
      toast.error("Failed to update waiter status");
    }
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

  const mobileWaiters = useMemo(() => {
    if (!mobileSearch) return waiters;
    const q = mobileSearch.toLowerCase();
    return waiters.filter(w => w.name.toLowerCase().includes(q) || w.email.toLowerCase().includes(q));
  }, [waiters, mobileSearch]);

  const columns: ColumnDef<Waiter>[] = useMemo(() => [
    { id: "name", header: "Name", searchable: true, accessorFn: (row) => row.name, cell: (row) => <span className="font-semibold">{row.name}</span> },
    { id: "email", header: "Email", searchable: true, accessorFn: (row) => row.email },
    {
      id: "status", header: "Status", accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
      cell: (row) => <Badge variant={row.isActive ? "default" : "secondary"} className={row.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>{row.isActive ? "Active" : "Inactive"}</Badge>,
    },
    {
      id: "actions", header: "Actions", accessorFn: () => "", headerClassName: "text-right", cellClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Switch checked={row.isActive} onCheckedChange={() => handleToggleActive(row)} aria-label={`Toggle ${row.name} active status`} />
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ], []);

  if (loading) return <PageLoader message="Loading waiters..." />;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground hidden sm:block">Manage waiter accounts for your shop</p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 ml-auto"><Plus className="h-4 w-4" />Add Waiter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Waiter</DialogTitle><DialogDescription>Create a new waiter account for your shop</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div><Label htmlFor="w-name">Name</Label><Input id="w-name" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Waiter name" /></div>
              <div><Label htmlFor="w-email">Email</Label><Input id="w-email" type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="waiter@example.com" /></div>
              <div><Label htmlFor="w-pass">Password</Label><Input id="w-pass" type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Enter password" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create Waiter</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search waiters..." className="pl-9" value={mobileSearch} onChange={e => setMobileSearch(e.target.value)} />
        </div>
        {mobileWaiters.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No waiters found</CardContent></Card>
        ) : (
          mobileWaiters.map(waiter => (
            <Card key={waiter.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{waiter.name}</p>
                      <Badge className={`text-[10px] h-5 flex-shrink-0 ${waiter.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{waiter.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{waiter.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Active</span>
                    <Switch checked={waiter.isActive} onCheckedChange={() => handleToggleActive(waiter)} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openEditDialog(waiter)}><Edit className="h-3.5 w-3.5" />Edit</Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-destructive" onClick={() => setDeleteTarget(waiter)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop DataTable */}
      <div className="hidden sm:block">
        <DataTable<Waiter>
          mode="client" columns={columns} data={waiters}
          search={{ placeholder: "Search waiters..." }} loading={false}
          emptyState={{ title: "No waiters found", description: "Add your first waiter to get started." }}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Waiter</DialogTitle><DialogDescription>Update waiter information</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="ew-name">Name</Label><Input id="ew-name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div><Label htmlFor="ew-email">Email</Label><Input id="ew-email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleUpdate}>Update Waiter</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Waiter"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete" variant="destructive" onConfirm={confirmDelete}
      />
    </div>
  );
}
