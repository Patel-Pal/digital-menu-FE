import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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

// Shopkeeper Pages
import { ShopkeeperDashboard } from "@/pages/shopkeeper/ShopkeeperDashboard";
import { MenuManagementPage } from "@/pages/shopkeeper/MenuManagementPage";
import { CategoryManagementPage } from "@/pages/shopkeeper/CategoryManagementPage";
import { QRCodePage } from "@/pages/shopkeeper/QRCodePage";
import { OrdersManagementPage } from "@/pages/shopkeeper/OrdersManagementPage";
import { ShopkeeperAnalyticsPage } from "@/pages/shopkeeper/ShopkeeperAnalyticsPage";
import { ShopkeeperBillingPage } from "@/pages/shopkeeper/ShopkeeperBillingPage";
import { ShopSettingsPage } from "@/pages/shopkeeper/ShopSettingsPage";
import { ShopDetailsFormPage } from "@/pages/shopkeeper/ShopDetailsFormPage";
import { ShopAboutFormPage } from "@/pages/shopkeeper/ShopAboutFormPage";

// Customer Pages
import { CustomerMenuPage } from "@/pages/customer/CustomerMenuPage";
import { LandingPage } from "@/pages/LandingPageEnhanced";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrderProvider>
        <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              </Route>

              <Route path="/shop" element={<ShopkeeperLayout />}>
                <Route index element={<ShopkeeperDashboard />} />
                <Route path="menu" element={<MenuManagementPage />} />
                <Route path="categories" element={<CategoryManagementPage />} />
                <Route path="qr" element={<QRCodePage />} />
                <Route path="orders" element={<OrdersManagementPage />} />
                <Route path="analytics" element={<ShopkeeperAnalyticsPage />} />
                <Route path="billing" element={<ShopkeeperBillingPage />} />
                <Route path="settings" element={<ShopSettingsPage />} />
                <Route path="details" element={<ShopDetailsFormPage />} />
                <Route path="about" element={<ShopAboutFormPage />} />
              </Route>

              <Route element={<CustomerLayout />}>
                <Route path="/menu" element={<CustomerMenuPage />} />
                <Route path="/menu/:shopId" element={<CustomerMenuPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </OrderProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
