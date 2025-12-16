import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import { QRCodePage } from "@/pages/shopkeeper/QRCodePage";
import { ShopkeeperAnalyticsPage } from "@/pages/shopkeeper/ShopkeeperAnalyticsPage";
import { ShopkeeperBillingPage } from "@/pages/shopkeeper/ShopkeeperBillingPage";

// Customer Pages
import { CustomerMenuPage } from "@/pages/customer/CustomerMenuPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to customer menu for demo */}
          <Route path="/" element={<Navigate to="/menu" replace />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="shops" element={<AdminShopsPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="content" element={<AdminContentPage />} />
          </Route>

          {/* Shopkeeper Routes */}
          <Route path="/shop" element={<ShopkeeperLayout />}>
            <Route index element={<ShopkeeperDashboard />} />
            <Route path="menu" element={<MenuManagementPage />} />
            <Route path="qr" element={<QRCodePage />} />
            <Route path="analytics" element={<ShopkeeperAnalyticsPage />} />
            <Route path="billing" element={<ShopkeeperBillingPage />} />
          </Route>

          {/* Customer Routes (Public) */}
          <Route element={<CustomerLayout />}>
            <Route path="/menu" element={<CustomerMenuPage />} />
            <Route path="/menu/:shopId" element={<CustomerMenuPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
