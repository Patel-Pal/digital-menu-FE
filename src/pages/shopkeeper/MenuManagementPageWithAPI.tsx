import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddMenuItemForm } from "@/components/AddMenuItemForm";
import { useMenu, useUpdateMenuItem } from "@/hooks/useMenu";
import { useAuth } from "@/contexts/AuthContext";
import type { MenuItem } from "@/types";

export function MenuManagementPageWithAPI() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { user } = useAuth();
  const { data: menuData, isLoading } = useMenu(user?.shopId || "");
  const updateMenuItem = useUpdateMenuItem();

  const menu = menuData?.data;
  const categories = menu?.categories || [];
  const allItems = menu?.items || [];

  // Filter items
  const filteredItems = allItems.filter((item: MenuItem) => {
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailability = async (item: MenuItem) => {
    if (!menu) return;
    
    try {
      await updateMenuItem.mutateAsync({
        menuId: menu.id,
        itemId: item.id,
        item: { available: !item.available }
      });
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Manage your menu items and categories
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search menu items..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Categories</option>
          {categories.map((category: any) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        {filteredItems.map((item: MenuItem) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Item Image */}
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                      {item.vegetarian && (
                        <Badge variant="outline" className="text-xs">
                          Vegetarian
                        </Badge>
                      )}
                      {item.spicy && (
                        <Badge variant="destructive" className="text-xs">
                          Spicy
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <p className="font-semibold text-primary">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAvailability(item)}
                      disabled={updateMenuItem.isPending}
                    >
                      {item.available ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "No items found matching your search" : "No menu items yet"}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}

      {/* Add Item Form Modal */}
      {showAddForm && (
        <AddMenuItemForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          categories={categories}
        />
      )}
    </div>
  );
}
