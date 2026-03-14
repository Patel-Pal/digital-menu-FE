import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    order: 0
  });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  
  const { user } = useAuth();
  const shopId = user?.shopId;

  useEffect(() => {
    if (shopId) {
      fetchCategories();
    }
  }, [shopId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategoriesForManagement(shopId);
      setCategories(response.data || []);
    } catch (error: any) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data: CreateCategoryData = {
        ...formData,
        shopId,
        order: formData.order || categories.length + 1
      };
      
      await categoryService.createCategory(data);
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
      const data: UpdateCategoryData = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        order: formData.order
      };
      
      await categoryService.updateCategory(editingCategory._id, data);
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
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}`);
      fetchCategories();
    } catch (error: any) {
      toast.error("Failed to toggle category status");
    }
  };

  const handleDelete = async (category: Category) => {
    setDeleteTarget(category);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryService.deleteCategory(deleteTarget._id);
      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      fetchCategories();
    } catch (error: any) {
      toast.error("Failed to delete category");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      order: category.order
    });
    setIsEditOpen(true);
  };

  const columns: ColumnDef<Category>[] = useMemo(() => [
    {
      id: "icon",
      header: "Icon",
      accessorFn: (row) => row.icon ?? "",
      headerClassName: "w-16",
      cell: (row) => (
        <span className="text-2xl">{row.icon || "—"}</span>
      ),
    },
    {
      id: "name",
      header: "Name",
      searchable: true,
      accessorFn: (row) => row.name,
      cell: (row) => (
        <span className="font-semibold">{row.name}</span>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorFn: (row) => row.description ?? "",
      cell: (row) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.description || "—"}
        </span>
      ),
    },
    {
      id: "order",
      header: "Display Order",
      accessorFn: (row) => row.order,
      cell: (row) => (
        <span className="text-sm">{row.order}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
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
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row)}>
            {row.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
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
  ], []);

  if (loading) {
    return <PageLoader message="Loading categories..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Organize your menu items into categories</p>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>Add a new category to organize your menu items</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Appetizers"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                />
              </div>
              
              <div>
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🥗"
                />
              </div>
              
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="1"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* DataTable */}
      <DataTable<Category>
        mode="client"
        columns={columns}
        data={categories}
        search={{ placeholder: "Search categories..." }}
        loading={false}
        emptyState={{
          title: "No categories found",
          description: "Create your first category to organize your menu.",
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-icon">Icon (Emoji)</Label>
              <Input
                id="edit-icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-order">Display Order</Label>
              <Input
                id="edit-order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All menu items in this category may be affected.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
