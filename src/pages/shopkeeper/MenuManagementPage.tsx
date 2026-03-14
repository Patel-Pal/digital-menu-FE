import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddMenuItemForm } from "@/components/AddMenuItemForm";
import { EditMenuItemForm } from "@/components/EditMenuItemForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { menuItemService, type MenuItem } from "@/services/menuItemService";
import { categoryService, type Category } from "@/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";
import { PageLoader } from "@/components/PageLoader";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef, FilterConfig } from "@/components/DataTable";

export function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const { user } = useAuth();
  const shopId = user?.shopId;

  useKeyboardShortcuts([
    { key: "n", handler: () => setShowAddForm(true), description: "New menu item" },
    { key: "Escape", handler: () => { setShowAddForm(false); setShowEditForm(false); }, description: "Close form" },
  ]);

  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuResponse, categoryResponse] = await Promise.all([
        menuItemService.getAllMenuItemsForManagement(shopId!),
        categoryService.getAllCategoriesForManagement(shopId!)
      ]);
      
      setMenuItems(menuResponse.data || []);
      setCategories(categoryResponse.data || []);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: MenuItem) => {
    setMenuItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
    try {
      await menuItemService.toggleMenuItemStatus(item._id);
      toast.success(`Menu item ${item.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      setMenuItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: item.isActive } : i));
      toast.error("Failed to toggle menu item status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await menuItemService.deleteMenuItem(deleteTarget._id);
      toast.success("Menu item deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const columns: ColumnDef<MenuItem>[] = useMemo(() => [
    {
      id: "image",
      header: "Image",
      accessorFn: (row) => row.image ?? "",
      headerClassName: "w-16",
      cell: (row) => (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {row.image ? (
            <img src={row.image} alt={row.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="text-lg">🍽️</span>
          )}
        </div>
      ),
    },
    {
      id: "name",
      header: "Name",
      searchable: true,
      accessorFn: (row) => row.name,
      cell: (row) => (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{row.name}</span>
            {row.popular && <Badge variant="outline">Popular</Badge>}
            {row.vegetarian && <Badge variant="outline" className="text-green-600">Vegetarian</Badge>}
            {row.spicy && <Badge variant="outline" className="text-red-600">Spicy</Badge>}
          </div>
          {row.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      searchable: true,
      accessorFn: (row) => row.description ?? "",
      headerClassName: "hidden",
      cellClassName: "hidden",
    },
    {
      id: "category",
      header: "Category",
      accessorFn: (row) => row.categoryId?.name ?? "",
      cell: (row) => (
        <span className="text-sm">
          {row.categoryId?.icon} {row.categoryId?.name}
        </span>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessorFn: (row) => row.price,
      cell: (row) => (
        <span className="font-semibold">₹{row.price.toFixed(2)}</span>
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
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  const categoryFilter: FilterConfig[] = useMemo(() => [
    {
      id: "category",
      label: "Category",
      options: categories.map((cat) => ({
        label: `${cat.icon ?? ""} ${cat.name}`.trim(),
        value: cat._id,
      })),
      accessorFn: (row: MenuItem) => row.categoryId?._id ?? "",
    },
  ], [categories]);

  if (loading) {
    return <PageLoader message="Loading menu items..." />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Manage your restaurant menu items</p>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* DataTable */}
      <DataTable<MenuItem>
        mode="client"
        columns={columns}
        data={menuItems}
        search={{ placeholder: "Search menu items..." }}
        filters={categoryFilter}
        loading={false}
        emptyState={{
          title: "No menu items found",
          description: "Create your first menu item to get started.",
        }}
      />

      {/* Add Menu Item Form */}
      <AddMenuItemForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={fetchData}
      />

      {/* Edit Menu Item Form */}
      {editingItem && (
        <EditMenuItemForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setEditingItem(null);
          }}
          onSuccess={fetchData}
          item={editingItem}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}