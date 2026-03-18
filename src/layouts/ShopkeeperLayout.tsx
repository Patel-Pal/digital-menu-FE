import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UtensilsCrossed, FolderOpen, QrCode, BarChart3, Settings, Menu, X, LogOut, ShoppingBag, Receipt, ChevronRight, PanelLeftClose, PanelLeft, Store, Phone, Mail, MapPin, Edit2, User, Building2, Home, Bell, Clock, CreditCard, Users, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { shopService, type Shop } from "@/services/shopService";
import { orderService, type Order } from "@/services/orderService";
import { billingService, type Bill } from "@/services/billingService";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useNotificationSoundSettings } from "@/contexts/NotificationSoundContext";
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
  { title: "Waiters", href: "/shop/waiters", icon: Users },
  { title: "Chefs", href: "/shop/chefs", icon: ChefHat },
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
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [pendingBillCount, setPendingBillCount] = useState(0);
  const [recentPendingOrders, setRecentPendingOrders] = useState<Order[]>([]);
  const [recentPendingBills, setRecentPendingBills] = useState<Bill[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playSound } = useNotificationSoundSettings();

  const fetchPendingCount = useCallback(async () => {
    if (!user?.shopId) return;
    try {
      const [orderRes, billRes] = await Promise.all([
        orderService.getShopOrders(user.shopId, 'pending', 1, 5),
        billingService.getShopBills(user.shopId, 'pending', 1, 5),
      ]);
      setPendingOrderCount(orderRes.counts?.pending || 0);
      setPendingBillCount(billRes.counts?.pending || 0);
      setRecentPendingOrders(orderRes.data || []);
      setRecentPendingBills(billRes.data || []);
    } catch (error) {
      console.error('Failed to fetch pending counts:', error);
    }
  }, [user?.shopId]);

  // Close notification panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const handleWebSocketEvent = useCallback((event: string, _data: any) => {
    if (event === 'new_order' || event === 'order_status_updated' || event === 'bill_generated' || event === 'payment_received') {
      fetchPendingCount();
      // Play notification sound for incoming events
      if (event === 'new_order' || event === 'bill_generated') {
        playSound();
      }
    }
  }, [fetchPendingCount, playSound]);

  useWebSocket({
    room: user?.shopId || '',
    roomType: 'shop',
    onEvent: handleWebSocketEvent,
  });

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
      fetchPendingCount();
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
      case "/shop/chefs":
        return "Chef Management";
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

            {/* Navigation - scrollable */}
            <nav className="flex-1 overflow-y-auto scrollbar-hide space-y-1 px-3 py-4">
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
                    <div className="relative flex-shrink-0">
                      <Icon className="h-5 w-5" />
                      {item.title === 'Orders' && pendingOrderCount > 0 && sidebarCollapsed && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                          {pendingOrderCount}
                        </span>
                      )}
                      {item.title === 'Billing' && pendingBillCount > 0 && sidebarCollapsed && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-yellow-500 px-1 text-[10px] font-bold text-white">
                          {pendingBillCount}
                        </span>
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.title === 'Orders' && pendingOrderCount > 0 && (
                          <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-500 rounded-full">
                            {pendingOrderCount}
                          </Badge>
                        )}
                        {item.title === 'Billing' && pendingBillCount > 0 && (
                          <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-yellow-500 text-white hover:bg-yellow-500 rounded-full">
                            {pendingBillCount}
                          </Badge>
                        )}
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
                className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground lg:hidden flex flex-col"
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
                <nav className="flex-1 overflow-y-auto scrollbar-hide space-y-1 px-3 py-4">
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
                        <span className="flex-1">{item.title}</span>
                        {item.title === 'Orders' && pendingOrderCount > 0 && (
                          <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-500 rounded-full">
                            {pendingOrderCount}
                          </Badge>
                        )}
                        {item.title === 'Billing' && pendingBillCount > 0 && (
                          <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-yellow-500 text-white hover:bg-yellow-500 rounded-full">
                            {pendingBillCount}
                          </Badge>
                        )}
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
            </div>
            <div className="flex-1" />
            <div
              className="relative"
              ref={notifRef}
              onMouseEnter={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = setTimeout(() => setNotifOpen(true), 200);
              }}
              onMouseLeave={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = setTimeout(() => setNotifOpen(false), 300);
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell className="h-5 w-5" />
                {(pendingOrderCount + pendingBillCount) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse">
                    {pendingOrderCount + pendingBillCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-[380px] max-h-[480px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl z-50"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Notifications</span>
                      </div>
                      {(pendingOrderCount + pendingBillCount) > 0 && (
                        <Badge className="h-5 px-2 text-[10px] font-bold bg-red-500 text-white hover:bg-red-500 rounded-full">
                          {pendingOrderCount + pendingBillCount} pending
                        </Badge>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-[400px]">
                      {/* Pending Orders Section */}
                      {pendingOrderCount > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 border-b border-border/50">
                            <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                              Pending Orders
                            </span>
                            <Badge className="ml-auto h-4 px-1.5 text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-500 rounded-full">
                              {pendingOrderCount}
                            </Badge>
                          </div>
                          <div className="divide-y divide-border/30">
                            {recentPendingOrders.map((order) => (
                              <button
                                key={order._id}
                                onClick={() => { setNotifOpen(false); navigate('/shop/orders'); }}
                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                              >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 flex-shrink-0 mt-0.5">
                                  <Clock className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium truncate">{order.customerName}</span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                      Table {order.tableNumber}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs font-semibold text-primary">???{order.totalAmount.toFixed(2)}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                          {pendingOrderCount > 5 && (
                            <button
                              onClick={() => { setNotifOpen(false); navigate('/shop/orders'); }}
                              className="w-full text-center py-2 text-xs font-medium text-primary hover:bg-muted/50 transition-colors border-t border-border/30"
                            >
                              View all {pendingOrderCount} pending orders ???
                            </button>
                          )}
                        </div>
                      )}

                      {/* Pending Bills Section */}
                      {pendingBillCount > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/5 border-b border-border/50 border-t border-border/50">
                            <CreditCard className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
                              Unpaid Bills
                            </span>
                            <Badge className="ml-auto h-4 px-1.5 text-[10px] font-bold bg-yellow-500 text-white hover:bg-yellow-500 rounded-full">
                              {pendingBillCount}
                            </Badge>
                          </div>
                          <div className="divide-y divide-border/30">
                            {recentPendingBills.map((bill) => (
                              <button
                                key={bill._id}
                                onClick={() => { setNotifOpen(false); navigate('/shop/billing'); }}
                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                              >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 flex-shrink-0 mt-0.5">
                                  <Receipt className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium truncate">{bill.customerName}</span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                      Table {bill.tableNumber}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Bill #{bill.billNumber}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs font-semibold text-primary">???{bill.totalAmount.toFixed(2)}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(bill.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                          {pendingBillCount > 5 && (
                            <button
                              onClick={() => { setNotifOpen(false); navigate('/shop/billing'); }}
                              className="w-full text-center py-2 text-xs font-medium text-primary hover:bg-muted/50 transition-colors border-t border-border/30"
                            >
                              View all {pendingBillCount} unpaid bills ???
                            </button>
                          )}
                        </div>
                      )}

                      {/* Empty State */}
                      {pendingOrderCount === 0 && pendingBillCount === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 px-4">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Bell className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">All caught up</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">No pending orders or unpaid bills</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-6">
            <ShopSetupGuard>
              {getBreadcrumbs() && (
                <div className="mb-3">
                  {getBreadcrumbs()}
                </div>
              )}
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
