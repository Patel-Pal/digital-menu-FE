import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Leaf, Flame, Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { mockCategories } from "@/utils/mockData";

interface AddMenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: MenuItemFormData) => void;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  available: boolean;
  popular: boolean;
  vegetarian: boolean;
  spicy: boolean;
  image?: string;
}

export function AddMenuItemForm({ isOpen, onClose, onSubmit }: AddMenuItemFormProps) {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: 0,
    categoryId: "2",
    available: true,
    popular: false,
    vegetarian: false,
    spicy: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      description: "",
      price: 0,
      categoryId: "2",
      available: true,
      popular: false,
      vegetarian: false,
      spicy: false,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Add Menu Item</h1>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-60px)]">
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              {/* Image Upload */}
              <div className="flex justify-center">
                <div className="h-28 w-28 rounded-2xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors active:scale-95">
                  <ImagePlus className="h-7 w-7 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </div>
              </div>

              {/* Item Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name *</label>
                <Input
                  placeholder="e.g., Butter Chicken"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Describe your dish..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
                >
                  {mockCategories.filter(c => c.id !== "1").map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tags & Attributes</label>
                <div className="space-y-3">
                  {/* Vegetarian */}
                  <div className="flex items-center justify-between rounded-xl border-2 border-input bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                        <Leaf className="h-5 w-5 text-success" />
                      </div>
                      <span className="font-medium">Vegetarian</span>
                    </div>
                    <Switch
                      checked={formData.vegetarian}
                      onCheckedChange={(checked) => setFormData({ ...formData, vegetarian: checked })}
                    />
                  </div>

                  {/* Spicy */}
                  <div className="flex items-center justify-between rounded-xl border-2 border-input bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                        <Flame className="h-5 w-5 text-destructive" />
                      </div>
                      <span className="font-medium">Spicy</span>
                    </div>
                    <Switch
                      checked={formData.spicy}
                      onCheckedChange={(checked) => setFormData({ ...formData, spicy: checked })}
                    />
                  </div>

                  {/* Popular */}
                  <div className="flex items-center justify-between rounded-xl border-2 border-input bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                        <Star className="h-5 w-5 text-warning" />
                      </div>
                      <span className="font-medium">Mark as Popular</span>
                    </div>
                    <Switch
                      checked={formData.popular}
                      onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                    />
                  </div>

                  {/* Available */}
                  <div className="flex items-center justify-between rounded-xl border-2 border-input bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      </div>
                      <span className="font-medium">Available for Order</span>
                    </div>
                    <Switch
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="sticky bottom-0 border-t border-border bg-background p-4 safe-bottom">
              <Button type="submit" variant="gradient" size="xl" className="w-full">
                Add Item
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
