import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Leaf, Flame, Star, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { categoryService, type Category } from "@/services/categoryService";
import { menuItemService, type MenuItem, type UpdateMenuItemData } from "@/services/menuItemService";
import { uploadService } from "@/services/uploadService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EditMenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: MenuItem;
}

export function EditMenuItemForm({ isOpen, onClose, onSuccess, item }: EditMenuItemFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    available: true,
    popular: false,
    vegetarian: false,
    spicy: false,
    image: ""
  });

  const { user } = useAuth();
  const shopId = user?.shopId;

  useEffect(() => {
    if (isOpen && shopId) {
      fetchCategories();
    }
  }, [isOpen, shopId]);

  useEffect(() => {
    if (isOpen && item) {
      // Populate form with existing item data
      setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price,
        categoryId: item.categoryId._id,
        available: item.available,
        popular: item.popular,
        vegetarian: item.vegetarian,
        spicy: item.spicy,
        image: item.image || ""
      });
      setIngredients(item.ingredients || []);
      setImagePreview(item.image || "");
    }
  }, [isOpen, item]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategoriesForManagement(shopId!);
      setCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    try {
      const response = await uploadService.uploadImage(imageFile);
      return response.data.url;
    } catch (error) {
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Upload image first if selected
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      const data: UpdateMenuItemData = {
        ...formData,
        image: imageUrl,
        ingredients
      };
      
      await menuItemService.updateMenuItem(item._id, data);
      toast.success("Menu item updated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update menu item");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-x-4 top-4 bottom-4 bg-background rounded-2xl shadow-2xl overflow-hidden md:inset-x-auto md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Menu Item</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Margherita Pizza"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the item"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Image</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image">Image URL (Optional)</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label>Or Upload New Image</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="flex-1">
                        <Button type="button" variant="outline" className="w-full cursor-pointer" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {imageFile ? imageFile.name : "Choose New Image"}
                          </span>
                        </Button>
                      </label>
                      {uploadingImage && (
                        <div className="text-sm text-muted-foreground">Uploading...</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {imagePreview && (
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setFormData({ ...formData, image: "" });
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Ingredients</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      placeholder="Add ingredient (e.g., Tomato, Cheese)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addIngredient} size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                      {ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 py-1">
                          {ingredient}
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Popular Item</span>
                    </div>
                    <Switch
                      checked={formData.popular}
                      onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Vegetarian</span>
                    </div>
                    <Switch
                      checked={formData.vegetarian}
                      onCheckedChange={(checked) => setFormData({ ...formData, vegetarian: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Spicy</span>
                    </div>
                    <Switch
                      checked={formData.spicy}
                      onCheckedChange={(checked) => setFormData({ ...formData, spicy: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Available</span>
                    </div>
                    <Switch
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={loading || uploadingImage || !formData.name || !formData.categoryId}
              >
                {loading ? "Updating..." : uploadingImage ? "Uploading..." : "Update Item"}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
