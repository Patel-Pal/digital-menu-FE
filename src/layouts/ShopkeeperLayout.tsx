import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutDashboard, UtensilsCrossed, FolderOpen, QrCode, BarChart3, Settings, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { title: "Home", href: "/shop", icon: LayoutDashboard },
  { title: "Menu", href: "/shop/menu", icon: UtensilsCrossed },
  { title: "Categories", href: "/shop/categories", icon: FolderOpen },
  { title: "QR Code", href: "/shop/qr", icon: QrCode },
  { title: "Analytics", href: "/shop/analytics", icon: BarChart3 },
  { title: "Settings", href: "/shop/settings", icon: Settings },
];

export function ShopkeeperLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/shop":
        return "Dashboard";
      case "/shop/menu":
        return "Menu Management";
      case "/shop/categories":
        return "Category Management";
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                DM
              </div>
              <div>
                <h1 className="font-semibold">Digital Menu</h1>
                <p className="text-xs text-muted-foreground">Restaurant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle size="sm" />
            </div>
            
            {/* User Info & Logout */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Signed in as <span className="font-medium">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
