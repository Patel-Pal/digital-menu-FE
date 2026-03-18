import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [mobileSearch, setMobileSearch] = useState("");
  const [mobileCategoryFilter, setMobileCategoryFilter] = useState("__all__");

  const { user } = useAuth();
  const shopId = user?.shopId;

  useKeyboardShortcuts([
    { key: "n", handler: () => setShowAddForm(true), description: "New menu item" },
    { key: "Escape", handler: () => { setShowAddForm(false); setShowEditForm(false); }, description: "Close form" },
  ]);

  useEffect(() => {
    if (shopId) fetchData();
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
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: MenuItem) => {
    setMenuItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
    try {
      await menuItemService.toggleMenuItemStatus(item._id);
      toast.success(`Menu item ${item.isActive ? "deactivated" : "activated"}`);
    } catch {
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
    } catch {
      toast.error("Failed to delete menu item");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  // Mobile filtered items
  const mobileItems = useMemo(() => {
    let items = menuItems;
    if (mobileSearch) {
      const q = mobileSearch.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q));
    }
    if (mobileCategoryFilter !== "__all__") {
      items = items.filter(i => i.categoryId?._id === mobileCategoryFilter);
    }
    return items;
  }, [menuItems, mobileSearch, mobileCategoryFilter]);

  const columns: ColumnDef<MenuItem>[] = useMemo(() => [
    {
      id: "image", header: "Image",
      accessorFn: (row) => row.image ?? "",
      headerClassName: "w-16",
      cell: (row) => (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {row.image ? <img src={row.image} alt={row.name} className="w-full h-full object-cover" loading="lazy" /> : <span className="text-lg">🍽️</span>}
        </div>
      ),
    },
    {
      id: "name", header: "Name", searchable: true,
      accessorFn: (row) => row.name,
      cell: (row) => (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{row.name}</span>
            {row.popular && <Badge variant="outline">Popular</Badge>}
            {row.vegetarian && <Badge variant="outline" className="text-green-600">Veg</Badge>}
            {row.spicy && <Badge variant="outline" className="text-red-600">Spicy</Badge>}
          </div>
          {row.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{row.description}</p>}
        </div>
      ),
    },
    { id: "description", header: "Description", searchable: true, accessorFn: (row) => row.description ?? "", headerClassName: "hidden", cellClassName: "hidden" },
    {
      id: "category", header: "Category",
      accessorFn: (row) => row.categoryId?.name ?? "",
      cell: (row) => <span className="text-sm">{row.categoryId?.icon} {row.categoryId?.name}</span>,
    },
    {
      id: "price", header: "Price",
      accessorFn: (row) => row.price,
      cell: (row) => <span className="font-semibold">₹{row.price.toFixed(2)}</span>,
    },
    {
      id: "status", header: "Status",
      accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
      cell: (row) => <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Active" : "Inactive"}</Badge>,
    },
    {
      id: "actions", header: "Actions",
      accessorFn: () => "",
      headerClassName: "text-right", cellClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row)}>
            {row.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ], []);

  const categoryFilter: FilterConfig[] = useMemo(() => [{
    id: "category", label: "Category",
    options: categories.map(cat => ({ label: `${cat.icon ?? ""} ${cat.name}`.trim(), value: cat._id })),
    accessorFn: (row: MenuItem) => row.categoryId?._id ?? "",
  }], [categories]);

  if (loading) return <PageLoader message="Loading menu items..." />;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground hidden sm:block">Manage your restaurant menu items</p>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 ml-auto">
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </Button>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {/* Mobile search + filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-9" value={mobileSearch} onChange={e => setMobileSearch(e.target.value)} />
          </div>
          <Select value={mobileCategoryFilter} onValueChange={setMobileCategoryFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.icon} {cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {mobileItems.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No menu items found</CardContent></Card>
        ) : (
          mobileItems.map(item => (
            <Card key={item._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start gap-3 p-3">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" /> : <span className="text-2xl">🍽️</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.categoryId?.icon} {item.categoryId?.name || "Uncategorized"}</p>
                        {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                      </div>
                      <p className="font-bold text-primary flex-shrink-0">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant={item.isActive ? "default" : "secondary"} className="text-[10px] h-5">{item.isActive ? "Active" : "Inactive"}</Badge>
                        {item.popular && <Badge variant="outline" className="text-[10px] h-5">Popular</Badge>}
                        {item.vegetarian && <Badge variant="outline" className="text-[10px] h-5 text-green-600">Veg</Badge>}
                        {item.spicy && <Badge variant="outline" className="text-[10px] h-5 text-red-600">Spicy</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleToggleStatus(item)}>
                          {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget(item)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop DataTable */}
      <div className="hidden sm:block">
        <DataTable<MenuItem>
          mode="client"
          columns={columns}
          data={menuItems}
          search={{ placeholder: "Search menu items..." }}
          filters={categoryFilter}
          loading={false}
          emptyState={{ title: "No menu items found", description: "Create your first menu item to get started." }}
        />
      </div>

      <AddMenuItemForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSuccess={fetchData} />
      {editingItem && (
        <EditMenuItemForm isOpen={showEditForm} onClose={() => { setShowEditForm(false); setEditingItem(null); }} onSuccess={fetchData} item={editingItem} />
      )}
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete" variant="destructive" onConfirm={handleDelete}
      />
    </div>
  );
}
