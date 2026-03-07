import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddMenuItemForm } from "@/components/AddMenuItemForm";
import { EditMenuItemForm } from "@/components/EditMenuItemForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { menuItemService, type MenuItem } from "@/services/menuItemService";
import { categoryService, type Category } from "@/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";
import { PageLoader } from "@/components/PageLoader";
import { SkeletonCard } from "@/components/SkeletonCard";

export function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const { user } = useAuth();
  const shopId = user?.shopId;
  const debouncedSearch = useDebounce(searchQuery, 300);

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
    // Optimistic update
    setMenuItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
    try {
      await menuItemService.toggleMenuItemStatus(item._id);
      toast.success(`Menu item ${item.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      // Revert on failure
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

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.categoryId._id === activeCategory;
    const matchesSearch = debouncedSearch
      ? item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-4">
          <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        </div>
        <SkeletonCard count={4} variant="menu-item" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items</p>
        </div>
        
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className={`transition-all ${!item.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {item.popular && <Badge variant="outline">Popular</Badge>}
                          {item.vegetarian && <Badge variant="outline" className="text-green-600">Vegetarian</Badge>}
                          {item.spicy && <Badge variant="outline" className="text-red-600">Spicy</Badge>}
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2">
                          <span className="font-semibold text-lg">₹{item.price.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.categoryId.icon} {item.categoryId.name}
                          </span>
                        </div>
                        
                        {item.ingredients && item.ingredients.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Ingredients:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.ingredients.map((ingredient, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(item)}
                        >
                          {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {filteredItems.length === 0 && (
          <EmptyState
            variant={debouncedSearch || activeCategory !== "all" ? "search" : "menu"}
            title={debouncedSearch || activeCategory !== "all" ? "No items match your filter" : "No menu items yet"}
            description={debouncedSearch || activeCategory !== "all" 
              ? "Try adjusting your search or filter" 
              : "Create your first menu item to get started"}
            actionLabel={!debouncedSearch && activeCategory === "all" ? "Add Menu Item" : undefined}
            onAction={!debouncedSearch && activeCategory === "all" ? () => setShowAddForm(true) : undefined}
          />
        )}
      </div>

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
