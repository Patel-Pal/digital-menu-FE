import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutDashboard, UtensilsCrossed, FolderOpen, QrCode, BarChart3, Settings, Menu, X, LogOut, ShoppingBag, Receipt, ChevronRight, PanelLeftClose, PanelLeft, Store, Phone, Mail, MapPin, Edit2, User, Building2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { shopService, type Shop } from "@/services/shopService";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { ShopSetupProvider } from "@/contexts/ShopSetupContext";
import { ShopSetupGuard } from "@/components/ShopSetupGuard";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { title: "Home", href: "/shop", icon: LayoutDashboard },
  { title: "Menu", href: "/shop/menu", icon: UtensilsCrossed },
  { title: "Categories", href: "/shop/categories", icon: FolderOpen },
  { title: "Orders", href: "/shop/orders", icon: ShoppingBag },
  { title: "Billing", href: "/shop/billing", icon: Receipt },
  { title: "Billing Analytics", href: "/shop/billing-analytics", icon: BarChart3 },
  { title: "QR Code", href: "/shop/qr", icon: QrCode },
  { title: "Analytics", href: "/shop/analytics", icon: BarChart3 },
  { title: "Settings", href: "/shop/settings", icon: Settings },
];

export function ShopkeeperLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showShopProfile, setShowShopProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const { logout, user } = useAuth();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await shopService.getShopProfile();
        setShop(response.data);
      } catch (error) {
        console.error("Failed to fetch shop:", error);
      }
    };
    
    if (user) {
      fetchShop();
      // Show onboarding guide on first visit
      if (!localStorage.getItem("onboarding_seen")) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  // Listen for profile updates to refresh shop data
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        const fetchShop = async () => {
          try {
            const response = await shopService.getShopProfile();
            setShop(response.data);
          } catch (error) {
            console.error("Failed to fetch shop:", error);
          }
        };
        fetchShop();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

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
      case "/shop/orders":
        return "Orders";
      case "/shop/billing":
        return "Billing";
      case "/shop/billing-analytics":
        return "Billing Analytics";
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

  const getBreadcrumbs = () => {
    const title = getPageTitle();
    if (location.pathname === "/shop") return null;
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/shop" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{title}</span>
      </div>
    );
  };

  return (
    <ShopSetupProvider>
    <AnalyticsProvider>
      <TooltipProvider delayDuration={0}>
        <div className="flex min-h-screen bg-muted/30">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300",
          sidebarCollapsed ? "lg:w-16" : "lg:w-64"
        )}>
          <div className="flex flex-col flex-1 bg-sidebar text-sidebar-foreground">
            {/* Logo - Clickable */}
            <div className="flex h-16 items-center border-b border-sidebar-border px-6">
              <button
                onClick={() => setShowShopProfile(true)}
                className="flex items-center gap-3 min-w-0 flex-1 hover:bg-sidebar-accent/50 rounded-lg px-2 py-1 -mx-2 transition-colors"
                title={sidebarCollapsed ? "View Shop Profile" : undefined}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold overflow-hidden flex-shrink-0">
                  {shop?.logo ? (
                    <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    shop?.name?.charAt(0).toUpperCase() || "D"
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <h1 className="font-bold text-sidebar-primary-foreground truncate">{shop?.name || "Digital Menu"}</h1>
                    <p className="text-xs text-sidebar-foreground/60 truncate">Shopkeeper Portal</p>
                  </div>
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                const navLink = (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      sidebarCollapsed && "justify-center"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {isActive && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </Link>
                );

                return sidebarCollapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {navLink}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : navLink;
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-sidebar-border p-3 space-y-2">
              {!sidebarCollapsed && (
                <div className="px-3 text-xs text-sidebar-foreground/60">
                  Signed in as <span className="font-medium text-sidebar-foreground">{user?.name}</span>
                </div>
              )}
              
              {/* Collapse Toggle Button */}
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="w-full justify-center px-2 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                    >
                      <PanelLeft className="h-5 w-5 flex-shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    Expand sidebar
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="w-full gap-3 justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                >
                  <PanelLeftClose className="h-5 w-5 flex-shrink-0" />
                  <span>Collapse</span>
                </Button>
              )}
              
              {/* Logout Button */}
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full justify-center px-2 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    Logout
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="w-full gap-3 justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground lg:hidden"
              >
                <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setShowShopProfile(true);
                    }}
                    className="flex items-center gap-3 hover:bg-sidebar-accent/50 rounded-lg px-2 py-1 -mx-2 transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold overflow-hidden">
                      {shop?.logo ? (
                        <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        shop?.name?.charAt(0).toUpperCase() || "D"
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-sidebar-primary-foreground">{shop?.name || "Digital Menu"}</span>
                      <p className="text-xs text-sidebar-foreground/60">Shopkeeper Portal</p>
                    </div>
                  </button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.title}
                        {isActive && (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
                
                {/* Mobile User section */}
                <div className="border-t border-sidebar-border p-3 space-y-2">
                  <div className="px-3 text-xs text-sidebar-foreground/60">
                    Signed in as <span className="font-medium text-sidebar-foreground">{user?.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}>
          {/* Top Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur-md px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
              {getBreadcrumbs()}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <ThemeToggle size="sm" />
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden">
                {shop?.logo ? (
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  shop?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "S"
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-6">
            <ShopSetupGuard>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </ShopSetupGuard>
          </main>
        </div>
      </div>

      {/* Shop Profile Dialog */}
      <Dialog open={showShopProfile} onOpenChange={setShowShopProfile}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden">
          {/* Custom Close Button */}
          <button
            onClick={() => setShowShopProfile(false)}
            className="absolute right-4 top-4 z-50 rounded-full p-2 bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header with banner background */}
          <div className="relative h-36 overflow-visible">
            {/* Banner Image or Gradient Fallback */}
            {shop?.banner ? (
              <>
                <img 
                  src={shop.banner} 
                  alt="Shop Banner" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
            )}
            
            <DialogHeader className="relative z-10 p-4">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Profile
              </DialogTitle>
            </DialogHeader>
            
            {/* Shop Logo - Fully visible with overlap */}
            <div className="absolute -bottom-10 left-5 z-20">
              <div className="w-28 h-28 rounded-2xl bg-background shadow-2xl border-4 border-background overflow-hidden ring-2 ring-primary/20">
                {shop?.logo ? (
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Store className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pt-12 pb-5 space-y-4">
            {/* Shop Name and Type */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{shop?.name || user?.name}</h2>
                <Badge variant="secondary" className="capitalize text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  {shop?.type || "Restaurant"}
                </Badge>
              </div>
              {shop?.description && (
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  {shop.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Shop Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                Shop Information
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Phone */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium">Phone</p>
                    <p className="text-xs font-semibold truncate">{shop?.phone || "Not set"}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium">Address</p>
                    <p className="text-xs font-semibold truncate">{shop?.address || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Owner Name */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium">Owner Name</p>
                    <p className="text-xs font-semibold truncate">{user?.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium">Email</p>
                    <p className="text-xs font-semibold truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3">
              <Button 
                onClick={() => {
                  setShowShopProfile(false);
                  navigate('/shop/settings');
                }}
                className="w-full gap-2 h-10"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </TooltipProvider>

      {/* Onboarding Guide */}
      <OnboardingGuide open={showOnboarding} onClose={() => setShowOnboarding(false)} />

    </AnalyticsProvider>
    </ShopSetupProvider>
  );
}
