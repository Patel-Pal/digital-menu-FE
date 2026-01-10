import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MenuItemCard } from "@/components/MenuItemCard";
import { AddMenuItemForm, MenuItemFormData } from "@/components/AddMenuItemForm";
import { mockCategories, mockMenuItems } from "@/utils/mockData";
import type { MenuItem } from "@/types";
import { toast } from "sonner";

export function MenuManagementPage() {
  const [activeCategory, setActiveCategory] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<MenuItem[]>(mockMenuItems);
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "1"
        ? item.popular
        : item.categoryId === activeCategory;
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (itemId: string, available: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available } : item
      )
    );
  };

  const handleAddItem = (formData: MenuItemFormData) => {
    const newItem: MenuItem = {
      id: `new-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      categoryId: formData.categoryId,
      available: formData.available,
      popular: formData.popular,
      vegetarian: formData.vegetarian,
      spicy: formData.spicy,
      image: formData.image,
    };
    setItems((prev) => [newItem, ...prev]);
    toast.success(`${formData.name} added to menu!`);
  };

  return (
    <div className="min-h-screen">
      {/* Search Bar */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search items..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={mockCategories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Items List */}
      <div className="px-4 py-4 space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MenuItemCard
                item={item}
                showToggle
                onToggle={(available) => handleToggle(item.id, available)}
              />
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No items found
            </p>
            <p className="text-sm text-muted-foreground">
              Add your first menu item
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <Button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 shadow-glow"
        size="icon-lg"
        variant="gradient"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Menu Item Form */}
      <AddMenuItemForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddItem}
      />
    </div>
  );
}
