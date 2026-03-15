import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Minus, ShoppingCart, UtensilsCrossed, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { menuItemService, type MenuItem } from "@/services/menuItemService";
import { categoryService, type Category } from "@/services/categoryService";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export function WaiterMenuPage() {
  const { user } = useAuth();
  const shopId = user?.shopId || "";

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tableError, setTableError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (shopId) fetchData();
  }, [shopId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        menuItemService.getMenuItemsByShop(shopId),
        categoryService.getCategoriesByShop(shopId),
      ]);
      setMenuItems(menuRes.data || []);
      setCategories(catRes.data || []);
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.categoryId?._id === activeCategory;
      const matchesSearch = searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch && item.isActive;
    });
  }, [menuItems, activeCategory, searchQuery]);

  // --- Cart helpers ---
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) =>
          c.menuItem._id === itemId
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem._id !== itemId));
  };

  const getCartQty = (itemId: string) => {
    return cart.find((c) => c.menuItem._id === itemId)?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, c) => sum + c.menuItem.price * c.quantity,
    0
  );

  // --- Order submission ---
  const handlePlaceOrder = async () => {
    if (!tableNumber.trim()) {
      setTableError("Table number is required");
      return;
    }
    setTableError("");
    setSubmitting(true);
    try {
      await orderService.createOrder({
        shopId,
        customerName: customerName.trim() || "Walk-in",
        tableNumber: tableNumber.trim(),
        deviceId: "",
        items: cart.map((c) => ({
          menuItemId: c.menuItem._id,
          quantity: c.quantity,
        })),
      });
      toast.success("Order placed successfully!");
      setCart([]);
      setTableNumber("");
      setCustomerName("");
      setOrderModalOpen(false);
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="px-4 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  activeCategory === cat._id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const qty = getCartQty(item._id);
            return (
              <Card key={item._id} className="border-0 shadow-sm bg-card rounded-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="mt-3 ml-3 w-20 h-20 bg-muted flex items-center justify-center overflow-hidden rounded-lg flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-2xl">🍽️</span>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm leading-tight">
                          {item.name}
                        </h3>
                        <span className="font-bold text-primary text-sm ml-2">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {item.vegetarian && (
                            <Badge className="text-[10px] h-4 bg-green-100 text-green-600 border-green-200">
                              🌱
                            </Badge>
                          )}
                          {item.spicy && (
                            <Badge className="text-[10px] h-4 bg-red-100 text-red-600 border-red-200">
                              🌶️
                            </Badge>
                          )}
                        </div>
                        {qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon-sm"
                              variant="outline"
                              className="h-7 w-7 rounded-full"
                              onClick={() => updateQuantity(item._id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-semibold w-5 text-center">
                              {qty}
                            </span>
                            <Button
                              size="icon-sm"
                              className="h-7 w-7 rounded-full"
                              onClick={() => updateQuantity(item._id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 px-3 rounded-full text-xs"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredItems.length === 0 && (
            <Card className="border-0 shadow-sm bg-card rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "No menu items available in this category"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-3 pb-1">
          <button
            onClick={() => setOrderModalOpen(true)}
            className="w-full flex items-center justify-between bg-primary text-primary-foreground rounded-xl px-4 py-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">
                {totalItems} item{totalItems > 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-sm font-bold">
              ₹{totalAmount.toFixed(2)} — Place Order
            </span>
          </button>
        </div>
      )}

      {/* Order Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[80vh] overflow-y-auto rounded-xl mx-auto">
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
            <DialogDescription>
              Review items and enter table details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Table Number */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Table Number <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. T1, 5, A3"
                value={tableNumber}
                onChange={(e) => {
                  setTableNumber(e.target.value);
                  if (tableError) setTableError("");
                }}
                error={!!tableError}
              />
              {tableError && (
                <p className="text-xs text-destructive mt-1">{tableError}</p>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Customer Name <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Cart Items */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Order Items ({totalItems})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((c) => (
                  <div
                    key={c.menuItem._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.menuItem.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{c.menuItem.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="h-6 w-6 rounded-full"
                        onClick={() => updateQuantity(c.menuItem._id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold w-5 text-center">
                        {c.quantity}
                      </span>
                      <Button
                        size="icon-sm"
                        className="h-6 w-6 rounded-full"
                        onClick={() => updateQuantity(c.menuItem._id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeFromCart(c.menuItem._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg text-primary">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOrderModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={submitting || cart.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Placing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
