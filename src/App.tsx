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
import { FeatureGate } from "@/components/FeatureGate";

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
                <Route path="menu" element={<FeatureGate featureKey="menu_items"><MenuManagementPage /></FeatureGate>} />
                <Route path="categories" element={<FeatureGate featureKey="categories"><CategoryManagementPage /></FeatureGate>} />
                <Route path="qr" element={<FeatureGate featureKey="qr_code"><QRCodePage /></FeatureGate>} />
                <Route path="orders" element={<FeatureGate featureKey="orders"><OrdersManagementPage /></FeatureGate>} />
                <Route path="tables" element={<FeatureGate featureKey="tables"><TableManagementPage /></FeatureGate>} />
                <Route path="analytics" element={<FeatureGate featureKey="analytics"><ShopkeeperAnalyticsPage /></FeatureGate>} />
                <Route path="billing" element={<FeatureGate featureKey="billing"><BillingManagementPage /></FeatureGate>} />
                <Route path="billing-analytics" element={<FeatureGate featureKey="billing_analytics"><BillingAnalyticsPage /></FeatureGate>} />
                <Route path="settings" element={<FeatureGate featureKey="shop_settings"><ShopSettingsPage /></FeatureGate>} />
                <Route path="details" element={<FeatureGate featureKey="shop_settings"><ShopDetailsFormPage /></FeatureGate>} />
                <Route path="about" element={<FeatureGate featureKey="shop_settings"><ShopAboutFormPage /></FeatureGate>} />
                <Route path="waiters" element={<FeatureGate featureKey="waiters"><WaiterManagementPage /></FeatureGate>} />
                <Route path="chefs" element={<FeatureGate featureKey="chefs"><ChefManagementPage /></FeatureGate>} />
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
