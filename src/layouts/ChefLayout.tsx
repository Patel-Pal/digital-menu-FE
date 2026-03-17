import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ChefHat, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationSoundSettings } from "@/contexts/NotificationSoundContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { shopService } from "@/services/shopService";
import { Button } from "@/components/ui/button";

export function ChefLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { playSound } = useNotificationSoundSettings();
  const [shopName, setShopName] = useState("");

  // Fetch shop name on mount
  useEffect(() => {
    const fetchShopName = async () => {
      if (!user?.shopId) return;
      try {
        const response = await shopService.getShopByOwnerId(user.shopId);
        setShopName(response.data?.name || "");
      } catch (error) {
        console.error("Failed to fetch shop:", error);
      }
    };
    fetchShopName();
  }, [user?.shopId]);

  // WebSocket event handler — play sound on new orders
  const handleWebSocketEvent = useCallback(
    (event: string, _data: any) => {
      if (event === "new_order") {
        playSound();
      }
    },
    [playSound]
  );

  // Connect to shop WebSocket room
  useWebSocket({
    room: user?.shopId || "",
    roomType: "shop",
    onEvent: handleWebSocketEvent,
  });

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4">
        <div className="flex items-center gap-2 min-w-0">
          <ChefHat className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-semibold truncate">{shopName || "Digital Menu"}</h1>
            <p className="text-xs text-muted-foreground truncate">{user?.name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive flex-shrink-0"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content — no bottom nav padding needed */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
