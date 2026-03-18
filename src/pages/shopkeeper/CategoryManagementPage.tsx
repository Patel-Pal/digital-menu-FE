import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PageLoader } from "@/components/PageLoader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { categoryService, type Category, type CreateCategoryData, type UpdateCategoryData } from "@/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@/components/DataTable";

export function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "", order: 0 });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [mobileSearch, setMobileSearch] = useState("");

  const { user } = useAuth();
  const shopId = user?.shopId;

  useEffect(() => {
    if (shopId) fetchCategories();
  }, [shopId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategoriesForManagement(shopId);
      setCategories(response.data || []);
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await categoryService.createCategory({ ...formData, shopId, order: formData.order || categories.length + 1 } as CreateCategoryData);
      toast.success("Category created successfully");
      setIsCreateOpen(false);
      setFormData({ name: "", description: "", icon: "", order: 0 });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    try {
      await categoryService.updateCategory(editingCategory._id, { name: formData.name, description: formData.description, icon: formData.icon, order: formData.order } as UpdateCategoryData);
      toast.success("Category updated successfully");
      setIsEditOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", icon: "", order: 0 });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await categoryService.toggleCategoryStatus(category._id);
      toast.success(`Category ${category.isActive ? "deactivated" : "activated"}`);
      fetchCategories();
    } catch {
      toast.error("Failed to toggle category status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryService.deleteCategory(deleteTarget._id);
      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "", icon: category.icon || "", order: category.order });
    setIsEditOpen(true);
  };

  const mobileCategories = useMemo(() => {
    if (!mobileSearch) return categories;
    const q = mobileSearch.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [categories, mobileSearch]);

  const columns: ColumnDef<Category>[] = useMemo(() => [
    { id: "icon", header: "Icon", accessorFn: (row) => row.icon ?? "", headerClassName: "w-16", cell: (row) => <span className="text-2xl">{row.icon || "—"}</span> },
    { id: "name", header: "Name", searchable: true, accessorFn: (row) => row.name, cell: (row) => <span className="font-semibold">{row.name}</span> },
    { id: "description", header: "Description", accessorFn: (row) => row.description ?? "", cell: (row) => <span className="text-sm text-muted-foreground line-clamp-1">{row.description || "—"}</span> },
    { id: "order", header: "Order", accessorFn: (row) => row.order, cell: (row) => <span className="text-sm">{row.order}</span> },
    { id: "status", header: "Status", accessorFn: (row) => (row.isActive ? "Active" : "Inactive"), cell: (row) => <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    {
      id: "actions", header: "Actions", accessorFn: () => "", headerClassName: "text-right", cellClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row)}>{row.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ], []);

  const CategoryFormFields = () => (
    <div className="space-y-4">
      <div><Label htmlFor="cat-name">Category Name</Label><Input id="cat-name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Appetizers" /></div>
      <div><Label htmlFor="cat-desc">Description</Label><Textarea id="cat-desc" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" /></div>
      <div><Label htmlFor="cat-icon">Icon (Emoji)</Label><Input id="cat-icon" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="🥗" /></div>
      <div><Label htmlFor="cat-order">Display Order</Label><Input id="cat-order" type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} placeholder="1" /></div>
    </div>
  );

  if (loading) return <PageLoader message="Loading categories..." />;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground hidden sm:block">Organize your menu items into categories</p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 ml-auto"><Plus className="h-4 w-4" />Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Category</DialogTitle><DialogDescription>Add a new category to organize your menu items</DialogDescription></DialogHeader>
            <CategoryFormFields />
            <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create Category</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." className="pl-9" value={mobileSearch} onChange={e => setMobileSearch(e.target.value)} />
        </div>
        {mobileCategories.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No categories found</CardContent></Card>
        ) : (
          mobileCategories.map(cat => (
            <Card key={cat._id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">{cat.icon || "📁"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{cat.name}</p>
                      <Badge variant={cat.isActive ? "default" : "secondary"} className="text-[10px] h-5 flex-shrink-0">{cat.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                    {cat.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">Order: {cat.order}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => handleToggleStatus(cat)}>
                    {cat.isActive ? <><EyeOff className="h-3.5 w-3.5" />Hide</> : <><Eye className="h-3.5 w-3.5" />Show</>}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openEditDialog(cat)}><Edit className="h-3.5 w-3.5" />Edit</Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-destructive" onClick={() => setDeleteTarget(cat)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop DataTable */}
      <div className="hidden sm:block">
        <DataTable<Category>
          mode="client" columns={columns} data={categories}
          search={{ placeholder: "Search categories..." }} loading={false}
          emptyState={{ title: "No categories found", description: "Create your first category to organize your menu." }}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Category</DialogTitle><DialogDescription>Update category information</DialogDescription></DialogHeader>
          <CategoryFormFields />
          <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleUpdate}>Update Category</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All menu items in this category may be affected.`}
        confirmLabel="Delete" variant="destructive" onConfirm={confirmDelete}
      />
    </div>
  );
}
