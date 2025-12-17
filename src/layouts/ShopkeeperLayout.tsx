import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { LayoutDashboard, UtensilsCrossed, QrCode, BarChart3, Settings } from "lucide-react";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { title: "Home", href: "/shop", icon: LayoutDashboard },
  { title: "Menu", href: "/shop/menu", icon: UtensilsCrossed },
  { title: "QR Code", href: "/shop/qr", icon: QrCode },
  { title: "Analytics", href: "/shop/analytics", icon: BarChart3 },
  { title: "Settings", href: "/shop/settings", icon: Settings },
];

export function ShopkeeperLayout() {
  const location = useLocation();

  // Get page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/shop":
        return "Dashboard";
      case "/shop/menu":
        return "Menu Management";
      case "/shop/qr":
        return "QR Code";
      case "/shop/analytics":
        return "Analytics";
      case "/shop/settings":
        return "Settings";
      default:
        return "Digital Menu";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              RK
            </div>
            <div>
              <h1 className="font-semibold">{getPageTitle()}</h1>
              <p className="text-xs text-muted-foreground">The Rustic Kitchen</p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">JD</span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav items={navItems} />
    </div>
  );
}
