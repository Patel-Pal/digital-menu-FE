import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Leaf, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-card"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-bold">Add Menu Item</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh] p-5 space-y-5">
              {/* Image Upload Placeholder */}
              <div className="flex justify-center">
                <div className="h-32 w-32 rounded-2xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </div>
              </div>

              {/* Name */}
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
                  className="flex w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 min-h-[100px] resize-none"
                />
              </div>

              {/* Price & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    {mockCategories.filter(c => c.id !== "1").map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tags & Attributes</label>
                <div className="grid grid-cols-2 gap-3">
                  <Card variant="outline" className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-success" />
                        <span className="text-sm">Vegetarian</span>
                      </div>
                      <Switch
                        checked={formData.vegetarian}
                        onCheckedChange={(checked) => setFormData({ ...formData, vegetarian: checked })}
                      />
                    </div>
                  </Card>

                  <Card variant="outline" className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-destructive" />
                        <span className="text-sm">Spicy</span>
                      </div>
                      <Switch
                        checked={formData.spicy}
                        onCheckedChange={(checked) => setFormData({ ...formData, spicy: checked })}
                      />
                    </div>
                  </Card>

                  <Card variant="outline" className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-warning" />
                        <span className="text-sm">Popular</span>
                      </div>
                      <Switch
                        checked={formData.popular}
                        onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                      />
                    </div>
                  </Card>

                  <Card variant="outline" className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Available</span>
                      </div>
                      <Switch
                        checked={formData.available}
                        onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                      />
                    </div>
                  </Card>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 safe-bottom">
                <Button type="submit" variant="gradient" size="xl" className="w-full">
                  Add Item
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
