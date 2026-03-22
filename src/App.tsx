import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { NotificationSoundProvider } from "@/contexts/NotificationSoundContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// Layouts
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ShopkeeperLayout } from "@/layouts/ShopkeeperLayout";
import { CustomerLayout } from "@/layouts/CustomerLayout";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminShopsPage } from "@/pages/admin/AdminShopsPage";
import { AdminSubscriptionsPage } from "@/pages/admin/AdminSubscriptionsPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminContentPage } from "@/pages/admin/AdminContentPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";

// Shopkeeper Pages
import { ShopkeeperDashboard } from "@/pages/shopkeeper/ShopkeeperDashboard";
import { MenuManagementPage } from "@/pages/shopkeeper/MenuManagementPage";
import { CategoryManagementPage } from "@/pages/shopkeeper/CategoryManagementPage";
import { QRCodePage } from "@/pages/shopkeeper/QRCodePage";
import { OrdersManagementPage } from "@/pages/shopkeeper/OrdersManagementPage";
import { ShopkeeperAnalyticsPage } from "@/pages/shopkeeper/ShopkeeperAnalyticsPage";
import { BillingManagementPage } from "@/pages/shopkeeper/BillingManagementPage";
import { BillingAnalyticsPage } from "@/pages/shopkeeper/BillingAnalyticsPage";
import { ShopSettingsPage } from "@/pages/shopkeeper/ShopSettingsPage";
import { ShopDetailsFormPage } from "@/pages/shopkeeper/ShopDetailsFormPage";
import { ShopAboutFormPage } from "@/pages/shopkeeper/ShopAboutFormPage";
import { WaiterManagementPage } from "@/pages/shopkeeper/WaiterManagementPage";

// Customer Pages
import { CustomerMenuPage } from "@/pages/customer/CustomerMenuPage";
import { LandingPage } from "@/pages/LandingPageEnhanced";

// Waiter Layout & Pages
import { WaiterLayout } from "@/layouts/WaiterLayout";
import { WaiterMenuPage } from "@/pages/waiter/WaiterMenuPage";
import { WaiterOrdersPage } from "@/pages/waiter/WaiterOrdersPage";
import { WaiterTablesPage } from "@/pages/waiter/WaiterTablesPage";

// Chef Layout & Pages
import { ChefLayout } from "@/layouts/ChefLayout";
import { ChefOrdersPage } from "@/pages/chef/ChefOrdersPage";

// Shopkeeper Chef Management Page
import { ChefManagementPage } from "@/pages/shopkeeper/ChefManagementPage";
import { TableManagementPage } from "@/pages/shopkeeper/TableManagementPage";
import { DiscountManagementPage } from "@/pages/shopkeeper/DiscountManagementPage";

import { Analytics } from "@vercel/analytics/react";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrderProvider>
        <ThemeProvider>
        <NotificationSoundProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Analytics />
          <BrowserRouter>
            <ScrollToTop />
            <OfflineIndicator />
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="shops" element={<AdminShopsPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="content" element={<AdminContentPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              <Route path="/shop" element={<ShopkeeperLayout />}>
                <Route index element={<ShopkeeperDashboard />} />
                <Route path="menu" element={<MenuManagementPage />} />
                <Route path="categories" element={<CategoryManagementPage />} />
                <Route path="qr" element={<QRCodePage />} />
                <Route path="orders" element={<OrdersManagementPage />} />
                <Route path="tables" element={<TableManagementPage />} />
                <Route path="analytics" element={<ShopkeeperAnalyticsPage />} />
                <Route path="billing" element={<BillingManagementPage />} />
                <Route path="billing-analytics" element={<BillingAnalyticsPage />} />
                <Route path="settings" element={<ShopSettingsPage />} />
                <Route path="details" element={<ShopDetailsFormPage />} />
                <Route path="about" element={<ShopAboutFormPage />} />
                <Route path="waiters" element={<WaiterManagementPage />} />
                <Route path="chefs" element={<ChefManagementPage />} />
                <Route path="discounts" element={<DiscountManagementPage />} />
              </Route>

              <Route element={<CustomerLayout />}>
                <Route path="/menu" element={<CustomerMenuPage />} />
                <Route path="/menu/:shopId" element={<CustomerMenuPage />} />
              </Route>

              <Route path="/waiter" element={
                <ProtectedRoute allowedRoles={['waiter']}>
                  <WaiterLayout />
                </ProtectedRoute>
              }>
                <Route index element={<WaiterMenuPage />} />
                <Route path="orders" element={<WaiterOrdersPage />} />
                <Route path="tables" element={<WaiterTablesPage />} />
              </Route>

              <Route path="/chef" element={
                <ProtectedRoute allowedRoles={['chef']}>
                  <ChefLayout />
                </ProtectedRoute>
              }>
                <Route index element={<ChefOrdersPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationSoundProvider>
      </ThemeProvider>
      </OrderProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
