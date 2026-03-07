import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { shopService, type Shop } from "@/services/shopService";
import { useAuth } from "@/contexts/AuthContext";

interface ShopSetupContextType {
  shop: Shop | null;
  isSetupComplete: boolean;
  isLoading: boolean;
  refreshShop: () => Promise<void>;
  setupChecklist: SetupItem[];
}

interface SetupItem {
  key: string;
  label: string;
  done: boolean;
}

const ShopSetupContext = createContext<ShopSetupContextType | undefined>(undefined);

export function useShopSetup() {
  const context = useContext(ShopSetupContext);
  if (!context) throw new Error("useShopSetup must be used within ShopSetupProvider");
  return context;
}

export function ShopSetupProvider({ children }: { children: ReactNode }) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchShop = async () => {
    if (!user || user.role !== "shopkeeper") {
      // Don't set isLoading to false if user hasn't loaded yet
      if (user) setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await shopService.getShopProfile();
      setShop(response.data || null);
    } catch {
      setShop(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, [user]);

  // Listen for profile updates
  useEffect(() => {
    const handler = () => fetchShop();
    window.addEventListener("profileUpdated", handler);
    return () => window.removeEventListener("profileUpdated", handler);
  }, [user]);

  const setupChecklist: SetupItem[] = [
    { key: "phone", label: "Add phone number", done: !!shop?.phone },
    { key: "address", label: "Add shop address", done: !!shop?.address },
    { key: "description", label: "Add shop description", done: !!shop?.description },
  ];

  const isSetupComplete = setupChecklist.every((item) => item.done);

  return (
    <ShopSetupContext.Provider value={{ shop, isSetupComplete, isLoading, refreshShop: fetchShop, setupChecklist }}>
      {children}
    </ShopSetupContext.Provider>
  );
}
