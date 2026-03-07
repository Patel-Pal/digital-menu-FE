import { Navigate, useLocation } from "react-router-dom";
import { useShopSetup } from "@/contexts/ShopSetupContext";
import { PageLoader } from "@/components/PageLoader";

export function ShopSetupGuard({ children }: { children: React.ReactNode }) {
  const { isSetupComplete, isLoading } = useShopSetup();
  const location = useLocation();

  // While loading, show a loader — don't redirect prematurely
  if (isLoading) {
    return <PageLoader message="Checking shop setup..." />;
  }

  // Setup is complete — always allow through (dashboard, menu, etc.)
  if (isSetupComplete) {
    return <>{children}</>;
  }

  // Setup is NOT complete — allow settings page so they can fill info
  const allowedPaths = ["/shop/settings", "/shop/details", "/shop/about"];
  const isAllowed = allowedPaths.some((p) => location.pathname.startsWith(p));

  if (!isAllowed) {
    return <Navigate to="/shop/settings" state={{ fromSetupGuard: true }} replace />;
  }

  return <>{children}</>;
}
